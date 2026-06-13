import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper to get GitHub API headers (including authentication if token exists)
const getGithubHeaders = () => {
  const token = process.env.GITHUB_TOKEN;
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'github-repo-viewer-app',
  };
  if (token) {
    headers.Authorization = `token ${token}`;
  }
  return headers;
};

// Test route to verify backend is up
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', authenticated: !!process.env.GITHUB_TOKEN });
});

// Endpoint: Fetch repo information and file tree
app.get('/api/repo', async (req, res) => {
  const { owner, repo, branch } = req.query;

  if (!owner || !repo) {
    return res.status(400).json({ error: 'Parameters "owner" and "repo" are required.' });
  }

  try {
    const headers = getGithubHeaders();

    // 1. Fetch Repository General Information
    const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const repoRes = await axios.get(repoUrl, { headers });
    const repoData = repoRes.data;

    // 2. Fetch Branches
    const branchesUrl = `https://api.github.com/repos/${owner}/${repo}/branches`;
    const branchesRes = await axios.get(branchesUrl, { headers });
    const branches = branchesRes.data.map(b => b.name);

    // Use requested branch or default branch
    const selectedBranch = branch || repoData.default_branch;

    // 3. Fetch File Tree Recursively using Git Trees API
    // The branch name or commit hash serves as the 'tree_sha' parameter
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${selectedBranch}?recursive=1`;
    let fileTree = [];
    try {
      const treeRes = await axios.get(treeUrl, { headers });
      fileTree = treeRes.data.tree || [];
    } catch (treeErr) {
      console.error('Failed to fetch tree recursively. Falling back to root contents.', treeErr.message);
      // Fallback: Fetch root contents if recursive tree fails
      const fallbackUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;
      const fallbackRes = await axios.get(fallbackUrl, { headers });
      fileTree = fallbackRes.data.map(item => ({
        path: item.path,
        type: item.type === 'dir' ? 'tree' : 'blob',
        sha: item.sha,
        size: item.size
      }));
    }

    res.json({
      repoInfo: {
        name: repoData.name,
        fullName: repoData.full_name,
        description: repoData.description,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        language: repoData.language,
        defaultBranch: repoData.default_branch,
        htmlUrl: repoData.html_url,
      },
      selectedBranch,
      branches,
      tree: fileTree,
    });
  } catch (error) {
    console.error('Error in /api/repo:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message;
    res.status(status).json({ error: `Failed to fetch repository details: ${message}` });
  }
});

// Endpoint: Fetch individual file content
app.get('/api/file', async (req, res) => {
  const { owner, repo, path, ref } = req.query;

  if (!owner || !repo || !path) {
    return res.status(400).json({ error: 'Parameters "owner", "repo", and "path" are required.' });
  }

  try {
    const headers = getGithubHeaders();
    const fileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const response = await axios.get(fileUrl, {
      headers,
      params: ref ? { ref } : {},
    });

    const data = response.data;

    // Check if the path points to a directory instead of a file
    if (Array.isArray(data)) {
      return res.status(400).json({ error: 'Path points to a directory, not a file.' });
    }

    // List of common binary file extensions
    const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.pdf', '.zip', '.tar', '.gz', '.mp4', '.mp3', '.woff', '.woff2', '.ttf', '.eot'];
    const fileExtension = path.substring(path.lastIndexOf('.')).toLowerCase();
    const isBinary = binaryExtensions.includes(fileExtension);

    if (isBinary) {
      return res.json({
        name: data.name,
        path: data.path,
        size: data.size,
        isBinary: true,
        downloadUrl: data.download_url,
      });
    }

    // Decode base64 content
    let decodedContent = '';
    if (data.content && data.encoding === 'base64') {
      // Decode base64 handling UTF-8 characters properly
      decodedContent = Buffer.from(data.content, 'base64').toString('utf-8');
    } else {
      // Sometimes file content might be empty or direct text
      decodedContent = data.content || '';
    }

    res.json({
      name: data.name,
      path: data.path,
      size: data.size,
      isBinary: false,
      content: decodedContent,
      downloadUrl: data.download_url,
    });
  } catch (error) {
    console.error('Error in /api/file:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message;
    res.status(status).json({ error: `Failed to fetch file content: ${message}` });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
