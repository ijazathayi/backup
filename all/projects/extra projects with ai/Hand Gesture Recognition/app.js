// Hand Gesture Recognition - Frontend JS
let isWebcamActive = false;
let pollingInterval = null;

// Map sample output keys to UI format
const GESTURES = {
  'thumbs_up':   { name: 'Thumbs Up',   emoji: '👍', meaning: 'Approval / Good' },
  'thumbs_down': { name: 'Thumbs Down', emoji: '👎', meaning: 'Disapproval' },
  'peace':       { name: 'Peace Sign',  emoji: '✌️', meaning: 'Peace / Victory' },
  'ok':          { name: 'OK Sign',     emoji: '👌', meaning: 'OK / Perfect' },
  'fist':        { name: 'Fist',        emoji: '✊', meaning: 'Strength / Power' },
  'open_hand':   { name: 'Open Hand',   emoji: '🖐️', meaning: 'Stop / High Five' },
  'pointing':    { name: 'Pointing',    emoji: '☝️', meaning: 'Direction / Attention' },
  'rock':        { name: 'Rock Sign',   emoji: '🤘', meaning: 'Rock & Roll' },
  'three':       { name: 'Three',       emoji: '🤟', meaning: 'Three Fingers' },
  'four':        { name: 'Four',        emoji: '🤚', meaning: 'Four Fingers' },
  'unknown':     { name: 'Unknown',     emoji: '🤷', meaning: 'Unrecognized' },
  'none':        { name: 'No Hand',     emoji: '🔍', meaning: 'Waiting for hand...' }
};

// Populate reference grid
const refGrid = document.getElementById('gestureRef');
if (refGrid) {
  // Only show the original 8 gestures in reference grid
  const refKeys = ['thumbs_up', 'thumbs_down', 'peace', 'ok', 'fist', 'open_hand', 'pointing', 'rock'];
  refGrid.innerHTML = refKeys.map(key => {
    const g = GESTURES[key];
    return `
    <div class="gesture-ref-item">
      <span class="ref-emoji">${g.emoji}</span>
      <div class="ref-name">${g.name}</div>
      <div class="ref-meaning">${g.meaning}</div>
    </div>
  `}).join('');
}

// Elements
const liveResultImg = document.getElementById('liveResultImg');
const webcamOverlay = document.getElementById('webcamOverlay');
const startWebcamBtn = document.getElementById('startWebcamBtn');
const stopWebcamBtn = document.getElementById('stopWebcamBtn');
const webcamStatus = document.getElementById('webcamStatus');

const resultsSection = document.getElementById('resultsSection');
const handResults = document.getElementById('handResults');

// --- Webcam Logic ---
async function startWebcam() {
  try {
    // Start the backend feed processing by hitting /video_feed
    liveResultImg.src = "/video_feed?" + new Date().getTime(); // cache busting
    liveResultImg.style.display = 'block';
    
    startWebcamBtn.style.display = 'none';
    stopWebcamBtn.style.display = 'flex';
    webcamOverlay.style.opacity = '0';
    
    webcamStatus.textContent = 'Live';
    webcamStatus.classList.add('active');
    
    isWebcamActive = true;
    
    // No polling needed anymore since results are on the video feed
    
  } catch (err) {
    showToast('Camera error: ' + err.message, 'error');
  }
}

async function stopWebcam() {
  isWebcamActive = false;
  if (pollingInterval) clearInterval(pollingInterval);
  
  liveResultImg.src = "";
  liveResultImg.style.display = 'none';
  
  startWebcamBtn.style.display = 'flex';
  stopWebcamBtn.style.display = 'none';
  webcamOverlay.style.opacity = '1';
  
  webcamStatus.textContent = 'Inactive';
  webcamStatus.classList.remove('active');

  // Tell backend to stop stream
  fetch('/stop_feed').catch(console.error);
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.borderColor = type === 'error' ? 'var(--error)' : 'var(--green)';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
