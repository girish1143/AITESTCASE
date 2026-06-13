import React, { useState } from 'react';
import { Search, Github, Globe, Terminal } from 'lucide-react';

const PRESETS = [
  {
    owner: 'facebook',
    repo: 'react',
    description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
    lang: 'JavaScript',
    langColor: '#f1e05a'
  },
  {
    owner: 'expressjs',
    repo: 'express',
    description: 'Fast, unopinionated, minimalist web framework for Node.js.',
    lang: 'JavaScript',
    langColor: '#f1e05a'
  },
  {
    owner: 'django',
    repo: 'django',
    description: 'The Web framework for perfectionists with deadlines.',
    lang: 'Python',
    langColor: '#3572A5'
  },
  {
    owner: 'tailwindlabs',
    repo: 'tailwindcss',
    description: 'A utility-first CSS framework for rapid UI development.',
    lang: 'TypeScript',
    langColor: '#3178c6'
  }
];

export default function RepoSelector({ onLoadRepo, isLoading }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const parseRepoInput = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return null;

    // Handle full Github URLs (e.g., https://github.com/owner/repo or github.com/owner/repo)
    const githubUrlPattern = /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/#\?]+)/i;
    const match = trimmed.match(githubUrlPattern);

    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
    }

    // Handle "owner/repo" format
    const parts = trimmed.split('/');
    if (parts.length === 2 && parts[0] && parts[1]) {
      return { owner: parts[0], repo: parts[1] };
    }

    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const parsed = parseRepoInput(input);
    if (!parsed) {
      setError('Please enter a valid "owner/repo" or GitHub repository URL.');
      return;
    }

    onLoadRepo(parsed.owner, parsed.repo);
  };

  return (
    <div className="welcome-container fade-in">
      <div className="welcome-card glass">
        <div className="welcome-icon">
          <Github size={40} />
        </div>
        <h1 className="welcome-title gradient-text">Explore GitHub Codebases</h1>
        <p className="welcome-subtitle">
          Paste a GitHub repository URL or type an <code>owner/name</code> below to fetch and browse the codebase interactively.
        </p>

        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            className="search-input"
            placeholder="e.g. facebook/react or https://github.com/facebook/react"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (error) setError('');
            }}
            disabled={isLoading}
          />
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Fetching...' : 'Explore'}
          </button>
        </form>

        {error && (
          <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '-0.5rem' }}>
            {error}
          </p>
        )}

        <div style={{ width: '100%', marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textAlign: 'left', fontWeight: '600' }}>
            Try Quick Examples:
          </h3>
          <div className="presets-grid">
            {PRESETS.map((preset) => (
              <div
                key={`${preset.owner}/${preset.repo}`}
                className="preset-card glass"
                onClick={() => !isLoading && onLoadRepo(preset.owner, preset.repo)}
              >
                <div className="preset-title">
                  {preset.owner}/{preset.repo}
                </div>
                <div className="preset-desc">{preset.description}</div>
                <div className="preset-lang">
                  <span
                    className="lang-dot"
                    style={{ backgroundColor: preset.langColor }}
                  ></span>
                  {preset.lang}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
