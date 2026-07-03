import React, { useState, useEffect } from 'react';
import './css/project.css';

const ColorPaletteGenerator = () => {
  const [colors, setColors] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateHex = () => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  };

  const generatePalette = () => {
    const newColors = Array.from({ length: 5 }, generateHex);
    setColors(newColors);
    setCopiedIndex(null);
  };

  useEffect(() => {
    generatePalette();
  }, []);

  const copyToClipboard = (hex: string, index: number) => {
    navigator.clipboard.writeText(hex);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="project-page" style={{ maxWidth: '1000px', textAlign: 'center' }}>
      <button className="project-back" onClick={() => (window.location.hash = '')}>Back</button>
      <h2>Color Palette Generator</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Click on any color to copy its HEX code.</p>

      <button 
        className="project-btn" 
        onClick={generatePalette}
        style={{ margin: '2rem 0', padding: '12px 30px', fontSize: '1.2rem' }}
      >
        Generate New Palette
      </button>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        height: '400px',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-color)'
      }}>
        {colors.map((color, index) => (
          <div 
            key={index}
            onClick={() => copyToClipboard(color, index)}
            style={{
              flex: '1 1 20%',
              minWidth: '150px',
              backgroundColor: color,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingBottom: '2rem',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              position: 'relative'
            }}
            className="palette-col"
          >
            <div style={{
              background: 'rgba(0,0,0,0.6)',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 'bold',
              letterSpacing: '1px',
              backdropFilter: 'blur(4px)',
              transition: 'all 0.3s'
            }}>
              {copiedIndex === index ? 'COPIED!' : color.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .palette-col:hover {
          transform: translateY(-10px);
          z-index: 10;
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
};

export default ColorPaletteGenerator;
