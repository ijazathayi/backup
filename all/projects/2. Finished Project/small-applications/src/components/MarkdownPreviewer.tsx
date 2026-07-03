import React, { useState } from 'react';
import { marked } from 'marked';
import './css/project.css';

const MarkdownPreviewer = () => {
  const [markdown, setMarkdown] = useState(`# Hello Markdown!

This is a live **Markdown Previewer**.

## Features
- Real-time rendering
- Supports \`inline code\` and code blocks
- Lists:
  1. Easy to use
  2. Side-by-side view

> "Markdown is a text-to-HTML conversion tool for web writers."

[Visit Markdown Guide](https://www.markdownguide.org/)
`);

  // Configure marked to sanitize and add line breaks safely
  marked.setOptions({
    breaks: true,
    gfm: true
  });

  const html = marked.parse(markdown);

  return (
    <div className="project-page" style={{ maxWidth: '1200px' }}>
      <button className="project-back" onClick={() => (window.location.hash = '')}>Back</button>
      <h2 style={{ textAlign: 'center' }}>Markdown Previewer</h2>

      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        height: '65vh', 
        marginTop: '2rem',
        flexWrap: 'wrap'
      }}>
        {/* Editor Pane */}
        <div style={{ 
          flex: '1 1 400px', 
          display: 'flex', 
          flexDirection: 'column',
          background: 'var(--bg-surface)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.05)', 
            padding: '12px 16px', 
            fontWeight: 'bold',
            borderBottom: '1px solid var(--border-color)'
          }}>
            Editor
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            style={{
              flex: 1,
              width: '100%',
              background: 'transparent',
              color: 'var(--text-primary)',
              border: 'none',
              padding: '16px',
              fontFamily: 'monospace',
              fontSize: '1rem',
              resize: 'none',
              outline: 'none',
              lineHeight: '1.5'
            }}
          />
        </div>

        {/* Preview Pane */}
        <div style={{ 
          flex: '1 1 400px', 
          display: 'flex', 
          flexDirection: 'column',
          background: 'var(--bg-surface)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.05)', 
            padding: '12px 16px', 
            fontWeight: 'bold',
            borderBottom: '1px solid var(--border-color)'
          }}>
            Preview
          </div>
          <div 
            className="markdown-preview"
            dangerouslySetInnerHTML={{ __html: html as string }}
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              lineHeight: '1.6',
              wordWrap: 'break-word'
            }}
          />
        </div>
      </div>

      {/* Embedded styles for markdown output to look good in dark mode */}
      <style>{`
        .markdown-preview h1, .markdown-preview h2, .markdown-preview h3 {
          margin-top: 0;
          margin-bottom: 1rem;
          color: var(--accent-color);
        }
        .markdown-preview p {
          margin-bottom: 1rem;
        }
        .markdown-preview a {
          color: #3b82f6;
          text-decoration: underline;
        }
        .markdown-preview blockquote {
          border-left: 4px solid var(--accent-color);
          padding-left: 1rem;
          color: var(--text-secondary);
          margin-left: 0;
          font-style: italic;
        }
        .markdown-preview code {
          background: rgba(255,255,255,0.1);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.9em;
        }
        .markdown-preview ul, .markdown-preview ol {
          padding-left: 2rem;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};

export default MarkdownPreviewer;
