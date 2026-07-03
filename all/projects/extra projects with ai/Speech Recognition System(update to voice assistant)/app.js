// ============================================================
//  F.R.I.D.A.Y. — Single-Session Wake Word Engine
//
//  ONE continuous SpeechRecognition session that NEVER stops.
//  A state machine controls what to do with each result.
//
//  SLEEPING  → hears "friday" → AWAKE (play beep, collect command)
//  AWAKE     → 2.5s of silence after command → PROCESSING
//  PROCESSING→ backend replies → SPEAKING
//  SPEAKING  → audio ends → SLEEPING
// ============================================================

// ─── State ─────────────────────────────────────────────────
let state         = 'BOOT';        // SLEEPING | AWAKE | PROCESSING | SPEAKING
let commandBuffer = '';
let commandTimer  = null;
let isSpeaking    = false;
let transcriptionHistory = [];
let recognition   = null;
let pulseAnimId   = null;
let restartCount  = 0;

// ─── Debug logger ───────────────────────────────────────────
function log(msg) {
  const el = document.getElementById('debugLog');
  if (!el) return;
  const time = new Date().toLocaleTimeString();
  el.innerHTML += `<div>[${time}] ${msg}</div>`;
  el.scrollTop = el.scrollHeight;
  console.log('[FRIDAY]', msg);
}
function clearDebug() {
  const el = document.getElementById('debugLog');
  if (el) el.innerHTML = '';
}

// ─── DOM ───────────────────────────────────────────────────
const micBtn          = document.getElementById('micBtn');
const micStatus       = document.getElementById('micStatus');
const transcriptBox   = document.getElementById('transcriptBox');
const copyBtn         = document.getElementById('copyBtn');
const replyHeader     = document.getElementById('replyHeader');
const replyBox        = document.getElementById('replyBox');
const statsRow        = document.getElementById('statsRow');
const processingBadge = document.getElementById('processingBadge');
const waveformCanvas  = document.getElementById('waveformCanvas');
const ctx2d           = waveformCanvas.getContext('2d');

// ─── Canvas helpers ────────────────────────────────────────
function resizeCanvas() {
  waveformCanvas.width  = waveformCanvas.offsetWidth  * window.devicePixelRatio;
  waveformCanvas.height = waveformCanvas.offsetHeight * window.devicePixelRatio;
  ctx2d.scale(window.devicePixelRatio, window.devicePixelRatio);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function drawIdleLine() {
  const w = waveformCanvas.offsetWidth, h = waveformCanvas.offsetHeight;
  ctx2d.clearRect(0, 0, w, h);
  ctx2d.strokeStyle = 'rgba(255,184,0,0.2)';
  ctx2d.lineWidth = 1.5;
  ctx2d.beginPath(); ctx2d.moveTo(0, h/2); ctx2d.lineTo(w, h/2); ctx2d.stroke();
}
drawIdleLine();

function startPulse(color) {
  if (pulseAnimId) { cancelAnimationFrame(pulseAnimId); pulseAnimId = null; }
  const draw = () => {
    const w = waveformCanvas.offsetWidth, h = waveformCanvas.offsetHeight;
    ctx2d.clearRect(0, 0, w, h);
    const t = Date.now() / 300;
    ctx2d.strokeStyle = color;
    ctx2d.lineWidth = 2;
    ctx2d.beginPath();
    for (let x = 0; x < w; x++) {
      const y = h/2 + Math.sin(x * 0.05 + t) * (h * 0.3);
      x === 0 ? ctx2d.moveTo(x, y) : ctx2d.lineTo(x, y);
    }
    ctx2d.lineTo(w, h/2); ctx2d.stroke();
    pulseAnimId = requestAnimationFrame(draw);
  };
  draw();
}

function stopPulse() {
  if (pulseAnimId) { cancelAnimationFrame(pulseAnimId); pulseAnimId = null; }
  drawIdleLine();
}

// ─── UI setter ─────────────────────────────────────────────
function setUI(newState) {
  state = newState;
  processingBadge.style.display = 'none';

  if (newState === 'SLEEPING') {
    micBtn.className    = 'mic-btn';
    micBtn.textContent  = '🎙';
    micStatus.className = 'mic-status';
    micStatus.textContent = 'SLEEPING — SAY  "FRIDAY"  TO ACTIVATE';
    stopPulse();

  } else if (newState === 'AWAKE') {
    micBtn.className    = 'mic-btn recording';
    micBtn.textContent  = '👂';
    micStatus.className = 'mic-status recording-text';
    micStatus.textContent = 'AWAKE — SPEAK YOUR COMMAND...';
    startPulse('rgba(255,184,0,0.9)');

  } else if (newState === 'PROCESSING') {
    micBtn.className    = 'mic-btn';
    micBtn.textContent  = '⚙️';
    micStatus.className = 'mic-status';
    micStatus.textContent = '[PROCESSING] ANALYZING COMMAND...';
    processingBadge.style.display = 'inline';
    startPulse('rgba(255,80,0,0.7)');

  } else if (newState === 'SPEAKING') {
    micBtn.className    = 'mic-btn';
    micBtn.textContent  = '🔊';
    micStatus.className = 'mic-status';
    micStatus.textContent = 'F.R.I.D.A.Y. IS SPEAKING...';
    startPulse('rgba(255,200,0,0.5)');
  }
}

// ─── Wake beep ─────────────────────────────────────────────
function playWakeBeep() {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.15].forEach((offset, i) => {
      const osc = ac.createOscillator(), g = ac.createGain();
      osc.connect(g); g.connect(ac.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800 + i * 300, ac.currentTime + offset);
      g.gain.setValueAtTime(0.12, ac.currentTime + offset);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + offset + 0.12);
      osc.start(ac.currentTime + offset);
      osc.stop(ac.currentTime + offset + 0.12);
    });
  } catch(e) {}
}

// ─── Single-session SpeechRecognition ──────────────────────
function initRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    micStatus.textContent = 'BROWSER NOT SUPPORTED — USE GOOGLE CHROME';
    log('ERROR: SpeechRecognition not supported in this browser!');
    return;
  }

  recognition = new SR();
  recognition.continuous     = true;
  recognition.interimResults = true;
  recognition.lang           = 'en-US';
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    restartCount++;
    log('Recognition session started (#' + restartCount + ') — state: ' + state);
    if (state === 'BOOT' || state === 'SLEEPING') setUI('SLEEPING');
  };

  recognition.onresult = (event) => {
    if (state === 'PROCESSING' || state === 'SPEAKING') return;

    let latestTranscript = '';
    let isFinal = false;

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const t = event.results[i][0].transcript;
      isFinal = event.results[i].isFinal;
      latestTranscript = t;
    }

    const lower = latestTranscript.toLowerCase().trim();
    log('Heard [' + state + ']: "' + lower + '"' + (isFinal ? ' [FINAL]' : ''));

    if (state === 'SLEEPING') {
      if (lower.includes('friday')) {
        log('✅ Wake word detected! Going AWAKE.');
        commandBuffer = '';
        playWakeBeep();
        setUI('AWAKE');
        const afterFriday = lower.split('friday').slice(1).join(' ').replace(/^[,\s]+/, '').trim();
        if (afterFriday) {
          commandBuffer = afterFriday;
          micStatus.textContent = 'HEARING: ' + commandBuffer.toUpperCase();
          resetCommandTimer();
        }
      }
      return;
    }

    if (state === 'AWAKE') {
      const clean = latestTranscript.replace(/friday/gi, '').trim();
      if (clean) {
        commandBuffer = clean;
        micStatus.textContent = 'HEARING: ' + clean.toUpperCase();
      }
      if (isFinal && commandBuffer.trim()) {
        resetCommandTimer();
      }
    }
  };

  recognition.onerror = (event) => {
    log('⚠️ Error: ' + event.error);
    if (event.error === 'no-speech') return; // totally normal
    if (event.error === 'aborted')   return; // we caused it
    if (event.error === 'network') {
      log('Network error — retrying in 2s...');
      setTimeout(safeStart, 2000);
      return;
    }
    if (event.error === 'not-allowed') {
      micStatus.textContent = '❌ MICROPHONE PERMISSION DENIED — CHECK BROWSER SETTINGS';
      log('FATAL: Microphone not allowed!');
      return;
    }
    setTimeout(safeStart, 1000);
  };

  recognition.onend = () => {
    log('Session ended — state: ' + state);
    if (state !== 'PROCESSING' && state !== 'SPEAKING') {
      setTimeout(safeStart, 200);
    }
  };

  safeStart();
}

function safeStart() {
  try {
    recognition.start();
    log('recognition.start() called');
  } catch(e) {
    log('start() threw: ' + e.message + ' — will retry');
    setTimeout(safeStart, 500);
  }
}

// ─── Command timer (silence = done speaking) ───────────────
function resetCommandTimer() {
  if (commandTimer) clearTimeout(commandTimer);
  commandTimer = setTimeout(() => {
    commandTimer = null;
    if (state === 'AWAKE' && commandBuffer.trim().length > 0) {
      submitCommand(commandBuffer.trim());
    }
  }, 2200); // 2.2s of silence = command complete
}

// ─── Submit command to backend ─────────────────────────────
async function submitCommand(text) {
  if (commandTimer) { clearTimeout(commandTimer); commandTimer = null; }
  log('Submitting command: "' + text + '"');
  setUI('PROCESSING');

  // Show in transcript box immediately
  transcriptBox.className   = 'transcript-box';
  transcriptBox.textContent = text;
  copyBtn.style.display     = 'block';
  transcriptBox.appendChild(copyBtn);

  try {
    const res = await fetch('/transcribe', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voice_model: document.getElementById('voiceSelect').value
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Backend error');
    log('Backend replied: "' + (data.reply_text || '') + '"');
    data.engine = 'Web Speech API (Wake Word)';
    renderAndSpeak(data);
  } catch (err) {
    log('ERROR: ' + err.message);
    showToast('Error: ' + err.message, 'error');
    setUI('SLEEPING');
    safeStart();
  }
}

// ─── Render response & speak ───────────────────────────────
function renderAndSpeak(data) {
  const text = data.transcript || '';

  // Stats
  document.getElementById('statWords').textContent      = data.word_count || 0;
  document.getElementById('statChars').textContent      = data.characters || text.length;
  document.getElementById('statConfidence').textContent = data.confidence ? (data.confidence * 100).toFixed(0) + '%' : '—';
  document.getElementById('statLang').textContent       = data.language || '—';
  document.getElementById('statEngine').textContent     = data.engine || '—';
  statsRow.style.display = 'grid';

  if (data.reply_text) {
    replyHeader.style.display = 'block';
    replyBox.style.display    = 'block';
    replyBox.textContent      = data.reply_text;
    replyBox.classList.remove('empty');
  } else {
    replyHeader.style.display = 'none';
    replyBox.style.display    = 'none';
  }

  if (text) addToHistory(text, data);

  const done = () => {
    log('Done speaking — going back to SLEEPING');
    setUI('SLEEPING');
    safeStart();
  };

  if (data.reply_audio) {
    setUI('SPEAKING');
    const fmt = 'audio/mp3';
    const snd = new Audio('data:' + fmt + ';base64,' + data.reply_audio);
    snd.onended = () => setTimeout(done, 400);
    snd.onerror = () => done();
    snd.play().catch(() => done());
  } else {
    done();
  }
}

// ─── Manual button — click to manually trigger AWAKE ───────
function toggleRecord() {
  if (state === 'SLEEPING') {
    commandBuffer = '';
    playWakeBeep();
    setUI('AWAKE');
  } else if (state === 'AWAKE') {
    // Force submit whatever has been heard so far
    if (commandBuffer.trim()) {
      submitCommand(commandBuffer.trim());
    } else {
      setUI('SLEEPING');
    }
  }
}

// ─── File upload ───────────────────────────────────────────
document.getElementById('audioFileInput').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  document.getElementById('audioFileName').textContent = file.name;
  showToast('Processing audio file...');

  setUI('PROCESSING');
  const formData = new FormData();
  formData.append('audio', file, file.name);
  formData.append('voice_model', document.getElementById('voiceSelect').value);

  try {
    const res  = await fetch('/transcribe', { method: 'POST', body: formData });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed');
    renderAndSpeak(data);
  } catch(err) {
    showToast('Error: ' + err.message, 'error');
    setUI('SLEEPING');
    try { recognition.start(); } catch(e) {}
  }
});

// ─── History ───────────────────────────────────────────────
function addToHistory(text, data) {
  const now = new Date().toLocaleTimeString();
  transcriptionHistory.unshift({ text, data, time: now });
  const historyList = document.getElementById('historyList');
  const empty = historyList.querySelector('.empty');
  if (empty) empty.remove();
  if (transcriptionHistory.length > 10) {
    transcriptionHistory.pop();
    const items = historyList.querySelectorAll('.history-item');
    if (items.length >= 10) items[items.length - 1].remove();
  }
  const item = document.createElement('div');
  item.className = 'history-item';
  item.innerHTML = `<div class="history-text">${text}</div><div class="history-meta">${now} · ${data.word_count||0} words · ${data.engine||'—'}</div>`;
  item.onclick = () => {
    transcriptBox.textContent = text;
    transcriptBox.className   = 'transcript-box';
    copyBtn.style.display     = 'block';
    transcriptBox.appendChild(copyBtn);
  };
  historyList.prepend(item);
}

function clearHistory() {
  transcriptionHistory = [];
  document.getElementById('historyList').innerHTML = '<div class="history-item empty" style="border:none;text-align:center;color:var(--text-muted);">NO LOGS FOUND.</div>';
  showToast('MEMORY PURGED');
}

function copyTranscript() {
  const text = transcriptBox.textContent.replace('[COPY]', '').trim();
  navigator.clipboard.writeText(text).then(() => {
    copyBtn.textContent = '[COPIED]';
    setTimeout(() => { copyBtn.textContent = '[COPY]'; }, 2000);
  });
}

// ─── Toast ─────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const toast       = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.borderColor = type === 'error' ? 'var(--red)' : 'var(--cyan)';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── Boot ──────────────────────────────────────────────────
window.addEventListener('load', () => {
  initRecognition();
});
