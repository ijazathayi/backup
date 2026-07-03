import React, { useState } from 'react';
import Taskbar from './Taskbar';
import Window from './Window';
import GithubProjects from './GithubProjects';
import { ICONS } from '../assets/icons';

const Desktop: React.FC = () => {
  const [openWindows, setOpenWindows] = useState<string[]>([]);

  const toggleWindow = (id: string) => {
    if (openWindows.includes(id)) {
      setOpenWindows(openWindows.filter(w => w !== id));
    } else {
      setOpenWindows([...openWindows, id]);
    }
  };

  const desktopIcons = [
    { id: 'computer', label: 'My Computer', icon: ICONS.COMPUTER },
    { id: 'notepad', label: 'Notepad', icon: ICONS.NOTEPAD },
    { id: 'projects', label: 'Projects', icon: ICONS.FOLDER },
    { id: 'paint', label: 'Paint', icon: ICONS.PAINT },
    { id: 'private', label: 'Private Projects', icon: ICONS.PRIVATE_FOLDER },
    { id: 'github', label: 'GitHub', icon: ICONS.GITHUB },
    { id: 'resume', label: 'Resume', icon: ICONS.RESUME },
    { id: 'contact', label: 'Contact', icon: ICONS.CONTACT },
    { id: 'skills', label: 'Skills', icon: ICONS.SKILLS },
    { id: 'recycle', label: 'Recycle Bin', icon: ICONS.RECYCLE_BIN },
    { id: 'terminal', label: 'Terminal', icon: ICONS.TERMINAL },
  ];

  return (
    <div style={styles.desktop}>
      {/* Desktop Icons Grid */}
      <div style={styles.iconsGrid}>
        {desktopIcons.map(icon => (
          <div key={icon.id} style={styles.iconWrapper} onDoubleClick={() => toggleWindow(icon.id)} onClick={() => {}}>
            <img 
              src={icon.icon} 
              alt={icon.label} 
              style={styles.iconImg} 
              className="desktop-icon-img"
            />
            <span style={styles.iconLabel}>{icon.label}</span>
          </div>
        ))}
      </div>

      {/* Windows */}
      {openWindows.includes('github') && (
        <Window 
          title="GitHub Projects" 
          icon={ICONS.GITHUB}
          onClose={() => toggleWindow('github')}
        >
          <GithubProjects />
        </Window>
      )}

      {/* Placeholder windows for others */}
      {openWindows.map(id => id !== 'github' && (
        <Window 
          key={id}
          title={desktopIcons.find(i => i.id === id)?.label || 'Window'} 
          icon={desktopIcons.find(i => i.id === id)?.icon || ''}
          onClose={() => toggleWindow(id)}
        >
          <div style={{padding: '20px', color: '#333'}}>
             <h2>{desktopIcons.find(i => i.id === id)?.label}</h2>
             <p>This application is coming soon!</p>
          </div>
        </Window>
      ))}

      {/* Taskbar */}
      <Taskbar />
    </div>
  );
};

const styles = {
  desktop: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundImage: `url(${ICONS.WINDOWS_7_WALLPAPER})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    overflow: 'hidden',
  },
  iconsGrid: {
    padding: '10px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, 100px)',
    gridAutoFlow: 'column',
    gridTemplateRows: 'repeat(auto-fill, 100px)',
    height: 'calc(100vh - 40px)',
    gap: '5px',
    justifyContent: 'start',
    alignContent: 'start',
  },
  iconWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    width: '90px',
    height: '90px',
    cursor: 'pointer',
    padding: '10px 5px',
    borderRadius: '4px',
    transition: 'background 0.2s',
    userSelect: 'none' as const,
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.2)',
      boxShadow: 'inset 0 0 5px rgba(255,255,255,0.3)',
    }
  },
  iconImg: {
    width: '48px',
    height: '48px',
    marginBottom: '6px',
    filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.3))',
  },
  iconLabel: {
    color: 'white',
    fontSize: '11px',
    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
    textAlign: 'center' as const,
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
  }
};

export default Desktop;

