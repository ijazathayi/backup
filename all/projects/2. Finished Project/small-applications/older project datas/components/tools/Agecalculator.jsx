import React, { useState, useEffect } from 'react';
import logo1 from '../assets/logo1.png';
import { Link } from 'react-router';
import "./css/agecalculator.css"

const Agecalculator = () => {
  const [dob, setDob] = useState('');
  const [age, setAge] = useState(null);
  const [displayedText, setDisplayedText] = useState('');

  const calculateAge = () => { 
    const birthDate = new Date(dob);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    const d = today.getDate() - birthDate.getDate();

    // If birthday hasn't occurred yet this year
    if (m < 0 || (m === 0 && d < 0)) {
      years--;
    }

    setAge(years);
    setDisplayedText(''); // Reset typewriter text
    // console.log(years,m,d)
  };

  // Typewriter effect
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
      }, 50); // Adjust speed: lower = faster, higher = slower

      return () => clearInterval(typeInterval);
    }
  }, [age]);


  return (
    <div id='agecalculator-body' 
    // style={{ textAlign: 'center', marginTop: '50px' }}
    >
      <Link to="/" ><img src={logo1} width="200px" alt="img" 
      style={{cursor:"pointer", 
              left:"0px",
              top:"0", 
              position:"absolute", 


            }}/></Link>
<div id="agecalculator-content">
      <h2>Select your Date of Birth</h2>
      <input
        type="date"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        id='agecalculator-input'
        // style={{ padding: '10px', fontSize: '16px' }}
      />
      <button onClick={calculateAge} style={{ padding: '10px 20px' }}>
        Calculate Age
      </button>
      <div  id='agecalculator-calculated'>
      {age !== null && (
        <div 
        // style={{ marginTop: '20px', fontSize: '18px', color: '#333' }}
        >
          {displayedText === '' ? (
            <span></span>
          ) : (
            <span>
              {displayedText}
              <strong style={{ marginLeft: '2px' }}>|</strong>
            </span>
          )}
        </div>
      )}
      </div></div>
    </div>
  );
};

export default Agecalculator;


      // {age !== null && (
      //   <div  id='agecalculator-calculated'>
      //   // style={{ marginTop: '20px', fontSize: '18px', color: '#333' }}
      //   >
      //     Congrats, You are <strong>{age}</strong> years old.
      //   </div>
      // )}