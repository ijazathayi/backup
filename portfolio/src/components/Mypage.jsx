import React from 'react'
import Five from './Five.jsx'
import './css/mypage.css'

const Mypage = () => {



  return (
    <div className='section ' id='mypage-section'>
      <div className='mypage'>

        <div id='about-sample-1'></div>
        <div id='about-sample-2'></div>
        <div className='about-div'>
          <h1>Mohammed Ijaz Athayi</h1>
          <p>But you call me Ijaz</p>
          <p>I'm a "Full-Stack Strategist" by nature and by trade, so you'll find me where architectural thinking and 
            clean code meet user interaction.
            I am both a Front-End (React) specialist and a Back-End (Node.js) engineer, so I enjoy using business logic,
            data modeling, and performance optimization to inform an application's architecture.
             I then leverage the power of modern frameworks and APIs to deliver robust, scalable,
              and seamless user experiences.</p>
          <button>Resumé <span></span></button>

        </div>
      </div>      
      <Five />
    </div>
  )
}

export default Mypage
