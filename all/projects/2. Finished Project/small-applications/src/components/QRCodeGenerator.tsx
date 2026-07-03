import React, { useState } from 'react';
import './css/project.css';

const QRCodeGenerator = () => {
  const [text, setText] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const generateQR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    setLoading(true);
    // Use QR Server API to generate the image
    const encoded = encodeURIComponent(text);
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}&margin=10`;
    
    // Create an image object to preload and check when it's done
    const img = new Image();
    img.onload = () => {
      setQrUrl(url);
      setLoading(false);
    };
    img.onerror = () => {
      alert('Failed to generate QR code. Please try again.');
      setLoading(false);
    };
    img.src = url;
  };

  const downloadQR = () => {
    if (!qrUrl) return;
    // Fetch the image as a blob to trigger a proper download in browser
    fetch(qrUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'qrcode.png';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(() => alert('Failed to download image'));
  };

  return (
    <div className="project-page" style={{ maxWidth: '800px', textAlign: 'center' }}>
      <button className="project-back" onClick={() => (window.location.hash = '')}>Back</button>
      <h2>QR Code Generator</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Type any text or URL to generate a scannable QR code instantly.</p>

      <form onSubmit={generateQR} style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '2rem' }}>
        <input 
          type="text" 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="https://example.com"
          className="project-input"
          style={{ maxWidth: '400px', marginBottom: 0 }}
        />
        <button type="submit" className="project-btn" disabled={!text.trim() || loading}>
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </form>

      <div style={{ 
        marginTop: '3rem', 
        minHeight: '350px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        {qrUrl ? (
          <div style={{ 
            background: '#fff', 
            padding: '16px', 
            borderRadius: '16px', 
            boxShadow: 'var(--shadow-lg)',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <img src={qrUrl} alt="Generated QR Code" style={{ display: 'block', borderRadius: '8px' }} />
          </div>
        ) : (
          <div style={{ 
            width: '300px', 
            height: '300px', 
            border: '2px dashed var(--border-color)', 
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)'
          }}>
            Your QR Code will appear here
          </div>
        )}

        {qrUrl && (
          <button 
            className="project-btn" 
            onClick={downloadQR} 
            style={{ marginTop: '2rem', background: 'var(--success)' }}
          >
            Download Image
          </button>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default QRCodeGenerator;
