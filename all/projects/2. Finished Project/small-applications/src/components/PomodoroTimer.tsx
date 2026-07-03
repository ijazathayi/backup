import React, { useState, useEffect } from 'react';
import './css/project.css';

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Auto switch mode
      const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
      audio.play().catch(() => {}); // ignore error if auto-play is blocked
      
      setIsBreak(!isBreak);
      setTimeLeft(isBreak ? 25 * 60 : 5 * 60);
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(isBreak ? 5 * 60 : 25 * 60);
  };

  const setMode = (breakMode: boolean) => {
    setIsBreak(breakMode);
    setIsRunning(false);
    setTimeLeft(breakMode ? 5 * 60 : 25 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const progress = isBreak 
    ? ((5 * 60 - timeLeft) / (5 * 60)) * 100 
    : ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  return (
    <div className="project-page" style={{ maxWidth: '600px', textAlign: 'center' }}>
      <button className="project-back" onClick={() => (window.location.hash = '')}>Back</button>
      <h2>Pomodoro Timer</h2>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
        <button 
          className="project-btn" 
          onClick={() => setMode(false)}
          style={{ background: !isBreak ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)' }}
        >
          Work (25m)
        </button>
        <button 
          className="project-btn" 
          onClick={() => setMode(true)}
          style={{ background: isBreak ? 'var(--success)' : 'rgba(255,255,255,0.1)' }}
        >
          Break (5m)
        </button>
      </div>

      <div style={{
        position: 'relative',
        width: '300px',
        height: '300px',
        margin: '3rem auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '50%',
        boxShadow: `0 0 40px ${isBreak ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`
      }}>
        {/* Progress Ring */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          <circle 
            cx="150" cy="150" r="140" 
            fill="none" 
            stroke="rgba(255,255,255,0.05)" 
            strokeWidth="8" 
          />
          <circle 
            cx="150" cy="150" r="140" 
            fill="none" 
            stroke={isBreak ? 'var(--success)' : 'var(--accent-color)'} 
            strokeWidth="8" 
            strokeDasharray="879.64" /* 2 * PI * 140 */
            strokeDashoffset={879.64 - (progress / 100) * 879.64}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>

        <span style={{ 
          fontSize: '5rem', 
          fontWeight: '800', 
          fontFamily: 'var(--font-heading)',
          color: isBreak ? 'var(--success)' : 'var(--text-primary)'
        }}>
          {timeString}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button className="project-btn" onClick={toggleTimer} style={{ width: '120px' }}>
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button className="project-btn project-btn-secondary" onClick={resetTimer}>
          Reset
        </button>
      </div>
    </div>
  );
};

export default PomodoroTimer;
