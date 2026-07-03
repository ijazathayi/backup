import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import Desktop from './components/Desktop';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
      {!isLoggedIn ? (
        <LoginScreen onLogin={() => setIsLoggedIn(true)} />
      ) : (
        <Desktop />
      )}
    </>
  );
};

export default App;
