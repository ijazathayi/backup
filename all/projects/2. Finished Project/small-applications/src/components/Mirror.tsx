import React, { useRef, useEffect } from "react";
import './css/project.css';

const Mirror = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.error("Error accessing webcam: ", err);
      });

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="project-page" style={{ maxWidth: '800px', textAlign: 'center' }}>
      <button className="project-back" onClick={() => (window.location.hash = '')}>Back</button>
      <h2>Mirror</h2>
      <p>A simple webcam mirror.</p>
      
      <div style={{ 
        background: '#000', 
        borderRadius: '16px', 
        overflow: 'hidden', 
        border: '1px solid var(--border-color)', 
        margin: '2rem auto', 
        aspectRatio: '16/9',
        boxShadow: 'var(--shadow-glow)'
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            transform: "scaleX(-1)"
          }}
        />
      </div>
    </div>
  );
};

export default Mirror;
