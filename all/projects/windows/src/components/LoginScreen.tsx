import React, { useState, useEffect } from 'react';
import { ICONS } from '../assets/icons';
import { Power, Sun, Accessibility, ChevronRight, Search, LayoutGrid, Globe, FolderIcon, MessageSquare } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [time, setTime] = useState(new Date());
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoggingIn(true);
    
    // Play Windows 7 startup sound (keeping this for nostalgia as per initial requirements)
    const audio = new Audio('https://www.winhistory.de/more/win7/win7_startup.mp3');
    audio.play().catch(e => console.log('Audio playback failed', e));

    setTimeout(() => {
      onLogin();
    }, 2000);
  };

  return (
    <div style={styles.container}>
      {/* Background */}
      <div style={styles.background}></div>

      {/* Top Left Clock */}
      <div style={styles.topLeftClock}>
        <div style={styles.largeTime}>{formatTime(time)}</div>
        <div style={styles.smallDate}>{formatDate(time)}</div>
      </div>

      {/* Center Section */}
      <div style={styles.centerSection}>
        <div style={styles.avatarWrapper}>
          <img src={ICONS.USER_AVATAR} alt="Administrator" style={styles.avatar} />
        </div>
        <h1 style={styles.username}>Administrator</h1>
        
        <form onSubmit={handleLogin} style={styles.loginForm}>
          <div style={styles.inputWrapper}>
            <input 
              type="password" 
              placeholder="Sign in" 
              style={styles.loginInput} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <button type="submit" style={styles.arrowButton}>
              <ChevronRight size={20} color="#555" />
            </button>
          </div>
        </form>
      </div>

      {/* Bottom Left Users */}
      <div style={styles.userList}>
        <div style={{...styles.userItem, ...styles.activeUser}}>
          <div style={styles.smallAvatarWrapper}>
             <img src={ICONS.USER_AVATAR} alt="Admin" style={styles.smallAvatar} />
          </div>
          <span>Administrator</span>
        </div>
        <div style={styles.userItem}>
          <div style={styles.smallAvatarWrapper}>
             <img src="https://i.pravatar.cc/150?u=rishav" alt="Rishav" style={styles.smallAvatar} />
          </div>
          <span>Rishav</span>
        </div>
      </div>

      {/* Bottom Right Controls */}
      <div style={styles.bottomControls}>
        <Accessibility size={22} style={styles.controlIcon} />
        <Sun size={22} style={styles.controlIcon} />
        <Power size={22} style={styles.controlIcon} />
      </div>

      {/* Modern Bottom Taskbar */}
      <div style={styles.bottomTaskbar}>
        <div style={styles.taskbarContent}>
           <div style={styles.taskbarLeft}>
              <div style={styles.weatherIcon}>
                <Sun size={14} color="#ffb900" />
                <div style={{marginLeft: '5px'}}>
                   <div style={{fontSize: '10px'}}>Hot weather</div>
                   <div style={{fontSize: '9px', opacity: 0.7}}>Now</div>
                </div>
              </div>
           </div>
           <div style={styles.taskbarCenter}>
              <div style={styles.taskbarSearch}>
                 <Search size={14} color="#555" />
                 <input type="text" placeholder="Search" style={styles.searchInput} disabled />
              </div>
              <div style={styles.taskbarIcons}>
                 <LayoutGrid size={20} color="#0078d4" style={styles.trayIcon} />
                 <FolderIcon size={20} color="#ffb900" style={styles.trayIcon} />
                 <Globe size={20} color="#4285f4" style={styles.trayIcon} />
                 <MessageSquare size={20} color="#25d366" style={styles.trayIcon} />
              </div>
           </div>
           <div style={styles.taskbarRight}>
              <div style={styles.systemInfo}>
                 <span>ENG IN</span>
                 <Sun size={14} />
                 <Power size={14} />
                 <span>14:00</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};


const styles = {
  container: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    overflow: 'hidden',
    fontFamily: "'Segoe UI', sans-serif",
  },
  background: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `url(${ICONS.LOGIN_BG})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    zIndex: -1,
    filter: 'brightness(0.7)',
  },
  topLeftClock: {
    position: 'absolute' as const,
    top: '60px',
    left: '80px',
  },
  largeTime: {
    fontSize: '96px',
    fontWeight: '300',
    lineHeight: '1',
  },
  smallDate: {
    fontSize: '24px',
    fontWeight: '400',
    marginTop: '5px',
    opacity: 0.9,
  },
  centerSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    marginTop: '-50px',
  },
  avatarWrapper: {
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.2)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    marginBottom: '30px',
    background: 'rgba(255,255,255,0.1)',
  },
  avatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  username: {
    fontSize: '48px',
    fontWeight: '400',
    marginBottom: '25px',
    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
  },
  loginForm: {
    width: '320px',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.85)',
    borderRadius: '4px',
    padding: '4px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
  },
  loginInput: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    padding: '10px 15px',
    fontSize: '16px',
    outline: 'none',
    color: '#333',
  },
  arrowButton: {
    background: 'rgba(0,0,0,0.05)',
    border: 'none',
    borderRadius: '4px',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  userList: {
    position: 'absolute' as const,
    bottom: '100px',
    left: '40px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  userItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 20px',
    borderRadius: '8px',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'background 0.2s',
    gap: '15px',
  },
  activeUser: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
  },
  smallAvatarWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  smallAvatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  bottomControls: {
    position: 'absolute' as const,
    bottom: '100px',
    right: '40px',
    display: 'flex',
    gap: '20px',
  },
  controlIcon: {
    cursor: 'pointer',
    opacity: 0.8,
    transition: 'opacity 0.2s',
  },
  bottomTaskbar: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '48px',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    color: '#333',
  },
  taskbarContent: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskbarLeft: {
    flex: 1,
  },
  weatherIcon: {
    display: 'flex',
    alignItems: 'center',
  },
  taskbarCenter: {
    flex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
  },
  taskbarSearch: {
    display: 'flex',
    alignItems: 'center',
    background: '#f3f3f3',
    padding: '5px 15px',
    borderRadius: '20px',
    width: '200px',
    border: '1px solid #ddd',
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    marginLeft: '10px',
    fontSize: '12px',
    width: '100%',
    outline: 'none',
  },
  taskbarIcons: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
  },
  trayIcon: {
    cursor: 'pointer',
    transition: 'transform 0.1s',
  },
  taskbarRight: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  systemInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    fontSize: '11px',
    fontWeight: '600',
  }
};

export default LoginScreen;

