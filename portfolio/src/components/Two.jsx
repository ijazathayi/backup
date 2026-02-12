import React from "react";
import { useNavigate } from "react-router-dom"; 
import Three from "./Three";
import './css/two.css'
import { useEffect, useRef, useState } from "react";




const Two = () => {
  
  const navigate = useNavigate();
  const twoCenterRef = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          observer.disconnect(); // animate only once
        }
      },
      { threshold: 0.3 }
    );
     if (twoCenterRef.current) {
      observer.observe(twoCenterRef.current);
    }

    return () => observer.disconnect();
  }, []);
  

  return(
    <div className=" section">
      <div className="two">
      <div id="two-back"></div>
      <div id="two-center" ref={twoCenterRef} className={show ? "fade-in-right" : ""} >
        <div id="two-center-child1"> Why, Hello</div>
        <div id="two-center-child2">
          <div className="child2-child" id="child2-1">
            I’m Mohammed Ijaz, a full-stack developer skilled in React and Node.js. 
            I build clean, scalable web applications with smooth user interfaces and solid backend systems.
            I’m comfortable with JavaScript, modern frameworks, APIs, and version control. Let’s work together!
          </div>
          <div className="child2-child" id="child2-2">
            <button 
              onClick={() => navigate('/about')}
            >
              Meet Ijaz
            </button>
          </div>

        </div>
      </div>
      </div>
      <Three />
    </div>
  )
};

export default Two;















// import React from "react";
// // import One from "./One";
// import { useNavigate } from "react-router";


// const Two = () => {
  
//   // const navigate = useNavigate();
//     const navigate = useNavigate();
  

//   return(
//    <div className="section two">
//     <div id="two-back"></div>
//     <div id="two-center" >
//       <div id="two-center-child1"> Why, Hello</div>
//       <div id="two-center-child2">
//         <div className="child2-child" id="child2-1">
//           I’m Mohammed Ijaz, a full-stack developer skilled in React and Node.js. 
//           I build clean, scalable web applications with smooth user interfaces and solid backend systems.
//            I’m comfortable with JavaScript, modern frameworks, APIs, and version control. Let’s work together!
//          {/* <b> Mohammed Ijaz</b> here. I’m a fullstack developer specializing in React and Node.js,
//            turning ideas into polished, scalable web applications. I blend clean UI with robust 
//            backend logic to deliver seamless experiences and reliable performance. Proficient in
//             JavaScript, modern frameworks, RESTful APIs, and version control. Let’s collaborate. */}
//         </div>
//         <div className="child2-child" id="child2-2">
//            <button 
//             // onClick={() => navigate('/about')}
//             >
//             Meet Ijaz</button></div>
//                       <li><button onClick={() => navigate('/')}>About</button></li>

//       </div>
//    {/* <span><img src={line} width="200px" className="extra-curved-line-design" /></span> */}

//     </div>
//   </div>)
// };

// export default Two;
