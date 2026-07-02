import React from 'react'
import { useRef, useEffect, useState } from "react";
import { Link } from "react-router";
import logo1 from '../assets/logo1.png';
import "./css/webcamera.css"


const Webcam = () => {
      const videoRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, facingMode: 'user' })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.error("Error accessing webcam: ", err);
      });
  }, []);
      return (
    <div id='webcamera-body'>
      <Link to="/" ><img src={logo1} width="200px" alt="img" style={{cursor:"pointer", left:"0px",top:"0", position:"absolute"}} /></Link>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          id='webcamera-video'
          style={{ 
            width: 'auto', 
            height: 'auto', 
            transform: "scaleX(-1)",
            filter: "sepia(80%), blur(2px), contrast(150%), grayscale(100%) ",


 }}
        />

    </div>
  )
}

export default Webcam
