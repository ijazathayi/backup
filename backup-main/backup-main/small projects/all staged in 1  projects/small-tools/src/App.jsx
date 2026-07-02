import './App.css'
import Homepage from './pages/Homepage'
import Navbarcomp from './pages/Navbar'
import { Routes, Route } from 'react-router'
import { BrowserRouter } from 'react-router'
import Todo from './components/Todo'
import Calculator from './components/Calculator'
import Webcam from './components/Webcam'
import Agecalculator from './components/Agecalculator'
import Keyboardhomepage from './pages/Keyboard-homepage'
import Keyboard1 from './components/Keyboard1'
import Keyboard2 from './components/Keyboard2'

function App() {

  return (
    <div className="App">
      <Navbarcomp />

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/todo" element={<Todo />} />
          <Route path="/webcam" element={<Webcam />} />
          <Route path="/agecalculator" element={<Agecalculator />} />
          <Route path="/keyboardhomepage" element={<Keyboardhomepage />} />
          <Route path="/keyboard1" element={<Keyboard1 />} />
          <Route path="/keyboard2" element={<Keyboard2 />} />

          {/* <Route path="/checkkeyboard" element={<Keyboard />} /> */}
          {/* <Route path="/" element={<Homepage />} /> */}
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
