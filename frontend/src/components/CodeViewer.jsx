import React, { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, Download, FileCode, ImageIcon } from 'lucide-react';

export default function CodeViewer({ fileData, repoInfo, branch }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [fileData]);

  if (!fileData) {
    return (
      <div className="no-repo-selected">
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <FileCode size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p>Select a file from the sidebar to view its contents.</p>
        </div>
      </div>
    );
  }

  const { name, path, size, isBinary, content, downloadUrl } = fileData;

  const formatSize = (bytes) => {
    if (bytes === 0 || !bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const breadcrumbs = path.split('/');

  // Generate lines array for line numbers
  const lines = content ? content.split('\n') : [];

  // Construct GitHub link
  const githubFileUrl = `${repoInfo.htmlUrl}/blob/${branch}/${path}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }} className="fade-in">
      {/* File Path and Header Actions */}
      <div className="viewer-header">
        <div className="file-path-breadcrumbs">
          <span style={{ color: 'var(--text-muted)' }}>{repoInfo.name}</span>
          <span className="breadcrumb-separator">/</span>
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="breadcrumb-separator">/</span>}
                <span style={isLast ? { color: 'var(--text-primary)', fontWeight: '600' } : {}}>{crumb}</span>
              </React.Fragment>
            );
          })}
          <span style={{ marginLeft: '1rem', fontSize: '0.75rem', background: 'var(--bg-tertiary)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--text-muted)' }}>
            {formatSize(size)}
          </span>
        </div>

        <div className="viewer-actions">
          {!isBinary && content && (
            <button className="btn btn-secondary" onClick={handleCopy} title="Copy code">
              {copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          )}
          {downloadUrl && (
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" title="View raw file">
              <Download size={14} />
              <span>Raw</span>
            </a>
          )}
          <a href={githubFileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }} title="View on GitHub">
            <ExternalLink size={14} />
            <span>GitHub</span>
          </a>
        </div>
      </div>

      {/* Code / Media View Pane */}
      {isBinary ? (
        <div className="media-viewer">
          {path.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i) ? (
            <div className="media-preview-container">
              <img src={downloadUrl} alt={name} className="media-preview-img" />
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              <ImageIcon size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <p>Binary file preview is not supported for this type.</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                You can view raw or download it via the actions panel above.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="code-container">
          <div className="code-wrapper">
            <div className="line-numbers">
              {lines.map((_, index) => (
                <div key={index} className="line-number">
                  {index + 1}
                </div>
              ))}
            </div>
            <pre className="code-content">
              {lines.map((line, index) => (
                <div key={index} className="code-line">
                  {line || ' '}
                </div>
              ))}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
