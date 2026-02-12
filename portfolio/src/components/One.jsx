import React, { useState } from "react";
import WordFlick from "./WordFlick";
import logo1 from "./assets/logo1.png";
import resume from "./assets/ijaz-resume.pdf";
import list from "./assets/list.png";
import { useNavigate } from "react-router";
import Two from "./Two";
import { Link } from "react-scroll";
import "./css/uistyle.css";
import './css/one.css'
import "animate.css"

const One = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="section" id="home">
      <div className="one">
        <nav id="nav" className={isMenuOpen ? 'nav-open' : ''}>
          <img src={logo1} width="200px" alt="img" id="one-main-logo" style={{ cursor: "pointer" }} onClick={handleMenuToggle} />
          <ul className="nav-links">
            <li><Link to="home" smooth={true} duration={500}> Home </Link></li>
            <li><Link to="projects" smooth={true} duration={500}> Projects</Link></li>
            <li><button onClick={() => navigate('/contact')}> Contact </button></li>
          </ul>
          <button id="one-list"><img src={list} alt="" width={"50px"} onClick={handleMenuToggle} style={{cursor:"pointer"}} /></button>
          {isMenuOpen && (
            <div id="one-mobile-menu" className="animate__animated animate__fadeInDown">
              <ul>
                <li id="one-mobile-content-home"><Link to="home" smooth={true} duration={500} onClick={handleMenuToggle}> Home </Link></li>
                <li id="one-mobile-content-projects"><Link to="projects" smooth={true} duration={500} onClick={handleMenuToggle}> Projects</Link></li>
                <li id="one-mobile-content-contact"><button onClick={() => { navigate('/contact'); handleMenuToggle(); }}> Contact </button></li>
              </ul>
            </div>
          )}
        </nav>
        <div id="one-body">
          <div id="intro1">
            <span>I'm Ijaz, a</span>
            <WordFlick />
            <a href={resume} download>
              <button> Download CV <span></span> </button>
            </a>
            <Link to="projects" smooth={true} duration={500}>
              <button> My works <span></span> </button>
            </Link>
          </div>
        </div>
      </div>
      <Two />
    </div>
  );
};

export default One;











// import React from "react";
// import WordFlick from "./WordFlick";
// import logo1 from "./assets/logo1.png";
// import resume from "./assets/ijaz-resume.pdf";
// import list from "./assets/list.png";
// import { useNavigate } from "react-router";
// import Two from "./Two";
// import { Link } from "react-scroll";
// import "./css/uistyle.css";
// import './css/one.css'
// import "animate.css"

// const One = () => {
//   const navigate = useNavigate();
//   const [isMenuOpen, setIsMenuOpen] = React.useState(false);
//   const handleMenuToggle = () => {
//     setIsMenuOpen(!isMenuOpen);
//   }

//   return (
//     <div className="section" id="home">
//       <div className="one">
//         <nav id="nav">
//           <img src={logo1} width="200px" alt="img" id="one-main-logo" style={{ cursor: "pointer" }} />
//           <ul>
//             <li><Link to="home" smooth={true} duration={500}>
//               Home
//             </Link></li>
//             <li><Link to="projects" smooth={true} duration={500}>
//               Projects</Link></li>
//             <li><button onClick={() => navigate('/contact')}>
//               Contact
//             </button></li>
//           </ul>
//           {/* <button id="one-list"><img src={list} alt="" width={"50px"} onClick={handleMenuToggle} /></button> */}
//           <button
//             id="one-list"
//             onClick={() => navigate('/contact')}
//           >
//             <img src={list} alt="" width={"50px"} />
//           </button>
          
//         </nav>

//         <div id="one-body">
//           <div id="intro1">
//             <span>I'm Ijaz, a</span>
//             <WordFlick />

//             <a href={resume} download>
//               <button>
//                 Download CV
//                 <span></span>
//               </button>
//             </a>

//             <Link to="projects" smooth={true} duration={500}>
//               <button>
//                 My works
//                 <span></span>
//               </button>
//             </Link>
//           </div>
//         </div>
//       </div>

//       <Two />
//     </div>
//   );
// };

// export default One;



