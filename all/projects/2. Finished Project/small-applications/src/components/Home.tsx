import { useState, useEffect } from 'react'
import './css/home.css'
import HUDOverlay from './HUDOverlay'
import Calculator from './Calculator'
import AgeCalculator from './AgeCalculator'
import Camera from './Camera'
import Mirror from './Mirror'
import KeyboardChecker from './KeyboardChecker'
import Piano from './Piano'
import TodoList from './TodoList'
import Stopwatch from './Stopwatch'
import TicTacToe from './TicTacToe'
import PasswordGenerator from './PasswordGenerator'
import PomodoroTimer from './PomodoroTimer'
import QRCodeGenerator from './QRCodeGenerator'
import MarkdownPreviewer from './MarkdownPreviewer'
import ColorPaletteGenerator from './ColorPaletteGenerator'
import DrawingCanvas from './DrawingCanvas'

const infoIcon = (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill="#6d9186" />
    <rect x="11" y="10" width="2" height="6" rx="1" fill="#fff" />
    <circle cx="12" cy="7" r="1.25" fill="#fff" />
  </svg>
)

const Home = () => {
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    const update = () => setSelected(window.location.hash.replace('#', '') || null)
    update()
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty('--mouse-x', `${x}px`);
    target.style.setProperty('--mouse-y', `${y}px`);
  };

  if (selected) {
    return (
      <div id="home-body" style={{ padding: '2rem' }}>
        <HUDOverlay hidden={true} />
        {selected === 'calculator' && <div style={{ width: '100%' }}><Calculator /></div>}
        {selected === 'age-calculator' && <AgeCalculator />}
        {selected === 'camera' && <Camera />}
        {selected === 'mirror' && <Mirror />}
        {selected === 'keyboard-checker' && <KeyboardChecker />}
        {selected === 'piano' && <Piano />}
        {selected === 'todolist' && <TodoList />}
        {selected === 'stopwatch' && <Stopwatch />}
        {selected === 'tictactoe' && <TicTacToe />}
        {selected === 'password-generator' && <PasswordGenerator />}
        {selected === 'pomodoro-timer' && <PomodoroTimer />}
        {selected === 'qrcode-generator' && <QRCodeGenerator />}
        {selected === 'markdown-previewer' && <MarkdownPreviewer />}
        {selected === 'color-palette' && <ColorPaletteGenerator />}
        {selected === 'drawing-canvas' && <DrawingCanvas />}
      </div>
    );
  }

  return (
    <div id="home-body">
      <HUDOverlay hidden={false} />
      <h1 className="hub-title">Mini App Hub</h1>
      <p>A collection of useful utilities and mini-games built with React.</p>

      <div id="contents" className={"visible"}>
            <a className="small-tools" href="#calculator" aria-label="Open Calculator" onMouseMove={handleMouseMove} style={{ textDecoration: 'none' }}>
              <span className="project-title">Calculator</span>
              <span className="tooltip-wrapper">
                <span className="info-icon">{infoIcon}</span>
                <span className="tooltip-text">Fast arithmetic calculations
Simple operations in a clean interface
Perfect for everyday quick results</span>
              </span>
            </a>

            <a className="small-tools" href="#age-calculator" aria-label="Open Age calculator" onMouseMove={handleMouseMove} style={{ textDecoration: 'none' }}>
              <span className="project-title">Age Calculator</span>
              <span className="tooltip-wrapper">
                <span className="info-icon">{infoIcon}</span>
                <span className="tooltip-text">Calculate age from birth date
Includes month and day precision
Ideal for birthdays and planning</span>
              </span>
            </a>

            <a className="small-tools" href="#camera" aria-label="Open Camera" onMouseMove={handleMouseMove} style={{ textDecoration: 'none' }}>
              <span className="project-title">Camera</span>
              <span className="tooltip-wrapper">
                <span className="info-icon">{infoIcon}</span>
                <span className="tooltip-text">Built-in browser camera access
Take snapshots with filters
Easy preview and download flow</span>
              </span>
            </a>

            <a className="small-tools" href="#mirror" aria-label="Open Mirror" onMouseMove={handleMouseMove} style={{ textDecoration: 'none' }}>
              <span className="project-title">Mirror</span>
              <span className="tooltip-wrapper">
                <span className="info-icon">{infoIcon}</span>
                <span className="tooltip-text">Mirror your camera stream
Useful for quick selfies and checks
Clean, responsive display</span>
              </span>
            </a>

            <a className="small-tools" href="#keyboard-checker" aria-label="Open Keyboard checker" onMouseMove={handleMouseMove} style={{ textDecoration: 'none' }}>
              <span className="project-title">Key Checker</span>
              <span className="tooltip-wrapper">
                <span className="info-icon">{infoIcon}</span>
                <span className="tooltip-text">Verify each key press quickly
Supports all standard keyboard keys
Great for diagnostics and testing</span>
              </span>
            </a>

            <a className="small-tools" href="#piano" aria-label="Open Piano" onMouseMove={handleMouseMove} style={{ textDecoration: 'none' }}>
              <span className="project-title">Piano</span>
              <span className="tooltip-wrapper">
                <span className="info-icon">{infoIcon}</span>
                <span className="tooltip-text">Interactive keyboard experience
Play notes directly in browser
Responsive sound and visuals</span>
              </span>
            </a>

            <a className="small-tools" href="#todolist" aria-label="Open TodoList" onMouseMove={handleMouseMove} style={{ textDecoration: 'none' }}>
              <span className="project-title">Todo List</span>
              <span className="tooltip-wrapper">
                <span className="info-icon">{infoIcon}</span>
                <span className="tooltip-text">Manage tasks with ease
Add, remove, and mark complete
Simple productivity workflow</span>
              </span>
            </a>

            <a className="small-tools" href="#stopwatch" aria-label="Open Stopwatch" onMouseMove={handleMouseMove} style={{ textDecoration: 'none' }}>
              <span className="project-title">Stopwatch</span>
              <span className="tooltip-wrapper">
                <span className="info-icon">{infoIcon}</span>
                <span className="tooltip-text">Track time precisely
Includes start, stop, lap, and reset
Clean and accurate</span>
              </span>
            </a>

            <a className="small-tools" href="#tictactoe" aria-label="Open Tic-Tac-Toe" onMouseMove={handleMouseMove} style={{ textDecoration: 'none' }}>
              <span className="project-title">Tic-Tac-Toe</span>
              <span className="tooltip-wrapper">
                <span className="info-icon">{infoIcon}</span>
                <span className="tooltip-text">Classic strategy game
Play against a friend locally
Sleek interactive board</span>
              </span>
            </a>

            <a className="small-tools" href="#password-generator" aria-label="Open Password Generator" onMouseMove={handleMouseMove} style={{ textDecoration: 'none' }}>
              <span className="project-title">Pass Gen</span>
              <span className="tooltip-wrapper">
                <span className="info-icon">{infoIcon}</span>
                <span className="tooltip-text">Generate secure passwords
Customize length and chars
One-click copy to clipboard</span>
              </span>
            </a>

            <a className="small-tools" href="#pomodoro-timer" aria-label="Open Pomodoro Timer" onMouseMove={handleMouseMove} style={{ textDecoration: 'none' }}>
              <span className="project-title">Pomodoro</span>
              <span className="tooltip-wrapper">
                <span className="info-icon">{infoIcon}</span>
                <span className="tooltip-text">Focus interval timer
25m work / 5m break loops
Enhance productivity</span>
              </span>
            </a>

            <a className="small-tools" href="#qrcode-generator" aria-label="Open QR Code" onMouseMove={handleMouseMove} style={{ textDecoration: 'none' }}>
              <span className="project-title">QR Code</span>
              <span className="tooltip-wrapper">
                <span className="info-icon">{infoIcon}</span>
                <span className="tooltip-text">Generate QR codes instantly
Convert URLs or Text
Download the image</span>
              </span>
            </a>

            <a className="small-tools" href="#markdown-previewer" aria-label="Open Markdown" onMouseMove={handleMouseMove} style={{ textDecoration: 'none' }}>
              <span className="project-title">Markdown</span>
              <span className="tooltip-wrapper">
                <span className="info-icon">{infoIcon}</span>
                <span className="tooltip-text">Live Markdown previewer
Dual pane editor & viewer
Supports full GFM syntax</span>
              </span>
            </a>

            <a className="small-tools" href="#color-palette" aria-label="Open Color Palette" onMouseMove={handleMouseMove} style={{ textDecoration: 'none' }}>
              <span className="project-title">Colors</span>
              <span className="tooltip-wrapper">
                <span className="info-icon">{infoIcon}</span>
                <span className="tooltip-text">Random palette generator
5 harmonious colors
1-click HEX copy</span>
              </span>
            </a>

            <a className="small-tools" href="#drawing-canvas" aria-label="Open Drawing" onMouseMove={handleMouseMove} style={{ textDecoration: 'none' }}>
              <span className="project-title">Drawing</span>
              <span className="tooltip-wrapper">
                <span className="info-icon">{infoIcon}</span>
                <span className="tooltip-text">HTML5 Canvas painter
Custom brush sizes & colors
Download your artwork</span>
              </span>
            </a>
          
      </div>
    </div>
  )
}

export default Home