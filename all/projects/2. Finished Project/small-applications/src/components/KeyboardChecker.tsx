import React, { useState, useEffect } from 'react';
import './css/project.css';

const KeyboardChecker = () => {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const keyMap: Record<string, string> = {
    'Escape': 'key-1', 'F1': 'key-2', 'F2': 'key-3', 'F3': 'key-4', 'F4': 'key-5',
    'F5': 'key-6', 'F6': 'key-7', 'F7': 'key-8', 'F8': 'key-9', 'F9': 'key-10',
    'F10': 'key-11', 'F11': 'key-12', 'F12': 'key-13', 'PrintScreen': 'key-14',
    'ScrollLock': 'key-15', 'Pause': 'key-16', 'Backquote': 'key-17', 'Digit1': 'key-18',
    'Digit2': 'key-19', 'Digit3': 'key-20', 'Digit4': 'key-21', 'Digit5': 'key-22',
    'Digit6': 'key-23', 'Digit7': 'key-24', 'Digit8': 'key-25', 'Digit9': 'key-26',
    'Digit0': 'key-27', 'Minus': 'key-28', 'Equal': 'key-29', 'Backspace': 'key-30',
    'Tab': 'key-31', 'KeyQ': 'key-32', 'KeyW': 'key-33', 'KeyE': 'key-34',
    'KeyR': 'key-35', 'KeyT': 'key-36', 'KeyY': 'key-37', 'KeyU': 'key-38',
    'KeyI': 'key-39', 'KeyO': 'key-40', 'KeyP': 'key-41', 'BracketLeft': 'key-42',
    'BracketRight': 'key-43', 'Backslash': 'key-44', 'CapsLock': 'key-45', 'KeyA': 'key-46',
    'KeyS': 'key-47', 'KeyD': 'key-48', 'KeyF': 'key-49', 'KeyG': 'key-50',
    'KeyH': 'key-51', 'KeyJ': 'key-52', 'KeyK': 'key-53', 'KeyL': 'key-54',
    'Semicolon': 'key-55', 'Quote': 'key-56', 'Enter': 'key-57', 'ShiftLeft': 'key-58',
    'KeyZ': 'key-59', 'KeyX': 'key-60', 'KeyC': 'key-61', 'KeyV': 'key-62',
    'KeyB': 'key-63', 'KeyN': 'key-64', 'KeyM': 'key-65', 'Comma': 'key-66',
    'Period': 'key-67', 'Slash': 'key-68', 'ShiftRight': 'key-69', 'ControlLeft': 'key-70',
    'MetaLeft': 'key-71', 'AltLeft': 'key-72', 'Space': 'key-73', 'AltRight': 'key-74',
    'MetaRight': 'key-75', 'ContextMenu': 'key-76', 'ControlRight': 'key-77',
    'Insert': 'key-78', 'Home': 'key-79', 'PageUp': 'key-80', 'Delete': 'key-81',
    'End': 'key-82', 'PageDown': 'key-83', 'ArrowUp': 'key-84', 'ArrowLeft': 'key-85',
    'ArrowDown': 'key-86', 'ArrowRight': 'key-87', 'NumLock': 'key-88',
    'NumpadDivide': 'key-89', 'NumpadMultiply': 'key-90', 'NumpadSubtract': 'key-91',
    'NumpadAdd': 'key-92', 'NumpadEnter': 'key-93', 'Numpad1': 'key-94',
    'Numpad2': 'key-95', 'Numpad3': 'key-96', 'Numpad4': 'key-97', 'Numpad5': 'key-98',
    'Numpad6': 'key-99', 'Numpad7': 'key-100', 'Numpad8': 'key-101', 'Numpad9': 'key-102',
    'Numpad0': 'key-103', 'NumpadDecimal': 'key-104'
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyId = keyMap[e.code];
      if (keyId && !pressedKeys.has(keyId)) {
        if (e.code.startsWith('F') || e.code === 'Tab') {
          e.preventDefault();
        }
        setPressedKeys(prev => {
          const newSet = new Set(prev);
          newSet.add(keyId);
          return newSet;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [pressedKeys]);

  const renderKey = (id: string, label: string, style?: React.CSSProperties) => {
    const isActive = pressedKeys.has(id);
    return (
      <div 
        key={id}
        style={{
          background: isActive ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.05)',
          color: isActive ? '#fff' : 'var(--text-secondary)',
          border: `1px solid ${isActive ? 'var(--accent-glow)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '6px',
          padding: '8px 4px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '0.8rem',
          userSelect: 'none',
          boxShadow: isActive ? '0 0 10px var(--accent-glow)' : 'none',
          transition: 'all 0.1s',
          ...style
        }}
      >
        {label}
      </div>
    );
  };

  return (
    <div className="project-page" style={{ maxWidth: '1200px' }}>
      <button className="project-back" onClick={() => (window.location.hash = '')}>Back</button>
      <h2>Keyboard Checker</h2>
      <p>Press any key to test if it works. Tested keys will light up.</p>

      <button className="project-btn project-btn-secondary" onClick={() => setPressedKeys(new Set())} style={{ marginBottom: '2rem' }}>
        Reset
      </button>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Function row */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
            {renderKey('key-1', 'Esc', { width: '40px' })}
            <div style={{ width: '20px' }} />
            {renderKey('key-2', 'F1', { width: '40px' })}
            {renderKey('key-3', 'F2', { width: '40px' })}
            {renderKey('key-4', 'F3', { width: '40px' })}
            {renderKey('key-5', 'F4', { width: '40px' })}
            <div style={{ width: '20px' }} />
            {renderKey('key-6', 'F5', { width: '40px' })}
            {renderKey('key-7', 'F6', { width: '40px' })}
            {renderKey('key-8', 'F7', { width: '40px' })}
            {renderKey('key-9', 'F8', { width: '40px' })}
            <div style={{ width: '20px' }} />
            {renderKey('key-10', 'F9', { width: '40px' })}
            {renderKey('key-11', 'F10', { width: '40px' })}
            {renderKey('key-12', 'F11', { width: '40px' })}
            {renderKey('key-13', 'F12', { width: '40px' })}
          </div>
          
          {/* Number row */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {renderKey('key-17', '~', { width: '40px' })}
            {renderKey('key-18', '1', { width: '40px' })}
            {renderKey('key-19', '2', { width: '40px' })}
            {renderKey('key-20', '3', { width: '40px' })}
            {renderKey('key-21', '4', { width: '40px' })}
            {renderKey('key-22', '5', { width: '40px' })}
            {renderKey('key-23', '6', { width: '40px' })}
            {renderKey('key-24', '7', { width: '40px' })}
            {renderKey('key-25', '8', { width: '40px' })}
            {renderKey('key-26', '9', { width: '40px' })}
            {renderKey('key-27', '0', { width: '40px' })}
            {renderKey('key-28', '-', { width: '40px' })}
            {renderKey('key-29', '=', { width: '40px' })}
            {renderKey('key-30', 'Backspace', { width: '84px' })}
          </div>

          {/* QWERTY */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {renderKey('key-31', 'Tab', { width: '60px' })}
            {renderKey('key-32', 'Q', { width: '40px' })}
            {renderKey('key-33', 'W', { width: '40px' })}
            {renderKey('key-34', 'E', { width: '40px' })}
            {renderKey('key-35', 'R', { width: '40px' })}
            {renderKey('key-36', 'T', { width: '40px' })}
            {renderKey('key-37', 'Y', { width: '40px' })}
            {renderKey('key-38', 'U', { width: '40px' })}
            {renderKey('key-39', 'I', { width: '40px' })}
            {renderKey('key-40', 'O', { width: '40px' })}
            {renderKey('key-41', 'P', { width: '40px' })}
            {renderKey('key-42', '[', { width: '40px' })}
            {renderKey('key-43', ']', { width: '40px' })}
            {renderKey('key-44', '\\', { width: '64px' })}
          </div>

          {/* ASDF */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {renderKey('key-45', 'Caps Lock', { width: '74px' })}
            {renderKey('key-46', 'A', { width: '40px' })}
            {renderKey('key-47', 'S', { width: '40px' })}
            {renderKey('key-48', 'D', { width: '40px' })}
            {renderKey('key-49', 'F', { width: '40px' })}
            {renderKey('key-50', 'G', { width: '40px' })}
            {renderKey('key-51', 'H', { width: '40px' })}
            {renderKey('key-52', 'J', { width: '40px' })}
            {renderKey('key-53', 'K', { width: '40px' })}
            {renderKey('key-54', 'L', { width: '40px' })}
            {renderKey('key-55', ';', { width: '40px' })}
            {renderKey('key-56', "'", { width: '40px' })}
            {renderKey('key-57', 'Enter', { width: '94px' })}
          </div>

          {/* ZXCV */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {renderKey('key-58', 'Shift', { width: '100px' })}
            {renderKey('key-59', 'Z', { width: '40px' })}
            {renderKey('key-60', 'X', { width: '40px' })}
            {renderKey('key-61', 'C', { width: '40px' })}
            {renderKey('key-62', 'V', { width: '40px' })}
            {renderKey('key-63', 'B', { width: '40px' })}
            {renderKey('key-64', 'N', { width: '40px' })}
            {renderKey('key-65', 'M', { width: '40px' })}
            {renderKey('key-66', ',', { width: '40px' })}
            {renderKey('key-67', '.', { width: '40px' })}
            {renderKey('key-68', '/', { width: '40px' })}
            {renderKey('key-69', 'Shift', { width: '112px' })}
          </div>

          {/* Space */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {renderKey('key-70', 'Ctrl', { width: '50px' })}
            {renderKey('key-71', 'Win', { width: '50px' })}
            {renderKey('key-72', 'Alt', { width: '50px' })}
            {renderKey('key-73', 'Space', { width: '270px' })}
            {renderKey('key-74', 'Alt', { width: '50px' })}
            {renderKey('key-75', 'Win', { width: '50px' })}
            {renderKey('key-76', 'Menu', { width: '50px' })}
            {renderKey('key-77', 'Ctrl', { width: '50px' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardChecker;
