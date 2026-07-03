let isWebcamActive = false;

const liveResultImg = document.getElementById('liveResultImg');
const webcamOverlay = document.getElementById('webcamOverlay');
const startWebcamBtn = document.getElementById('startWebcamBtn');
const stopWebcamBtn = document.getElementById('stopWebcamBtn');
const webcamStatus = document.getElementById('webcamStatus');

async function startWebcam() {
  try {
    liveResultImg.src = "/video_feed?" + new Date().getTime(); // cache busting
    liveResultImg.style.display = 'block';
    
    startWebcamBtn.style.display = 'none';
    stopWebcamBtn.style.display = 'flex';
    if(webcamOverlay) webcamOverlay.style.opacity = '0';
    
    if(webcamStatus) {
        webcamStatus.textContent = 'Live';
        webcamStatus.classList.add('active');
    }
    
    isWebcamActive = true;
  } catch (err) {
    showToast('Camera error: ' + err.message, 'error');
  }
}

async function stopWebcam() {
  isWebcamActive = false;
  
  liveResultImg.src = "";
  liveResultImg.style.display = 'none';
  
  startWebcamBtn.style.display = 'flex';
  stopWebcamBtn.style.display = 'none';
  if(webcamOverlay) webcamOverlay.style.opacity = '1';
  
  if(webcamStatus) {
      webcamStatus.textContent = 'Inactive';
      webcamStatus.classList.remove('active');
  }

  fetch('/stop_feed').catch(console.error);
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  if(!toast) return;
  toast.textContent = msg;
  toast.style.borderColor = type === 'error' ? 'var(--error)' : 'var(--green)';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
