import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../components/css/navbar.css'
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import logo from '../assets/logo.png' // Assuming you have a logo image in assets
import {useNavigate } from 'react-router';
 

const Navbarcomp = () => {
  return (
    <div id='navbar-body'>
      <Navbar.Brand  href="/"><img src={logo} alt="" width={"100px"} height={"100px"}/>
      </Navbar.Brand>      
              <NavDropdown title="SMALL TOOLS" id="basic-nav-dropdown">
              {/* <NavDropdown.Item href="/">Home</NavDropdown.Item> */}
              <NavDropdown.Item href="/todo">Todolist</NavDropdown.Item>
              <NavDropdown.Item href="/calculator">Calculator</NavDropdown.Item>
              <NavDropdown.Item href="/webcam">Webcam</NavDropdown.Item>
              <NavDropdown.Item href="/agecalculator">Age Calculator</NavDropdown.Item>
              <NavDropdown.Item href="/keyboardhomepage">Keyboard button checker</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.1">QR scanner</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">QR generator </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">piaon</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Recorder</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Translator</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">timer & clock</NavDropdown.Item>

            </NavDropdown>
    </div>
  )
}

export default Navbarcomp
