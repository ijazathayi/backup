import React from 'react'
import { useRef } from 'react';
import github from './assets/github.png'
import linkedin from './assets/linkedin.png'
import twitter from './assets/twitter.png'
import instagram from './assets/instagram.png'
import freelancer from './assets/freelancer.svg'
// import MyMapComponent from './MyMapComponent.jsx'
import logo1 from './assets/logo1.png'
import './css/contact.css'


const Contact = () => {
    const formRef = useRef();
    const onSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log('Form submitted');
    };

    return (
        <div className='section' id='contact-section'>
            <nav id="nav" data-note="nav" style={{ backdropFilter: "none", padding: "0" }} >
                <a href="/" id='contact-main-logo' style={{ position: "absolute", marginTop: "0", top: "0" }}>
                    <img src={logo1} width="200px" alt="img" style={{ cursor: "pointer", left: "0px", position: "absolute" }} />
                </a>
            </nav>
            <div className='contact'>

                <div className='contact-div'>
                    <h1>Contact Me</h1>
                    <p>I'd love to hear from you! Whether you have a question about my work,
                        want to discuss a project, or just want to say hello, feel free to reach out.</p>
                    <div className='contact-container'>
                        <div className='contact-form'>
                            <h2>Send Message</h2> <span id="under1"></span>
                            <form ref={formRef} onSubmit={onSubmit}>
                                <input type="text" name="from_name" placeholder="Your Name" required />
                                <input type="email" name="user_email" placeholder="Your Email" required />
                                <textarea name="message" placeholder="leave your comment" required />
                                <button type="submit" className="submit-btn">Submit</button>
                            </form>
                        </div>
                        <div id='get-touch'>
                            <h2>Get in Touch</h2><span id="under2"></span>
                            <div className='touch-item'>
                                <div className='touch-item-child'><h4>Email: </h4> <span> ijazathayi@gmail.com</span></div>
                                <div className='touch-item-child'><h4>Phone: </h4> <span> +91 8754750458</span></div>
                                <div className="touch-item-child" id="touch-contact">
                                    <div><a href="https://www.github.com/ijaz-athayi" target="_blank" rel="noopener noreferrer"><img src={github} alt="sample" height={"30px"} /></a></div>
                                    <div><a href="https://www.linkedin.com/in/mohammed-ijaz-athayi/" target="_blank" rel="noopener noreferrer"><img src={linkedin} alt="sample" height={"30px"} /></a></div>
                                    <div><a href="https://www.x.com/_lonley__boy_" target="_blank" rel="noopener noreferrer"><img src={twitter} alt="sample" height={"30px"} /></a></div>
                                    <div><a href="https://www.instagram.com/ijaz_athayi" target="_blank" rel="noopener noreferrer"><img src={instagram} alt="sample" height={"30px"} /></a></div>
                                    <div><a href="https://www.freelancer.in/u/ijazathayi" target="_blank" rel="noopener noreferrer"><img src={freelancer} alt="sample" height={"30px"} /></a></div>
                                </div>

                            </div>
                        </div>
                    </div>
                    <div>
                    </div>
                </div>

            </div>

        </div>
    )
}

export default Contact



{/* --- START OF CONTACT FORM SECTION --- */ }
{/* <div className="contact-card-container"> 
        <div className="contact-header">
          <h2>Contact Me</h2>
          <p>I'd love to hear from you! Whether you have a question about my work, want to discuss a project, or just want to say hello, feel free to reach out.</p>
        </div>

        <div className="contact-body">
          <div className="send-message-side">
            <h3>Send Message</h3>
            <form ref={formRef} onSubmit={onSubmit}>
              <input type="text" name="from_name" placeholder="Your Name" required />
              <input type="email" name="user_email" placeholder="Your Email" required />
              <textarea name="message" placeholder="leave your comment" required />
              <button type="submit" className="submit-btn">Submit</button>
            </form>
          </div>

          <div className="get-in-touch-side">
            <h3>Get in Touch</h3>
            <p><strong>Email:</strong> ijazathayi@gmail.com</p>
            <p><strong>Phone:</strong> +91 8754750458</p> 
          </div>
        </div>
      </div>*/}
{/* --- END OF CONTACT FORM SECTION --- */ }
