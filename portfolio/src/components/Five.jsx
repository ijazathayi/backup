import React from "react";
import logo from './assets/logo1.png'
import './css/five.css'

const Five = () => {
  return (
    <div className="last-section " id="contact">
      <div className="five">
        <div className="five-childs" id="five-child-1">
          <div  id="five-child-1-div-1">
          <img src={logo} alt="logo" className="five-logo" width={"150px"} />
          <span>Mohammed Ijaz creations</span>
          </div>
          <div id="five-child-1-div-2">
            <h2>Portfolio</h2>
            <ul>
              <li>project</li>
              <li>blog</li>
              <li>about</li>
              <li>contact</li>
            </ul>
            <hr />
          </div>
          <div id="five-child-1-div-3">
            <h2>Service</h2>
              <ul>
              <li>web development</li>
              <li>front-end development</li>
              <li>back-end development</li>
              <li>database development</li>
              <li>fullstack development</li>
  
            </ul>
                        <hr />

          </div>
          <div id="five-child-1-div-4">
            <h2>Connect</h2>
              <ul>
              <li><a href="https://www.linkedin.com/in/mohammed-ijaz-athayi/">linkedin</a></li>
              <li><a href="https://www.github.com/ijaz-athayi">github</a></li>
              <li><a href="https://www.x.com/_lonley__boy_">twitter</a></li>
              <li><a href="https://www.freelancer.in/u/ijazathayi">freelance</a></li>
              <li><a href="https://www.facebook.com/ijaz.athayi">facebook</a></li>
              <li><a href="https://wa.me/918754750458">whatsapp  </a></li>
            </ul>
            
          </div>
        </div>
        <div className="five-childs" id="five-child-2">

    <h3>building a modern web application with with efficient and maintainable solutions.</h3>
    <p> 
      © 2025 Mohammed Ijaz Athayi.</p>
        </div>
      </div>
    </div>
  );

};

export default Five;
