import React, { useState, useEffect } from 'react'
import './css/keyboard.css'

const Keyboard = () => {
  const [pressedKeys, setPressedKeys] = useState(new Set());

  // Numpad functions
  const numpadFunctions = {
    'key-88': () => console.log('Num Lock activated'),
    'key-89': () => console.log('Numpad / division'),
    'key-90': () => console.log('Numpad * multiply'),
    'key-91': () => console.log('Numpad - subtract'),
    'key-92': () => console.log('Numpad + add'),
    'key-93': () => console.log('Numpad Enter'),
    'key-94': () => console.log('Numpad 1'),
    'key-95': () => console.log('Numpad 2'),
    'key-96': () => console.log('Numpad 3'),
    'key-97': () => console.log('Numpad 4'),
    'key-98': () => console.log('Numpad 5'),
    'key-99': () => console.log('Numpad 6'),
    'key-100': () => console.log('Numpad 7'),
    'key-101': () => console.log('Numpad 8'),
    'key-102': () => console.log('Numpad 9'),
    'key-103': () => console.log('Numpad 0'),
    'key-104': () => console.log('Numpad decimal/period'),
  };

  // Key mapping: physical key -> key ID (115 key layout)
  const keyMap = {
    'Escape': 'key-1',
    'F1': 'key-2',
    'F2': 'key-3',
    'F3': 'key-4',
    'F4': 'key-5',
    'F5': 'key-6',
    'F6': 'key-7',
    'F7': 'key-8',
    'F8': 'key-9',
    'F9': 'key-10',
    'F10': 'key-11',
    'F11': 'key-12',
    'F12': 'key-13',
    'PrintScreen': 'key-14',
    'ScrollLock': 'key-15',
    'Pause': 'key-16',
    'Backquote': 'key-17',
    'Digit1': 'key-18',
    'Digit2': 'key-19',
    'Digit3': 'key-20',
    'Digit4': 'key-21',
    'Digit5': 'key-22',
    'Digit6': 'key-23',
    'Digit7': 'key-24',
    'Digit8': 'key-25',
    'Digit9': 'key-26',
    'Digit0': 'key-27',
    'Minus': 'key-28',
    'Equal': 'key-29',
    'Backspace': 'key-30',
    'Tab': 'key-31',
    'KeyQ': 'key-32',
    'KeyW': 'key-33',
    'KeyE': 'key-34',
    'KeyR': 'key-35',
    'KeyT': 'key-36',
    'KeyY': 'key-37',
    'KeyU': 'key-38',
    'KeyI': 'key-39',
    'KeyO': 'key-40',
    'KeyP': 'key-41',
    'BracketLeft': 'key-42',
    'BracketRight': 'key-43',
    'Backslash': 'key-44',
    'CapsLock': 'key-45',
    'KeyA': 'key-46',
    'KeyS': 'key-47',
    'KeyD': 'key-48',
    'KeyF': 'key-49',
    'KeyG': 'key-50',
    'KeyH': 'key-51',
    'KeyJ': 'key-52',
    'KeyK': 'key-53',
    'KeyL': 'key-54',
    'Semicolon': 'key-55',
    'Quote': 'key-56',
    'Enter': 'key-57',
    'ShiftLeft': 'key-58',
    'KeyZ': 'key-59',
    'KeyX': 'key-60',
    'KeyC': 'key-61',
    'KeyV': 'key-62',
    'KeyB': 'key-63',
    'KeyN': 'key-64',
    'KeyM': 'key-65',
    'Comma': 'key-66',
    'Period': 'key-67',
    'Slash': 'key-68',
    'ShiftRight': 'key-69',
    'ControlLeft': 'key-70',
    'MetaLeft': 'key-71',
    'AltLeft': 'key-72',
    'Space': 'key-73',
    'AltRight': 'key-74',
    'MetaRight': 'key-75',
    'ContextMenu': 'key-76',
    'ControlRight': 'key-77',
    'Insert': 'key-78',
    'Home': 'key-79',
    'PageUp': 'key-80',
    'Delete': 'key-81',
    'End': 'key-82',
    'PageDown': 'key-83',
    'ArrowUp': 'key-84',
    'ArrowLeft': 'key-85',
    'ArrowDown': 'key-86',
    'ArrowRight': 'key-87',
    'NumLock': 'key-88',
    'NumpadDivide': 'key-89',
    'NumpadMultiply': 'key-90',
    'NumpadSubtract': 'key-91',
    'NumpadAdd': 'key-92',
    'NumpadEnter': 'key-93',
    'Numpad1': 'key-94',
    'Numpad2': 'key-95',
    'Numpad3': 'key-96',
    'Numpad4': 'key-97',
    'Numpad5': 'key-98',
    'Numpad6': 'key-99',
    'Numpad7': 'key-100',
    'Numpad8': 'key-101',
    'Numpad9': 'key-102',
    'Numpad0': 'key-103',
    'NumpadDecimal': 'key-104',
  };

  useEffect(() => {
    pressedKeys.forEach(keyId => {
      const element = document.getElementById(keyId);
      if (element) {
        element.classList.add('active');
      }
    });

    const handleKeyDown = (e) => {
      const keyId = keyMap[e.code];
      if (keyId && !pressedKeys.has(keyId)) {
        if (e.code.startsWith('F')) {
          e.preventDefault();
        }
        const element = document.getElementById(keyId);
        if (element) {
          element.classList.add('active');
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

  return (
    <div id='keyboard-body'>
        <div id='keyboard-keys'>
            <div className='key' id='key-1'>Esc</div>
            <div className='key' id='key-2'>F1</div>
            <div className='key' id='key-3'>F2</div>
            <div className='key' id='key-4'>F3</div>
            <div className='key' id='key-5'>F4</div>
            <div className='key' id='key-6'>F5</div>
            <div className='key' id='key-7'>F6</div>
            <div className='key' id='key-8'>F7</div>
            <div className='key' id='key-9'>F8</div>
            <div className='key' id='key-10'>F9</div>
            <div className='key' id='key-11'>F10</div>
            <div className='key' id='key-12'>F11</div>
            <div className='key' id='key-13'>F12</div>
            <div className='key' id='key-14'>PrtSc</div>
            <div className='key' id='key-15'>Scroll Lock</div>
            <div className='key' id='key-16'>Pause</div>
            <div className='key' id='key-17'>~</div>
            <div className='key' id='key-18'>1</div>
            <div className='key' id='key-19'>2</div>
            <div className='key' id='key-20'>3</div>
            <div className='key' id='key-21'>4</div>
            <div className='key' id='key-22'>5</div>
            <div className='key' id='key-23'>6</div>
            <div className='key' id='key-24'>7</div>
            <div className='key' id='key-25'>8</div>
            <div className='key' id='key-26'>9</div>
            <div className='key' id='key-27'>0</div>
            <div className='key' id='key-28'>-</div>
            <div className='key' id='key-29'>=</div>
            <div className='key' id='key-30'>Backspace</div>
            <div className='key' id='key-31'>Tab</div>
            <div className='key' id='key-32'>Q</div>
            <div className='key' id='key-33'>W</div>
            <div className='key' id='key-34'>E</div>
            <div className='key' id='key-35'>R</div>
            <div className='key' id='key-36'>T</div>
            <div className='key' id='key-37'>Y</div>
            <div className='key' id='key-38'>U</div>
            <div className='key' id='key-39'>I</div>
            <div className='key' id='key-40'>O</div>
            <div className='key' id='key-41'>P</div>
            <div className='key' id='key-42'>[</div>
            <div className='key' id='key-43'>]</div>
            <div className='key' id='key-44'>\</div>
            <div className='key' id='key-45'>Caps Lock</div>
            <div className='key' id='key-46'>A</div>
            <div className='key' id='key-47'>S</div>
            <div className='key' id='key-48'>D</div>
            <div className='key' id='key-49'>F</div>
            <div className='key' id='key-50'>G</div>
            <div className='key' id='key-51'>H</div>
            <div className='key' id='key-52'>J</div>
            <div className='key' id='key-53'>K</div>
            <div className='key' id='key-54'>L</div>
            <div className='key' id='key-55'>;</div>
            <div className='key' id='key-56'>'</div>
            <div className='key' id='key-57'>Enter</div>
            <div className='key' id='key-58'>Shift</div>
            <div className='key' id='key-59'>Z</div>
            <div className='key' id='key-60'>X</div>
            <div className='key' id='key-61'>C</div>
            <div className='key' id='key-62'>V</div>
            <div className='key' id='key-63'>B</div>
            <div className='key' id='key-64'>N</div>
            <div className='key' id='key-65'>M</div>
            <div className='key' id='key-66'>,</div>
            <div className='key' id='key-67'>.</div>
            <div className='key' id='key-68'>/</div>
            <div className='key' id='key-69'>Right Shift</div>
            <div className='key' id='key-70'>Left Ctrl</div>
            <div className='key' id='key-71'>Left Win</div>
            <div className='key' id='key-72'>Left Alt</div>
            <div className='key' id='key-73'>Space</div>
            <div className='key' id='key-74'>Right Alt</div>
            <div className='key' id='key-75'>Right Win</div>
            <div className='key' id='key-76'>Menu</div>
            <div className='key' id='key-77'>Right Ctrl</div>
            <div className='key' id='key-78'>Insert</div>
            <div className='key' id='key-79'>Home</div>
            <div className='key' id='key-80'>Page Up</div>
            <div className='key' id='key-81'>Delete</div>
            <div className='key' id='key-82'>End</div>
            <div className='key' id='key-83'>Page Down</div>
            <div className='key' id='key-84'>Up Arrow</div>
            <div className='key' id='key-85'>Left Arrow</div>
            <div className='key' id='key-86'>Down Arrow</div>
            <div className='key' id='key-87'>Right Arrow</div>
            <div className='key' id='key-88'>Num Lock</div>
            <div className='key' id='key-89'>Numpad /</div>
            <div className='key' id='key-90'>Numpad *</div>
            <div className='key' id='key-91'>Numpad -</div>
            <div className='key' id='key-92'>Numpad +</div>
            <div className='key' id='key-93'>Numpad Enter</div>
            <div className='key' id='key-94'>Numpad 1</div>
            <div className='key' id='key-95'>Numpad 2</div>
            <div className='key' id='key-96'>Numpad 3</div>
            <div className='key' id='key-97'>Numpad 4</div>
            <div className='key' id='key-98'>Numpad 5</div>
            <div className='key' id='key-99'>Numpad 6</div>
            <div className='key' id='key-100'>Numpad 7</div>
            <div className='key' id='key-101'>Numpad 8</div>
            <div className='key' id='key-102'>Numpad 9</div>
            <div className='key' id='key-103'>Numpad 0</div>
            <div className='key' id='key-104'>Numpad .</div>




















        </div>
    </div>
    );
};

export default Keyboard