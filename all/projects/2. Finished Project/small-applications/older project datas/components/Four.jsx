import React from "react";
import Five from "./Five";
import './css/four.css'

const Four = () => {
  return (
    <div className="section  ">
      <div className="four">
       
      <div id="four-center" className="stamp-border">
        
        <div id="four-int1">Upcoming..! </div>
        <div id="four-int2">

          This portfolio showcases a set of practical software projects that highlight core development skills.
           It includes a responsive piano app, a basic and scientific calculator, an age calculator with accurate 
           date handling, a real-time keyboard key checker, a secure webcam access tool with live preview,
            and a simple eCommerce front end with a catalog, cart, and mock checkout. Each project focuses on MVP quality,
             accessibility, testing, and clear documentation.
            {/* A focused portfolio of practical software projects is presented to demonstrate core skills. 
            The lineup includes a basic piano app with a responsive keyboard UI and lightweight sound synthesis; 
            a calculator (basic and scientific) with robust input parsing and an accessible interface; an age calculator 
            that yields exact years, months, and days, including leap-year handling; a keyboard key checker reporting real-time
             key presses with customizable maps; an Access Webcam feature that securely requests permissions and provides a l
             ive preview with basic controls; and a simple eCommerce front-end with catalog, persistent cart, and a mock checkout.
              Emphasize MVPs, accessibility, testing, and clear documentation on the site. */}
              
              </div>
        </div>
    </div>
    <Five />
    </div>
  );
};

export default Four;
