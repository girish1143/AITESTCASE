import React, { useState, useEffect } from 'react';
import { Github, Star, GitFork, ArrowLeft, RefreshCw, AlertTriangle, Cpu, Terminal } from 'lucide-react';
import RepoSelector from './components/RepoSelector';
import FileTree from './components/FileTree';
import CodeViewer from './components/CodeViewer';

export default function App() {
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [repoInfo, setRepoInfo] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [tree, setTree] = useState([]);
  
  // Selection and file state
  const [selectedFile, setSelectedFile] = useState('');
  const [fileData, setFileData] = useState(null);

  // Loaders and errors
  const [isLoading, setIsLoading] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileError, setFileError] = useState('');

  // Load repo info and tree
  const loadRepository = async (repoOwner, repoName, branchName = '') => {
    setIsLoading(true);
    setError('');
    setRepoInfo(null);
    setSelectedFile('');
    setFileData(null);
    setFileError('');

    try {
      let url = `/api/repo?owner=${encodeURIComponent(repoOwner)}&repo=${encodeURIComponent(repoName)}`;
      if (branchName) {
        url += `&branch=${encodeURIComponent(branchName)}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch repository information.');
      }

      setOwner(repoOwner);
      setRepo(repoName);
      setRepoInfo(data.repoInfo);
      setBranches(data.branches || []);
      setSelectedBranch(data.selectedBranch || '');
      setTree(data.tree || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load individual file content
  const loadFileContent = async (filePath) => {
    setIsFileLoading(true);
    setFileError('');
    setFileData(null);
    setSelectedFile(filePath);

    try {
      const url = `/api/file?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&path=${encodeURIComponent(filePath)}&ref=${encodeURIComponent(selectedBranch)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch file content.');
      }

      setFileData(data);
    } catch (err) {
      console.error(err);
      setFileError(err.message);
    } finally {
      setIsFileLoading(false);
    }
  };

  const handleBranchChange = (e) => {
    const nextBranch = e.target.value;
    setSelectedBranch(nextBranch);
    loadRepository(owner, repo, nextBranch);
  };

  const resetToHome = () => {
    setOwner('');
    setRepo('');
    setRepoInfo(null);
    setBranches([]);
    setSelectedBranch('');
    setTree([]);
    setSelectedFile('');
    setFileData(null);
    setError('');
    setFileError('');
  };

  // Pre-load default readme if present in tree
  useEffect(() => {
    if (tree && tree.length > 0 && !selectedFile) {
      // Look for root level README files
      const readme = tree.find(
        (node) =>
          (node.type === 'blob' || node.type === 'file') &&
          node.path.toLowerCase().match(/^readme\.md$/i)
      );
      if (readme) {
        loadFileContent(readme.path);
      }
    }
  }, [tree]);

  return (
    <div className="app-container">
      {/* Header Bar */}
      <header className="header glass">
        <div className="logo-container" onClick={resetToHome}>
          <div className="logo-icon">
            <Github size={22} />
          </div>
          <span className="logo-text gradient-accent-text">GitBrowser</span>
        </div>

        {repoInfo && (
          <button className="btn btn-secondary" onClick={resetToHome} style={{ display: 'flex', gap: '0.4rem', fontSize: '0.85rem' }}>
            <ArrowLeft size={14} />
            Explore Another Repo
          </button>
        )}
      </header>

      {/* Main Work Area */}
      {isLoading ? (
        <div className="loader-container">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Fetching repository details...</p>
        </div>
      ) : error ? (
        <div className="error-container fade-in">
          <div className="error-icon">
            <AlertTriangle size={32} />
          </div>
          <h2 className="error-title">Failed to Load</h2>
          <p className="error-message">{error}</p>
          <button className="btn btn-primary" onClick={resetToHome}>
            Try Again
          </button>
        </div>
      ) : !repoInfo ? (
        <RepoSelector onLoadRepo={loadRepository} isLoading={isLoading} />
      ) : (
        <div className="main-layout fade-in">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-header">
              {/* Repo Metadata Header */}
              <div className="repo-header-info">
                <h2 className="repo-name" title={repoInfo.fullName}>
                  {repoInfo.name}
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  by {owner}
                </p>
                <div className="repo-meta-tags">
                  <span className="meta-tag">
                    <Star size={12} style={{ color: '#fbbf24' }} /> {repoInfo.stars.toLocaleString()}
                  </span>
                  <span className="meta-tag">
                    <GitFork size={12} /> {repoInfo.forks.toLocaleString()}
                  </span>
                  {repoInfo.language && (
                    <span className="meta-tag" style={{ borderLeftColor: 'var(--primary)' }}>
                      {repoInfo.language}
                    </span>
                  )}
                </div>
              </div>

              {/* Branch Selection */}
              {branches.length > 0 && (
                <div className="branch-select-container">
                  <div className="select-wrapper">
                    <select
                      className="branch-select"
                      value={selectedBranch}
                      onChange={handleBranchChange}
                    >
                      {branches.map((b) => (
                        <option key={b} value={b}>
                          branch: {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Collapsible tree node views */}
            <div className="sidebar-content">
              <FileTree
                tree={tree}
                selectedFile={selectedFile}
                onSelectFile={loadFileContent}
              />
            </div>
          </aside>

          {/* Code Viewer Panel */}
          <main className="content-pane">
            {isFileLoading ? (
              <div className="loader-container">
                <div className="spinner"></div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading file contents...</p>
              </div>
            ) : fileError ? (
              <div className="error-container">
                <div className="error-icon">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="error-title" style={{ fontSize: '1rem' }}>Failed to Open File</h3>
                <p className="error-message" style={{ fontSize: '0.85rem' }}>{fileError}</p>
                <button
                  className="btn btn-secondary"
                  onClick={() => loadFileContent(selectedFile)}
                  style={{ display: 'flex', gap: '0.4rem', fontSize: '0.8rem' }}
                >
                  <RefreshCw size={12} /> Retry
                </button>
              </div>
            ) : (
              <CodeViewer
                fileData={fileData}
                repoInfo={repoInfo}
                branch={selectedBranch}
              />
            )}
          </main>
        </div>
      )}
    </div>
  );
}
