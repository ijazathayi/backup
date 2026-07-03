import React from 'react';
import './css/project.css';

const Piano = () => {
  const playNote = (frequency: number) => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 1.5);
  };

  const keys = [
    { note: 'C4', freq: 261.63, type: 'white' },
    { note: 'C#4', freq: 277.18, type: 'black' },
    { note: 'D4', freq: 293.66, type: 'white' },
    { note: 'D#4', freq: 311.13, type: 'black' },
    { note: 'E4', freq: 329.63, type: 'white' },
    { note: 'F4', freq: 349.23, type: 'white' },
    { note: 'F#4', freq: 369.99, type: 'black' },
    { note: 'G4', freq: 392.00, type: 'white' },
    { note: 'G#4', freq: 415.30, type: 'black' },
    { note: 'A4', freq: 440.00, type: 'white' },
    { note: 'A#4', freq: 466.16, type: 'black' },
    { note: 'B4', freq: 493.88, type: 'white' },
    { note: 'C5', freq: 523.25, type: 'white' },
  ];

  return (
    <div className="project-page" style={{ maxWidth: '800px', textAlign: 'center' }}>
      <button className="project-back" onClick={() => (window.location.hash = '')}>Back</button>
      <h2>Virtual Piano</h2>
      <p>Click the keys to play musical notes.</p>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
        height: '250px',
        marginTop: '3rem',
        background: '#1a1a1a',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {keys.map((k, i) => {
          if (k.type === 'white') {
            return (
              <button
                key={k.note}
                onClick={() => playNote(k.freq)}
                style={{
                  width: '60px',
                  height: '200px',
                  background: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '0 0 5px 5px',
                  margin: '0 2px',
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 1,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                  transition: 'background 0.1s'
                }}
                onMouseDown={(e) => e.currentTarget.style.background = '#e0e0e0'}
                onMouseUp={(e) => e.currentTarget.style.background = '#fff'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
              >
                <span style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', color: '#000', fontWeight: 'bold' }}>
                  {k.note}
                </span>
              </button>
            );
          } else {
            return (
              <button
                key={k.note}
                onClick={() => playNote(k.freq)}
                style={{
                  width: '40px',
                  height: '120px',
                  background: '#000',
                  border: '1px solid #000',
                  borderRadius: '0 0 5px 5px',
                  cursor: 'pointer',
                  position: 'absolute',
                  zIndex: 2,
                  left: `calc(50% - 250px + ${i * 32}px)`, // Very rough absolute positioning logic just for aesthetic
                  boxShadow: '0 4px 6px rgba(0,0,0,0.5)',
                  color: '#fff',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  paddingBottom: '10px'
                }}
                onMouseDown={(e) => e.currentTarget.style.background = '#333'}
                onMouseUp={(e) => e.currentTarget.style.background = '#000'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#000'}
              >
                {k.note}
              </button>
            );
          }
        })}
      </div>
    </div>
  );
};

export default Piano;
