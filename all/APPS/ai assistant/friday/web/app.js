/**
 * Friday AI Assistant – Web Brain
 * Enhanced: wake-word detection, settings panel, typing indicator,
 * text input, chat export, uptime polling, voice selector.
 */

// ── Feature detection ─────────────────────────────────────────────────────────
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const hasTTS = "speechSynthesis" in window;
const hasSR  = !!SpeechRecognition;

// ── DOM refs ──────────────────────────────────────────────────────────────────
const listenButton    = document.getElementById("listenButton");
const stopButton      = document.getElementById("stopButton");
const muteButton      = document.getElementById("muteButton");
const statusDot       = document.getElementById("statusDot");
const statusText      = document.getElementById("statusText");
const subtitle        = document.getElementById("subtitle");
const messages        = document.getElementById("messages");
const orb             = document.getElementById("orb");
const typingEl        = document.getElementById("typing");
const clearBtn        = document.getElementById("clearBtn");
const exportBtn       = document.getElementById("exportBtn");
const textForm        = document.getElementById("textForm");
const textInput       = document.getElementById("textInput");
const settingsToggle  = document.getElementById("settingsToggle");
const settingsPanel   = document.getElementById("settingsPanel");
const settingsClose   = document.getElementById("settingsClose");
const wakeWordInput   = document.getElementById("wakeWordInput");
const wakeWordDisplay = document.getElementById("wakeWordDisplay");
const wakeWordEnabled = document.getElementById("wakeWordEnabled");
const wakeBadge       = document.getElementById("wakeBadge");
const langSelect      = document.getElementById("langSelect");
const voiceRate       = document.getElementById("voiceRate");
const voiceRateVal    = document.getElementById("voiceRateVal");
const voicePitch      = document.getElementById("voicePitch");
const voicePitchVal   = document.getElementById("voicePitchVal");
const uptimeEl        = document.getElementById("uptime");
const commandButtons  = document.querySelectorAll("[data-command]");

// ── State ─────────────────────────────────────────────────────────────────────
let recognition      = null;
let isListening      = false;
let muted            = false;
let wakeOnly         = false; // true when orb is off but wake word is armed
let chatHistory      = [];    // { role, text, ts }

// ── Settings helpers ───────────────────────────────────────────────────────────
function getWakeWord()   { return wakeWordInput.value.trim().toLowerCase() || "friday"; }
function getLang()       { return langSelect.value; }
function getVoiceRate()  { return parseFloat(voiceRate.value); }
function getVoicePitch() { return parseFloat(voicePitch.value); }

voiceRate.addEventListener("input", () => {
  voiceRateVal.textContent = parseFloat(voiceRate.value).toFixed(1) + "×";
});
voicePitch.addEventListener("input", () => {
  voicePitchVal.textContent = parseFloat(voicePitch.value).toFixed(1);
});
wakeWordInput.addEventListener("input", () => {
  wakeWordDisplay.textContent = getWakeWord();
});
wakeWordEnabled.addEventListener("change", () => {
  wakeBadge.hidden = !wakeWordEnabled.checked;
  if (wakeWordEnabled.checked && !isListening) startWakeMode();
  else if (!wakeWordEnabled.checked && wakeOnly)  stopRecognition();
});

// ── Status helpers ─────────────────────────────────────────────────────────────
function setStatus(text, mode = "ready") {
  statusText.textContent = text;
  statusDot.className = "status-dot";
  orb.className = "orb";
  if (mode === "listening") {
    statusDot.classList.add("listening");
    orb.classList.add("listening");
  } else if (mode === "thinking") {
    orb.classList.add("thinking");
  } else if (mode === "error") {
    statusDot.classList.add("error");
  }
}

// ── Typing indicator ───────────────────────────────────────────────────────────
function showTyping()  { typingEl.hidden = false; messages.scrollTop = messages.scrollHeight; }
function hideTyping()  { typingEl.hidden = true; }

// ── Messages ───────────────────────────────────────────────────────────────────
function addMessage(role, text) {
  hideTyping();
  const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  chatHistory.push({ role, text, ts });

  const bubble = document.createElement("div");
  bubble.className = `message ${role}`;
  bubble.innerHTML = `<span class="msg-text">${escapeHTML(text)}</span>
                      <span class="msg-time">${ts}</span>`;
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
}

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Speech synthesis ───────────────────────────────────────────────────────────
function speak(text) {
  subtitle.textContent = text;
  addMessage("friday", text);
  if (muted || !hasTTS) return;

  // Pause recognition BEFORE speaking so Friday never hears itself
  pauseRecognition();

  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate   = getVoiceRate();
  utter.pitch  = getVoicePitch();
  utter.volume = 0.95;

  utter.onend = () => {
    // Small delay so the mic doesn't catch the last echo
    setTimeout(() => resumeRecognition(), 600);
  };
  utter.onerror = () => {
    setTimeout(() => resumeRecognition(), 600);
  };

  window.speechSynthesis.speak(utter);
}

// Temporarily stop recognition without changing the isListening / wakeOnly flags
function pauseRecognition() {
  if (recognition) {
    try {
      recognition.onend = null; // prevent auto-restart during pause
      recognition.stop();
    } catch { /* ignore */ }
  }
}

// Restart recognition after speaking, restoring the correct mode
function resumeRecognition() {
  if (!hasSR) return;
  if (!isListening && !wakeOnly) return;

  recognition = buildRecognition();
  try { recognition.start(); } catch { /* already started */ }

  if (isListening) {
    setStatus("Listening…", "listening");
  }
}

// ── API call ───────────────────────────────────────────────────────────────────
async function askFriday(command) {
  addMessage("user", command);
  setStatus("Thinking…", "thinking");
  showTyping();

  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command }),
    });
    const data = await res.json();

    // Always speak — whether status is ok or error
    const msg = data.speech || "I received an empty response.";
    speak(msg);
    setStatus(isListening ? "Listening…" : "Core Standby", isListening ? "listening" : "ready");
  } catch {
    hideTyping();
    setStatus("Core Offline", "error");
    speak("I cannot reach the Friday core. Please make sure the Rust server is running.");
  }
}

// ── Wake-word detection ────────────────────────────────────────────────────────
function containsWakeWord(transcript) {
  return transcript.toLowerCase().includes(getWakeWord());
}

function stripWakeWord(transcript) {
  const re = new RegExp(getWakeWord() + "[,\\s]*", "gi");
  return transcript.replace(re, "").trim();
}

// ── Recognition lifecycle ──────────────────────────────────────────────────────
function buildRecognition() {
  if (!hasSR) return null;
  const rec = new SpeechRecognition();
  rec.continuous     = true;
  rec.interimResults = true;
  rec.lang           = getLang();

  rec.onresult = (event) => {
    const result = event.results[event.results.length - 1];
    if (!result.isFinal) return; // ignore interim
    const transcript = result[0].transcript.trim();

    if (wakeOnly) {
      // Wake-word only mode: activate on wake word
      if (containsWakeWord(transcript)) {
        const cmd = stripWakeWord(transcript);
        if (cmd) {
          askFriday(cmd);
        } else {
          speak("Yes? I'm listening.");
          activateFullListening();
        }
      }
    } else {
      // Full listening mode: pass everything through
      askFriday(transcript);
    }
  };

  rec.onerror = (event) => {
    if (event.error === "no-speech") return; // common, ignore
    if (event.error === "not-allowed") {
      setStatus("Microphone Blocked", "error");
      speak("Microphone access was blocked. Please allow it in your browser settings.");
      isListening = false;
      wakeOnly    = false;
      listenButton.disabled = false;
      stopButton.disabled   = true;
    }
  };

  rec.onend = () => {
    // Auto-restart if we should still be running
    if (isListening || (wakeOnly && wakeWordEnabled.checked)) {
      try { rec.start(); } catch { /* already started */ }
    }
  };

  return rec;
}

function ensureRecognition() {
  if (!recognition) {
    recognition = buildRecognition();
  }
  return recognition;
}

function stopRecognition() {
  isListening = false;
  wakeOnly    = false;
  if (recognition) {
    recognition.onend = null;
    recognition.stop();
    recognition = null;
  }
}

// ── Start full listening ───────────────────────────────────────────────────────
function startListening() {
  if (!hasSR) {
    setStatus("Voice Unsupported", "error");
    speak("This browser does not support speech recognition. Try Chrome or Microsoft Edge.");
    return;
  }
  stopRecognition();
  recognition = buildRecognition();

  isListening = true;
  wakeOnly    = false;
  listenButton.disabled = true;
  stopButton.disabled   = false;
  setStatus("Listening…", "listening");
  subtitle.textContent = `Speak now. Say "${getWakeWord()}" followed by a command.`;
  recognition.start();
}

function activateFullListening() {
  isListening = true;
  wakeOnly    = false;
  setStatus("Listening…", "listening");
}

// ── Wake-word only mode ────────────────────────────────────────────────────────
function startWakeMode() {
  if (!hasSR || isListening) return;
  stopRecognition();
  recognition = buildRecognition();
  wakeOnly    = true;
  recognition.start();
}

function stopListening() {
  stopRecognition();
  listenButton.disabled = false;
  stopButton.disabled   = true;
  setStatus("Core Standby");
  subtitle.textContent = "Press Start Listening or type a command.";
  if (wakeWordEnabled.checked) startWakeMode();
}

// ── UI event bindings ──────────────────────────────────────────────────────────
listenButton.addEventListener("click", startListening);
stopButton.addEventListener("click", stopListening);

muteButton.addEventListener("click", () => {
  muted = !muted;
  muteButton.setAttribute("aria-pressed", String(muted));
  muteButton.innerHTML = muted
    ? '<span class="icon" aria-hidden="true">🔇</span> Voice Off'
    : '<span class="icon" aria-hidden="true">🔊</span> Voice On';
  if (muted && hasTTS) window.speechSynthesis.cancel();
});

commandButtons.forEach((btn) => {
  btn.addEventListener("click", () => askFriday(btn.dataset.command));
});

// Text input form
textForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const cmd = textInput.value.trim();
  if (!cmd) return;
  textInput.value = "";
  askFriday(cmd);
});

// Settings panel
settingsToggle.addEventListener("click", () => {
  settingsPanel.hidden = !settingsPanel.hidden;
});
settingsClose.addEventListener("click", () => {
  settingsPanel.hidden = true;
  // Rebuild recognition with new lang if needed
  if (isListening) {
    stopRecognition();
    startListening();
  }
});

// Clear chat
clearBtn.addEventListener("click", () => {
  messages.innerHTML = "";
  chatHistory = [];
  subtitle.textContent = "Chat cleared.";
});

// Export chat
exportBtn.addEventListener("click", () => {
  if (!chatHistory.length) return;
  const lines = chatHistory.map(
    (m) => `[${m.ts}] ${m.role === "user" ? "You" : "Friday"}: ${m.text}`
  );
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `friday-chat-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
});

// ── Uptime polling ────────────────────────────────────────────────────────────
async function pollStatus() {
  try {
    const res  = await fetch("/api/status");
    const data = await res.json();
    if (data.uptime_secs !== undefined) {
      const m = Math.floor(data.uptime_secs / 60);
      const s = data.uptime_secs % 60;
      uptimeEl.textContent = `up ${m}m ${s}s`;
    }
  } catch {
    uptimeEl.textContent = "";
  }
}
setInterval(pollStatus, 10000);
pollStatus();

// ── Boot ──────────────────────────────────────────────────────────────────────
if (wakeWordEnabled.checked) startWakeMode();
speak("Friday is online. I am ready for your commands.");
