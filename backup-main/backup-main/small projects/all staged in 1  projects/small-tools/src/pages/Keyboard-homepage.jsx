import React from 'react'
import { Link } from 'react-router'
import Keyboard1 from '../components/Keyboard1'
import '../components/css/keyboard1.css'
import Keyboard2 from '../components/Keyboard2'
import img1 from '../assets/normal-keyboard.jpg'
import img2 from '../assets/laptop-keyboard.jpg'
import img3 from '../assets/images.jpg'




const Keyboardhomepage = () => {
  return (
    <div>
        <div id='keyboard-homepage-body'>
            <Link to="/keyboard1" style={{ textDecoration: 'none' }}>
                <button className='keyboard-homepage-content' style={{border:"0" , backgroundColor:"black", borderRadius:"8px"}}><img src={img1} alt="" width={"200px"} height={"100px"}/></button>    
            </Link>
            <Link to="/keyboard2" style={{ textDecoration: 'none' }}>
                <button className='keyboard-homepage-content'  style={{border:"0", backgroundColor:"black", borderRadius:"8px"}}><img src={img2} alt="" width={"200px"} height={"100px"}/></button>    
            </Link>
                        <Link to="/keyboard3" style={{ textDecoration: 'none' }}>
                <button className='keyboard-homepage-content'  style={{border:"0", backgroundColor:"black", borderRadius:"8px"}}><img src={img3} alt="" width={"200px"} height={"100px"}/></button>    
            </Link>
        </div>
    </div>
  )
}

export default Keyboardhomepage
