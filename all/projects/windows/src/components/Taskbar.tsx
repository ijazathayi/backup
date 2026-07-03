import React, { useState, useEffect } from 'react';
import { Wifi, Volume2, Battery, ChevronUp } from 'lucide-react';

const Taskbar: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  return (
    <div style={styles.taskbar}>
      <div style={styles.startArea}>
        <div style={styles.startButtonWrapper}>
          <div style={styles.startButton} className="win7-orb">
             <div style={styles.orbCenter}>
                <div style={styles.winLogo}>
                   <div style={{...styles.winPane, backgroundColor: '#f25022'}}></div>
                   <div style={{...styles.winPane, backgroundColor: '#7fba00'}}></div>
                   <div style={{...styles.winPane, backgroundColor: '#00a4ef'}}></div>
                   <div style={{...styles.winPane, backgroundColor: '#ffb900'}}></div>
                </div>
             </div>
          </div>
        </div>
        
        {/* Pinned / Active Apps */}
        <div style={styles.pinnedApps}>
           <div style={styles.appIconWrapper}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Octicons-mark-github.svg/2048px-Octicons-mark-github.svg.png" alt="Github" style={styles.appIcon} />
           </div>
        </div>
      </div>

      <div style={styles.systemTray}>
        <div style={styles.trayIcons}>
          <ChevronUp size={16} color="white" style={styles.trayArrow} />
          <Battery size={16} color="white" style={styles.icon} />
          <Wifi size={16} color="white" style={styles.icon} />
          <Volume2 size={16} color="white" style={styles.icon} />
        </div>
        <div style={styles.clock}>
          <div style={styles.timeStr}>{formatTime(time)}</div>
          <div style={styles.dateStr}>{formatDate(time)}</div>
        </div>
        <div style={styles.showDesktop}></div>
      </div>
    </div>
  );
};

const styles = {
  taskbar: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 9000,
    background: 'linear-gradient(to bottom, rgba(50, 100, 150, 0.5), rgba(0, 30, 60, 0.7))',
    backdropFilter: 'blur(10px)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)',
    borderTop: '1px solid rgba(255,255,255,0.2)',
  },
  startArea: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
  },
  startButtonWrapper: {
    width: '56px',
    height: '56px',
    marginTop: '-16px',
    marginLeft: '5px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))',
    cursor: 'pointer',
    zIndex: 9001,
  },
  startButton: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 30% 30%, #5ab0f7, #143d70)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '2px solid rgba(255,255,255,0.4)',
    boxShadow: 'inset 0 0 10px rgba(255,255,255,0.5)',
    transition: 'transform 0.1s',
  },
  orbCenter: {
    width: '24px',
    height: '24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  winLogo: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: '1px',
    width: '18px',
    height: '18px',
    transform: 'perspective(100px) rotateY(-10deg)',
  },
  winPane: {
    width: '100%',
    height: '100%',
    borderRadius: '1px',
  },
  pinnedApps: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: '10px',
    height: '100%',
  },
  appIconWrapper: {
    width: '40px',
    height: '34px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '3px',
    transition: 'background 0.2s',
    cursor: 'pointer',
    marginRight: '2px',
    background: 'rgba(255,255,255,0.1)',
    borderBottom: '2px solid #5ab0f7',
  },
  appIcon: {
    width: '24px',
    height: '24px',
    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
  },
  systemTray: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    color: 'white',
  },
  trayIcons: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '5px',
    padding: '0 5px',
  },
  trayArrow: {
    marginRight: '8px',
    cursor: 'pointer',
    opacity: 0.7,
  },
  icon: {
    margin: '0 3px',
    cursor: 'pointer',
    opacity: 0.9,
  },
  clock: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 10px',
    height: '100%',
    fontSize: '11px',
    fontWeight: '400',
    background: 'rgba(255,255,255,0.05)',
    borderLeft: '1px solid rgba(255,255,255,0.1)',
  },
  timeStr: {
    marginBottom: '-2px',
  },
  dateStr: {
    opacity: 0.8,
  },
  showDesktop: {
    width: '12px',
    height: '100%',
    background: 'rgba(255,255,255,0.05)',
    borderLeft: '1px solid rgba(255,255,255,0.2)',
    cursor: 'pointer',
    transition: 'background 0.2s',
    '&:hover': {
      background: 'rgba(255,255,255,0.15)',
    }
  }
};

export default Taskbar;

