import React, { useState, useMemo } from 'react';
import { Folder, FolderOpen, File, ChevronRight, Search, X } from 'lucide-react';

// Recursive Tree Node Component
const TreeNode = ({ node, expandedFolders, toggleFolder, selectedFile, onSelectFile }) => {
  const isFolder = node.type === 'tree' || node.type === 'dir';
  const isOpen = expandedFolders.has(node.path);

  const sortedChildren = useMemo(() => {
    if (!node.children) return [];
    return Object.values(node.children).sort((a, b) => {
      const aIsFolder = a.type === 'tree' || a.type === 'dir';
      const bIsFolder = b.type === 'tree' || b.type === 'dir';
      if (aIsFolder !== bIsFolder) {
        return aIsFolder ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [node.children]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (isFolder) {
      toggleFolder(node.path);
    } else {
      onSelectFile(node.path);
    }
  };

  return (
    <div className="tree-node">
      <div
        className={`tree-row ${selectedFile === node.path ? 'selected' : ''}`}
        onClick={handleClick}
        style={{ paddingLeft: `${isFolder ? 4 : 20}px` }}
      >
        {isFolder && (
          <span className={`folder-arrow ${isOpen ? 'open' : ''}`}>
            <ChevronRight size={14} />
          </span>
        )}
        <span className="node-icon">
          {isFolder ? (
            isOpen ? (
              <FolderOpen size={16} className="folder-icon" />
            ) : (
              <Folder size={16} className="folder-icon" />
            )
          ) : (
            <File size={15} />
          )}
        </span>
        <span className="node-name" title={node.name}>
          {node.name}
        </span>
      </div>

      {isFolder && isOpen && sortedChildren.length > 0 && (
        <div style={{ marginLeft: '4px' }}>
          {sortedChildren.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function FileTree({ tree, selectedFile, onSelectFile }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  // Build the hierarchical tree from flat API representation
  const rootNode = useMemo(() => {
    const root = { name: 'root', type: 'tree', children: {}, path: '' };
    if (!tree) return root;

    tree.forEach((node) => {
      const parts = node.path.split('/');
      let current = root;

      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        const currentPath = parts.slice(0, index + 1).join('/');

        if (!current.children[part]) {
          current.children[part] = {
            name: part,
            path: currentPath,
            type: isLast ? node.type : 'tree',
            children: {},
          };
        }
        current = current.children[part];
      });
    });
    return root;
  }, [tree]);

  // Handle folder toggle
  const toggleFolder = (path) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  // Filter tree when query is active
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim() || !tree) return [];
    const lowerQuery = searchQuery.toLowerCase();
    return tree.filter(
      (node) =>
        (node.type === 'blob' || node.type === 'file') &&
        node.path.toLowerCase().includes(lowerQuery)
    );
  }, [tree, searchQuery]);

  const sortedRootChildren = useMemo(() => {
    return Object.values(rootNode.children).sort((a, b) => {
      const aIsFolder = a.type === 'tree' || a.type === 'dir';
      const bIsFolder = b.type === 'tree' || b.type === 'dir';
      if (aIsFolder !== bIsFolder) {
        return aIsFolder ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [rootNode.children]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* File Search */}
      <div className="file-search-box">
        <input
          type="text"
          className="file-search-input"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search size={14} className="file-search-icon" />
        {searchQuery && (
          <X
            size={14}
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              color: 'var(--text-muted)'
            }}
            onClick={() => setSearchQuery('')}
          />
        )}
      </div>

      {/* Render Tree or Flat Search Results */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        {searchQuery.trim() ? (
          filteredFiles.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {filteredFiles.map((file) => (
                <div
                  key={file.path}
                  className={`tree-row ${selectedFile === file.path ? 'selected' : ''}`}
                  onClick={() => onSelectFile(file.path)}
                  style={{ paddingLeft: '8px' }}
                >
                  <span className="node-icon">
                    <File size={15} />
                  </span>
                  <span
                    className="node-name"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={file.path}
                  >
                    {file.path}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
              No files found matching "{searchQuery}"
            </p>
          )
        ) : sortedRootChildren.length > 0 ? (
          sortedRootChildren.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
            />
          ))
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
            Empty repository
          </p>
        )}
      </div>
    </div>
  );
}
