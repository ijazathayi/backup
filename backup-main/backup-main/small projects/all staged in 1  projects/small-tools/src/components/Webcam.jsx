import { useRef, useEffect, useState } from "react";

const Webcam = () => {
  const videoRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);

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

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    const dataURL = canvas.toDataURL('image/png');
    setCapturedImage(dataURL); // Update preview

    // Optional: Also download the image
    const link = document.createElement('a');
    link.download = 'photo.png';
    link.href = dataURL;
    link.click();
  };

  return (
    <div
      id="webcam-body"
      className="webcam-container"
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div
        id="webcam-container2"
        style={{
          textAlign: 'center',
          width: '50vw',
          height: '60vh',
          padding: '40px'
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ 
            width: 'auto', 
            height: '120%', 
            transform: "scaleX(-1)",
            filter: "sepia(80%), blur(2px), contrast(150%), grayscale(100%) ",


 }}
        />
        <button
          onClick={capturePhoto}
          style={{
            marginTop: '50px',
            border: '1px solid black',
            borderRadius: '10px',
            padding: '10px'
          }}
        >
          Capture Photo
        </button>
      </div>

      <div
        id="webcam-container1"
        style={{
          width: '50vw',
          height: '60vh',
          padding: '40px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {capturedImage ? (
          <img
            id="captured-image"
            src={capturedImage}
            alt="Captured"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
        ) : (
          <p style={{ color: '#888' }}>Captured image will appear here</p>
        )}
      </div>
    </div>
  );
};

export default Webcam;



// import { useRef, useEffect } from "react";

// const Webcam = () => {
//   const videoRef = useRef(null);
//   const [capturedImage, setCapturedImage] = useState(null);


//   useEffect(() => {
//     navigator.mediaDevices.getUserMedia({ video: true })
//       .then(stream => videoRef.current.srcObject = stream);
//   }, []);

//   const capturePhoto = () => {
//     const canvas = document.createElement('canvas');
//     const video = videoRef.current;
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     canvas.getContext('2d').drawImage(video, 0, 0);
//     const link = document.createElement('a');
//     link.download = 'photo.png';
//     link.href = canvas.toDataURL();
//     link.click();
    
    
//   };

//   return (
//     <div id="webcam-body" className="webcam-container" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
//     <div id="webcan-container2" style={{ textAlign: 'center', width:'50vw', height:'60vh', padding:'40px'}}>
//       <video ref={videoRef} autoPlay playsInline muted style={{ width: 'auto', height:'120%'}} />
//       <button onClick={capturePhoto} style={{ marginTop: '50px', border:'1px solid black', borderRadius:'10px', padding:'10px' }}>
//         Capture Photo
//       </button>
//     </div>
//           <div id="webcam-container1"
//           style={{ width: '50vw', height:'60vh', padding:'40px', display:'flex', justifyContent:'center', alignItems:'center' }}>
//             <img id="captured-image" src={"link"} alt="Captured" style={{ maxWidth: '100%', maxHeight: '100%' }} />

//           </div>

//     </div>
//   );
// };

// export default Webcam;

