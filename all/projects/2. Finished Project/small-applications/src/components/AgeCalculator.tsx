import React, { useState, useEffect } from 'react';
import './css/project.css';

const AgeCalculator = () => {
  const [dob, setDob] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [displayedText, setDisplayedText] = useState('');

  const calculateAge = () => {
    if (!dob) return;
    const birthDate = new Date(dob);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    const d = today.getDate() - birthDate.getDate();

    if (m < 0 || (m === 0 && d < 0)) {
      years--;
    }

    setAge(years);
    setDisplayedText('');
  };

  useEffect(() => {
    if (age !== null) {
      const fullText = `Congrats, You are ${age} years old.`;
      let currentIndex = 0;

      const typeInterval = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setDisplayedText(fullText.substring(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
        }
      }, 50);

      return () => clearInterval(typeInterval);
    }
  }, [age]);

  return (
    <div className="project-page" style={{ maxWidth: '600px', textAlign: 'center' }}>
      <button className="project-back" onClick={() => (window.location.hash = '')}>Back</button>
      <h2>Age Calculator</h2>
      
      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '12px', marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Select your Date of Birth</h3>
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="project-input"
          style={{ maxWidth: '300px', marginBottom: '1.5rem', textAlign: 'center' }}
        />
        <br />
        <button className="project-btn" onClick={calculateAge} style={{ padding: '10px 30px' }}>
          Calculate Age
        </button>

        {age !== null && (
          <div style={{ marginTop: '2rem', fontSize: '1.5rem', color: 'var(--accent-color)', height: '40px' }}>
            {displayedText === '' ? (
              <span></span>
            ) : (
              <span>
                {displayedText}
                <strong style={{ marginLeft: '2px', animation: 'blink 1s step-end infinite' }}>|</strong>
              </span>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default AgeCalculator;
