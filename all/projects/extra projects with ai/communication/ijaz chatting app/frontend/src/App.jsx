import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import ChatLayout from './components/ChatLayout';
import './index.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    fetch('/auth/status', { credentials: 'omit' /* For testing without real credentials, but usually 'include' */ })
      // For real application, we must use include
      .catch(e => console.error(e));

    fetch('/auth/status', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setCurrentUser(data.user);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Auth check failed:', err);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    fetch('/auth/logout', { 
        method: 'POST',
        credentials: 'include' 
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCurrentUser(null);
        }
      })
      .catch(console.error);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-primary)', fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <>
      {currentUser ? (
        <ChatLayout currentUser={currentUser} onLogout={handleLogout} />
      ) : (
        <Login />
      )}
    </>
  );
}

export default App;
