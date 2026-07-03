import React, { useRef, useEffect, useState } from "react";
import './css/project.css';

const Camera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

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

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    if (!video) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Flip context horizontally to match the mirrored video
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    const dataURL = canvas.toDataURL('image/png');
    setCapturedImage(dataURL);

    const link = document.createElement('a');
    link.download = 'photo.png';
    link.href = dataURL;
    link.click();
  };

  return (
    <div className="project-page" style={{ maxWidth: '1000px' }}>
      <button className="project-back" onClick={() => (window.location.hash = '')}>Back</button>
      <h2 style={{ textAlign: 'center' }}>Camera</h2>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '2rem', justifyContent: 'center' }}>
        <div style={{ flex: '1 1 400px', textAlign: 'center' }}>
          <div style={{ background: '#000', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: '1rem', aspectRatio: '4/3' }}>
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
          <button className="project-btn" onClick={capturePhoto} style={{ width: '100%' }}>
            Capture Photo
          </button>
        </div>

        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '1rem', aspectRatio: '4/3' }}>
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured"
              style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '8px' }}
            />
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>Captured image will appear here</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Camera;
