import React, { useState } from 'react';

const Agecalculator = () => {
  const [dob, setDob] = useState('');
  const [age, setAge] = useState(null);

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
    // console.log(years,m,d)
  };


  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Age Calculator</h2>
      <input
        type="date"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        style={{ padding: '10px', fontSize: '16px' }}
      />
      <br /><br />
      <button onClick={calculateAge} style={{ padding: '10px 20px' }}>
        Calculate Age
      </button>
      {age !== null && (
        <div style={{ marginTop: '20px', fontSize: '18px', color: '#333' }}>
          You are <strong>{age}</strong> years old.
        </div>
      )}
    </div>
  );
};

export default Agecalculator;
