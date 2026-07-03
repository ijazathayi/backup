import React, { useRef } from 'react'; // Added useRef
import Five from './Five.jsx';
import './css/mypage.css';
import emailjs from '@emailjs/browser';

const Mypage = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    // Replace these with your actual IDs from EmailJS Dashboard
    emailjs.sendForm('service_xubqljc', 'template_wy5w6vm', form.current, '0RK6Qq7vs8OQ0D_Ia')
      .then((result) => {
          alert("Message Sent! I'll get back to you soon.");
          e.target.reset(); // Clears the form
      }, (error) => {
          alert("Failed to send message. Please check your connection.");
          console.log(error.text);
      });
  };

  return (
    <div className='section' id='mypage-section'>
      <div className='mypage'>
        <div id='about-sample-1'></div>
        <div id='about-sample-2'></div>
        <div className='about-div'>
          <h1>Mohammed Ijaz Athayi</h1>
          <p>But you call me Ijaz...</p>
          <button className="uibutton">Resumé <span></span></button>
        </div>
      </div>      
      
      {/* IMPORTANT: Ensure your form inside the <Five /> component 
         uses the 'form' ref and the 'sendEmail' function!
      */}
      <Five formRef={form} onSubmit={sendEmail} />
    </div>
  );
};

export default Mypage;

















// import React from 'react'
// import Five from './Five.jsx'
// import './css/mypage.css'
// import emailjs from '@emailjs/browser';

// const Mypage = () => {

  



//   return (
//     <div className='section ' id='mypage-section'>
//       <div className='mypage'>

//         <div id='about-sample-1'></div>
//         <div id='about-sample-2'></div>
//         <div className='about-div'>
//           <h1>Mohammed Ijaz Athayi</h1>
//           <p>But you call me Ijaz</p>
//           <p>I'm a "Full-Stack Strategist" by nature and by trade, so you'll find me where architectural thinking and 
//             clean code meet user interaction.
//             I am both a Front-End (React) specialist and a Back-End (Node.js) engineer, so I enjoy using business logic,
//             data modeling, and performance optimization to inform an application's architecture.
//              I then leverage the power of modern frameworks and APIs to deliver robust, scalable,
//               and seamless user experiences.</p>
//           <button className="uibutton" >Resumé <span></span></button>

//         </div>
//       </div>      
//       <Five />
//     </div>
//   )
// }

// export default Mypage
