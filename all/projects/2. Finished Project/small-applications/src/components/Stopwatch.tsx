import React, { useState, useEffect, useRef } from 'react';
import './css/project.css';

const Stopwatch = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else if (!isRunning && timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleStartStop = () => setIsRunning(!isRunning);

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };

  const handleLap = () => {
    setLaps([...laps, time]);
  };

  const formatTime = (timeInMs: number) => {
    const minutes = Math.floor((timeInMs / 60000) % 60);
    const seconds = Math.floor((timeInMs / 1000) % 60);
    const milliseconds = Math.floor((timeInMs / 10) % 100);

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
  };

  return (
    <div className="project-page" style={{ maxWidth: '600px', textAlign: 'center' }}>
      <button className="project-back" onClick={() => (window.location.hash = '')}>Back</button>
      <h2>Stopwatch</h2>
      
      <div style={{
        fontSize: '4rem',
        fontWeight: 'bold',
        fontFamily: 'monospace',
        margin: '2rem 0',
        color: 'var(--accent-color)',
        textShadow: '0 0 20px var(--accent-glow)'
      }}>
        {formatTime(time)}
      </div>

      <div className="flex-center gap-4" style={{ marginBottom: '2rem' }}>
        <button 
          className="project-btn" 
          onClick={handleStartStop}
          style={{ width: '120px', backgroundColor: isRunning ? 'var(--warning)' : 'var(--success)' }}
        >
          {isRunning ? 'Stop' : 'Start'}
        </button>
        <button 
          className="project-btn project-btn-secondary" 
          onClick={handleLap}
          disabled={!isRunning}
          style={{ width: '120px', opacity: isRunning ? 1 : 0.5 }}
        >
          Lap
        </button>
        <button 
          className="project-btn project-btn-secondary" 
          onClick={handleReset}
          style={{ width: '120px' }}
        >
          Reset
        </button>
      </div>

      {laps.length > 0 && (
        <div style={{ textAlign: 'left', marginTop: '2rem', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Laps</h3>
          <ul style={{ listStyle: 'none', padding: 0, maxHeight: '200px', overflowY: 'auto' }}>
            {laps.slice().reverse().map((lapTime, index) => (
              <li key={index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '0.75rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                fontFamily: 'monospace',
                fontSize: '1.1rem'
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>Lap {laps.length - index}</span>
                <span>{formatTime(lapTime)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Stopwatch;
