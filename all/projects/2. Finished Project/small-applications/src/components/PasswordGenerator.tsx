import React, { useState } from 'react';
import './css/project.css';

const PasswordGenerator = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    
    let chars = lower;
    if (includeUppercase) chars += upper;
    if (includeNumbers) chars += numbers;
    if (includeSymbols) chars += symbols;

    let generatedPassword = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      generatedPassword += chars[randomIndex];
    }
    
    setPassword(generatedPassword);
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="project-page" style={{ maxWidth: '600px' }}>
      <button className="project-back" onClick={() => (window.location.hash = '')}>Back</button>
      <h2>Password Generator</h2>
      
      <div style={{
        background: 'rgba(0,0,0,0.2)',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid var(--border-color)',
        minHeight: '80px'
      }}>
        <div style={{ 
          fontSize: '1.5rem', 
          fontFamily: 'monospace', 
          wordBreak: 'break-all',
          color: password ? 'var(--text-primary)' : 'var(--text-secondary)'
        }}>
          {password || 'Click Generate'}
        </div>
        <button 
          onClick={copyToClipboard}
          style={{
            background: copied ? 'var(--success)' : 'var(--accent-color)',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: password ? 'pointer' : 'not-allowed',
            opacity: password ? 1 : 0.5,
            transition: 'all 0.2s',
            marginLeft: '1rem',
            whiteSpace: 'nowrap'
          }}
          disabled={!password}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="flex-col gap-4" style={{ marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <label>Password Length</label>
            <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{length}</span>
          </div>
          <input 
            type="range" 
            min="8" 
            max="32" 
            value={length} 
            onChange={(e) => setLength(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-color)' }}
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={includeUppercase} 
            onChange={(e) => setIncludeUppercase(e.target.checked)} 
            style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
          />
          Include Uppercase Letters (A-Z)
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={includeNumbers} 
            onChange={(e) => setIncludeNumbers(e.target.checked)} 
            style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
          />
          Include Numbers (0-9)
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={includeSymbols} 
            onChange={(e) => setIncludeSymbols(e.target.checked)} 
            style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
          />
          Include Symbols (!@#$%)
        </label>
      </div>

      <button 
        className="project-btn" 
        onClick={generatePassword}
        style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}
      >
        Generate Password
      </button>
    </div>
  );
};

export default PasswordGenerator;
