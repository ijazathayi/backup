import React, { useState } from 'react';
import Draggable from 'react-draggable';
import { X, Square, Minus } from 'lucide-react';

interface WindowProps {
  title: string;
  icon?: string;
  onClose: () => void;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
}

const Window: React.FC<WindowProps> = ({ title, icon, onClose, children, defaultPosition = { x: 50, y: 50 } }) => {
  const [isMaximized, setIsMaximized] = useState(false);

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const windowStyle = isMaximized 
    ? { ...styles.window, ...styles.maximized } 
    : styles.window;

  const content = (
    <div style={windowStyle as React.CSSProperties} className="aero-glass">
      {/* Title Bar */}
      <div className="handle" style={styles.titleBar}>
        <div style={styles.titleLeft}>
          {icon && <img src={icon} alt="icon" style={styles.icon} />}
          <span style={styles.titleText}>{title}</span>
        </div>
        <div style={styles.controls}>
          <button style={styles.controlBtn}><Minus size={14} /></button>
          <button style={styles.controlBtn} onClick={toggleMaximize}><Square size={12} /></button>
          <button style={{ ...styles.controlBtn, ...styles.closeBtn }} onClick={onClose}><X size={14} /></button>
        </div>
      </div>
      
      {/* Body */}
      <div style={styles.body}>
        {children}
      </div>
    </div>
  );

  if (isMaximized) {
    return content;
  }

  return (
    <Draggable handle=".handle" defaultPosition={defaultPosition} bounds="parent">
      {content}
    </Draggable>
  );
};

const styles = {
  window: {
    position: 'absolute' as const,
    width: '800px',
    height: '500px',
    display: 'flex',
    flexDirection: 'column' as const,
    boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 0 10px rgba(255,255,255,0.5)',
    zIndex: 100,
  },
  maximized: {
    top: 0,
    left: 0,
    width: '100vw',
    height: 'calc(100vh - var(--w7-taskbar-h))',
    transform: 'none !important',
    borderRadius: 0,
  },
  titleBar: {
    height: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 8px',
    cursor: 'default', // will be overridden by Draggable handle
  },
  titleLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    width: '16px',
    height: '16px',
    marginRight: '8px',
  },
  titleText: {
    color: '#000',
    fontSize: '12px',
    textShadow: '0 0 5px rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  controls: {
    display: 'flex',
    gap: '2px',
  },
  controlBtn: {
    width: '26px',
    height: '20px',
    border: '1px solid rgba(255,255,255,0.5)',
    background: 'linear-gradient(to bottom, rgba(255,255,255,0.8), rgba(255,255,255,0.2))',
    borderRadius: '3px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    boxShadow: 'inset 0 0 2px white',
    color: '#000',
  },
  closeBtn: {
    background: 'linear-gradient(to bottom, #f28282, #c83232)',
    color: 'white',
    borderColor: '#8c1a1a',
  },
  body: {
    flex: 1,
    background: '#fff',
    margin: '0 4px 4px 4px',
    border: '1px solid #8e8f8f',
    overflow: 'auto',
    position: 'relative' as const,
  }
};

export default Window;
