import React from 'react'
import '../components/css/homepage.css'
import { Link } from 'react-router-dom'

const Homepage = () => {

  return (
    <div id="homepage-body">
      <div className="homepage-header">
        <h1>Welcome to Small Tools</h1> 
        <p>Explore our collection of tools designed to help you with everyday tasks.</p>
          </div>
      <div className="homepage-content">
        <ul className="tool-list">
          <Link to="/calculator"  className='link-tools'><li className='tools'>Calculator</li></Link>
          <Link to="/todo" className='link-tools'><li className='tools'>todo list</li></Link>
          <Link to="/webcam" className='link-tools'><li className='tools'>webcam</li></Link>
          <Link to="/agecalculator" className='link-tools'><li className='tools'>Age calculator</li></Link>
          <Link to="/keyboardhomepage" className='link-tools'><li className='tools'>keyboard check</li></Link>
          {/* <Link to="/todo" className='link-tools'><li className='tools'>todo</li></Link> */}
        

        </ul>
    </div>
    
    </div>
  )
}

export default Homepage
