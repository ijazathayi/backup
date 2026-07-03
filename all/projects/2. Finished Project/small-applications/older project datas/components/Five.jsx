import React from "react";
import logo from './assets/ijaz-builds.png'
import './css/five.css'

const Five = ({ formRef, onSubmit }) => {
  return (
    <div className="last-section" id="contact">

      <div className="five">
        <div className="five-childs" id="five-child-1">
          <div id="five-child-1-div-1">
            <img src={logo} alt="logo" id="five-logo" width={"300px"} />
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
              <li><a href="https://www.linkedin.com/in/mohammed-ijaz-athayi/" target="_blank" rel="noopener noreferrer">linkedin</a></li>
              <li><a href="https://www.github.com/ijaz-athayi" target="_blank" rel="noopener noreferrer">github</a></li>
              <li><a href="https://www.x.com/_lonley__boy_" target="_blank" rel="noopener noreferrer">twitter</a></li>
              <li><a href="https://www.freelancer.in/u/ijazathayi" target="_blank" rel="noopener noreferrer">freelance</a></li>
              <li><a href="https://www.facebook.com/ijaz.athayi" target="_blank" rel="noopener noreferrer">facebook</a></li>
              <li><a href="https://wa.me/918754750458" target="_blank" rel="noopener noreferrer">whatsapp</a></li>
            </ul>
          </div>
        </div>
        <div className="five-childs" id="five-child-2">
          <h3>building a modern web application with efficient and maintainable solutions.</h3>
          <p>Developed by: <img src={logo} alt="" id="logo2"/></p>
        </div>
      </div>
    </div>
  );
};

export default Five;