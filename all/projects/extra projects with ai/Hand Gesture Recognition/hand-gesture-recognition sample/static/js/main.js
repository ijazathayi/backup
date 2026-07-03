/* ── GestureCV frontend ─────────────────────────────────
   Polls /gesture_data every 200 ms and updates the UI.
───────────────────────────────────────────────────────── */

const FINGER_NAMES = ["thumb", "index", "middle", "ring", "pinky"];
const POLL_MS      = 200;
const HISTORY_MAX  = 12;

let lastGesture  = "";
let history      = [];
let connected    = false;

// ── DOM refs ──────────────────────────────────────────
const statusPill      = document.getElementById("statusPill");
const statusText      = document.getElementById("statusText");
const frameCountEl    = document.getElementById("frameCount");
const gestureEmojiEl  = document.getElementById("gestureEmoji");
const gestureNameEl   = document.getElementById("gestureName");
const confidenceBarEl = document.getElementById("confidenceBar");
const confidenceLblEl = document.getElementById("confidenceLabel");
const historyListEl   = document.getElementById("historyList");

// ── Helpers ───────────────────────────────────────────
function extractEmoji(name) {
  // grab the first emoji character from the gesture name
  const m = name.match(/(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u);
  return m ? m[0] : "🤷";
}

function setConnected(state) {
  connected = state;
  statusPill.classList.toggle("active", state);
  statusText.textContent = state ? "Live — Hand Tracking" : "Reconnecting…";
}

function popEmoji() {
  gestureEmojiEl.classList.remove("pop");
  void gestureEmojiEl.offsetWidth; // reflow to restart animation
  gestureEmojiEl.classList.add("pop");
}

// ── Finger states ─────────────────────────────────────
function updateFingers(fingers) {
  FINGER_NAMES.forEach((name, i) => {
    const item  = document.getElementById(`f-${name}`);
    const badge = document.getElementById(`b-${name}`);
    if (!item || !badge) return;

    const up = fingers.length > 0 ? fingers[i] === 1 : null;
    item.classList.toggle("up",   up === true);
    item.classList.toggle("down", up === false);
    badge.textContent = up === null ? "—" : up ? "UP" : "DOWN";
  });
}

// ── History list ──────────────────────────────────────
function addHistory(name) {
  const now  = new Date();
  const time = now.toLocaleTimeString("en-US", { hour12: false });
  history.unshift({ name, time });
  if (history.length > HISTORY_MAX) history.pop();
  renderHistory();
}

function renderHistory() {
  if (history.length === 0) {
    historyListEl.innerHTML = '<li class="history-empty">No gestures yet…</li>';
    return;
  }
  historyListEl.innerHTML = history.map(h => `
    <li class="history-item">
      <span>${h.name}</span>
      <span class="history-time">${h.time}</span>
    </li>
  `).join("");
}

// ── Main poll ─────────────────────────────────────────
async function poll() {
  try {
    const res  = await fetch("/gesture_data");
    const data = await res.json();

    setConnected(true);

    // Frame counter
    frameCountEl.textContent = data.frame_count ?? 0;

    // Gesture display
    const name = data.name || "No Hand Detected";
    gestureNameEl.textContent = name;
    gestureEmojiEl.textContent = extractEmoji(name);

    // Confidence bar
    const conf = data.confidence ?? 0;
    confidenceBarEl.style.width = conf + "%";
    confidenceLblEl.textContent = `Confidence — ${conf}%`;

    // Finger states
    updateFingers(data.fingers || []);

    // History: only log when gesture changes
    if (name !== lastGesture && name !== "No Hand Detected") {
      popEmoji();
      addHistory(name);
      lastGesture = name;
    }

  } catch (err) {
    setConnected(false);
  }
}

// ── Boot ──────────────────────────────────────────────
(function init() {
  // Kick off polling
  setInterval(poll, POLL_MS);
  poll();                    // immediate first call

  // Highlight glossary item when gesture matches label
  document.querySelectorAll(".glyph-card").forEach(card => {
    card.dataset.label = card.querySelector("span").textContent.toLowerCase();
  });
})();
