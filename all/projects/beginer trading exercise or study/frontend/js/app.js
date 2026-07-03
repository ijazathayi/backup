/* ============================================
   TradeLearn â€” Main Application JS
   Bilingual (English / Tamil)
   ============================================ */

// ---- CONFIG ----
const API_BASE = 'http://localhost:5000/api';

// ---- STATE ----
let currentLang = 'en';
let allTopics = [];
let allCandles = [];
let allGlossary = [];
let quizQuestions = [];
let quizCurrent = 0;
let quizAnswers = {};
let quizAnsweredThis = false;
let currentTopicFilter = 'all';
let currentCandleFilter = 'all';

// ---- LANGUAGE ----
function toggleLang() {
  currentLang = currentLang === 'en' ? 'ta' : 'en';
  const btn = document.getElementById('langToggle');
  btn.textContent = currentLang === 'en' ? 'à®¤à®®à®¿à®´à¯' : 'English';
  document.body.classList.toggle('lang-ta', currentLang === 'ta');
  applyLang();
  // Re-render current visible content
  renderTopics(allTopics);
  renderCandles(allCandles);
  renderGlossary(allGlossary);
}

function applyLang() {
  document.querySelectorAll('[data-en]').forEach(el => {
    el.textContent = currentLang === 'ta' ? el.dataset.ta : el.dataset.en;
  });
}

function t(obj) {
  if (!obj) return '';
  return obj[currentLang] || obj['en'] || '';
}

// ---- PAGE NAVIGATION ----
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');
  const navLink = document.querySelector(`.nav-link[onclick="showPage('${pageId}')"]`);
  if (navLink) navLink.classList.add('active');
  // Close mobile nav
  document.getElementById('navLinks').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // Load data on demand
  if (pageId === 'topics' && allTopics.length === 0) loadTopics();
  if (pageId === 'candlesticks' && allCandles.length === 0) loadCandles();
  if (pageId === 'glossary' && allGlossary.length === 0) loadGlossary();
}

function toggleMobileNav() {
  document.getElementById('navLinks').classList.toggle('open');
}

// ---- TOPICS ----
async function loadTopics() {
  try {
    const res = await fetch(`${API_BASE}/topics`);
    const json = await res.json();
    allTopics = json.data;
    renderTopics(allTopics);
  } catch (e) {
    allTopics = getLocalTopics();
    renderTopics(allTopics);
  }
}

function filterTopics(cat) {
  currentTopicFilter = cat;
  document.querySelectorAll('#topicFilters .filter-btn').forEach(b => b.classList.remove('active'));
  if (event && event.target) {
    event.target.classList.add('active');
  }
  const filtered = cat === 'all' ? allTopics : allTopics.filter(t => t.difficulty === cat);
  renderTopics(filtered);
}

function getDifficultyLabel(diff) {
  if (diff === 'beginner') return currentLang === 'ta' ? 'à®¤à¯Šà®Ÿà®•à¯à®•à®®à¯' : 'Beginner';
  if (diff === 'intermediate') return currentLang === 'ta' ? 'à®‡à®Ÿà¯ˆà®¨à®¿à®²à¯ˆ' : 'Intermediate';
  if (diff === 'advanced') return currentLang === 'ta' ? 'à®®à¯‡à®®à¯à®ªà®Ÿà¯à®Ÿ' : 'Advanced';
  if (diff === 'pro') return currentLang === 'ta' ? 'à®ªà¯à®°à¯‹' : 'Pro';
  if (diff === 'execution') return currentLang === 'ta' ? 'à®šà¯†à®¯à®²à¯à®ªà®¾à®Ÿà¯' : 'Execution';
  return diff;
}

function renderTopics(topics) {
  const grid = document.getElementById('topicsGrid');
  if (!topics || topics.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:40px">${currentLang === 'ta' ? 'à®¤à®²à¯ˆà®ªà¯à®ªà¯à®•à®³à¯ à®‡à®²à¯à®²à¯ˆ' : 'No topics found'}</div>`;
    return;
  }
  grid.innerHTML = topics.map(topic => `
    <div class="topic-card" onclick="openTopicModal(${topic.id})">
      <div class="topic-card-header">
        <div class="topic-icon">${topic.icon}</div>
        <div>
          <div class="topic-card-title">${t(topic.title)}</div>
          <div class="topic-card-sub">${topic.category}</div>
        </div>
      </div>
      <div class="topic-card-desc">${t(topic.description)}</div>
      <div class="topic-card-footer">
        <span class="difficulty-badge ${topic.difficulty}">${getDifficultyLabel(topic.difficulty)}</span>
        <span class="read-time">â± ${topic.readTime} ${currentLang === 'ta' ? 'à®¨à®¿à®®à®¿à®Ÿà®®à¯' : 'min read'}</span>
      </div>
    </div>
  `).join('');
}

function openTopicModal(id) {
  const topic = allTopics.find(t => t.id === id);
  if (!topic) return;
  const points = t(topic.keyPoints);
  const lessonPlan = t(topic.lessonPlan);
  const practice = t(topic.practice);
  const mistakes = t(topic.mistakes);
  const checklist = t(topic.checklist);
  const sourceNote = t(topic.sourceNote);
  document.getElementById('topicModalContent').innerHTML = `
    <div class="modal-topic-icon">${topic.icon}</div>
    <div class="modal-topic-title">${t(topic.title)}</div>
    <div class="modal-topic-badge">
      <span class="difficulty-badge ${topic.difficulty}">${getDifficultyLabel(topic.difficulty)}</span>
      <span class="read-time" style="margin-left:10px">â± ${topic.readTime} ${currentLang === 'ta' ? 'à®¨à®¿à®®à®¿à®Ÿà®®à¯' : 'min read'}</span>
    </div>
    <div class="modal-desc">${t(topic.description)}</div>
    <div class="modal-keypoints">
      <h4>${currentLang === 'ta' ? 'ðŸ”‘ à®®à¯à®•à¯à®•à®¿à®¯ à®ªà¯à®³à¯à®³à®¿à®•à®³à¯' : 'ðŸ”‘ Key Points'}</h4>
      ${Array.isArray(points) ? points.map(p => `<div class="keypoint-item">${p}</div>`).join('') : ''}
    </div>
    ${Array.isArray(lessonPlan) ? `
      <div class="modal-keypoints modal-deep-section">
        <h4>${currentLang === 'ta' ? 'Study Plan' : 'Study Plan'}</h4>
        ${lessonPlan.map(p => `<div class="keypoint-item">${p}</div>`).join('')}
      </div>
    ` : ''}
    ${Array.isArray(practice) ? `
      <div class="modal-keypoints modal-deep-section">
        <h4>${currentLang === 'ta' ? 'Practice Drill' : 'Practice Drill'}</h4>
        ${practice.map(p => `<div class="keypoint-item">${p}</div>`).join('')}
      </div>
    ` : ''}
    ${Array.isArray(mistakes) ? `
      <div class="modal-keypoints modal-deep-section">
        <h4>${currentLang === 'ta' ? 'Mistakes to Avoid' : 'Mistakes to Avoid'}</h4>
        ${mistakes.map(p => `<div class="keypoint-item">${p}</div>`).join('')}
      </div>
    ` : ''}
    ${Array.isArray(checklist) ? `
      <div class="modal-keypoints modal-deep-section">
        <h4>${currentLang === 'ta' ? 'Mastery Checklist' : 'Mastery Checklist'}</h4>
        ${checklist.map(p => `<div class="keypoint-item">${p}</div>`).join('')}
      </div>
    ` : ''}
    ${sourceNote ? `<div class="source-note">${sourceNote}</div>` : ''}
  `;
  document.getElementById('topicModal').classList.add('open');
}

// ---- CANDLESTICKS ----
async function loadCandles() {
  try {
    const res = await fetch(`${API_BASE}/candlesticks`);
    const json = await res.json();
    allCandles = json.data;
    renderCandles(allCandles);
  } catch (e) {
    allCandles = getLocalCandles();
    renderCandles(allCandles);
  }
}

function filterCandles(type) {
  currentCandleFilter = type;
  document.querySelectorAll('#page-candlesticks .filter-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  const filtered = type === 'all' ? allCandles : allCandles.filter(c => c.bullishBearish === type || c.type === type);
  renderCandles(filtered);
}

function renderCandles(candles) {
  const grid = document.getElementById('candlesGrid');
  if (!candles || candles.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:40px">${currentLang === 'ta' ? 'à®µà®Ÿà®¿à®µà®™à¯à®•à®³à¯ à®‡à®²à¯à®²à¯ˆ' : 'No patterns found'}</div>`;
    return;
  }
  grid.innerHTML = candles.map(c => `
    <div class="candle-card" onclick="openCandleModal(${c.id})">
      <div class="candle-card-header">
        <div class="candle-visual">${drawCandleSVG(c, 60, 80)}</div>
        <div class="candle-card-info">
          <div class="candle-name">${t(c.name)}</div>
          <div class="candle-name-ta">${c.name.ta}</div>
          <span class="candle-badge ${c.bullishBearish === 'both' ? 'strong' : c.bullishBearish}">
            ${getBadgeLabel(c)}
          </span>
        </div>
      </div>
      <div class="candle-desc">${t(c.description)}</div>
      <div class="candle-signal">
        <strong>${currentLang === 'ta' ? 'à®šà®®à®¿à®•à¯à®žà¯ˆ:' : 'Signal:'}</strong> ${t(c.signal)}
      </div>
    </div>
  `).join('');
}

function getBadgeLabel(c) {
  if (c.bullishBearish === 'bullish') return currentLang === 'ta' ? 'ðŸŸ¢ à®¨à¯‡à®°à¯à®®à®±à¯ˆ' : 'ðŸŸ¢ Bullish';
  if (c.bullishBearish === 'bearish') return currentLang === 'ta' ? 'ðŸ”´ à®Žà®¤à®¿à®°à¯à®®à®±à¯ˆ' : 'ðŸ”´ Bearish';
  if (c.bullishBearish === 'neutral') return currentLang === 'ta' ? 'âšª à®¨à®Ÿà¯à®¨à®¿à®²à¯ˆ' : 'âšª Neutral';
  return currentLang === 'ta' ? 'ðŸ”· à®µà®²à¯à®µà®¾à®©' : 'ðŸ”· Strong';
}

function openCandleModal(id) {
  const c = allCandles.find(x => x.id === id);
  if (!c) return;
  const signalClass = c.bullishBearish === 'both' ? 'strong' : c.bullishBearish;
  document.getElementById('candleModalContent').innerHTML = `
    <div class="candle-modal-header">
      <div class="candle-modal-svg">${drawCandleSVG(c, 80, 120)}</div>
      <div>
        <div class="candle-modal-name">${t(c.name)}</div>
        <div class="candle-modal-name-ta">${c.name.ta}</div>
        <span class="candle-badge ${signalClass}" style="margin-top:10px;display:inline-flex">${getBadgeLabel(c)}</span>
        <div style="margin-top:8px;font-size:0.8rem;color:var(--text-dim)">${currentLang === 'ta' ? 'à®µà®Ÿà®¿à®µà®®à¯: ' : 'Pattern: '}${c.pattern}</div>
      </div>
    </div>
    <div class="candle-modal-section">
      <h4>${currentLang === 'ta' ? 'à®µà®¿à®³à®•à¯à®•à®®à¯' : 'Description'}</h4>
      <p>${t(c.description)}</p>
    </div>
    <div class="candle-modal-section">
      <h4>${currentLang === 'ta' ? 'à®šà®®à®¿à®•à¯à®žà¯ˆ' : 'Signal'}</h4>
      <div class="signal-box ${signalClass}">
        <span>ðŸ“¡</span> ${t(c.signal)}
      </div>
    </div>
    <div class="candle-modal-section">
      <h4>${currentLang === 'ta' ? 'à®šà®¨à¯à®¤à¯ˆ à®‰à®³à®µà®¿à®¯à®²à¯' : 'Market Psychology'}</h4>
      <p>${t(c.psychology)}</p>
    </div>
  `;
  document.getElementById('candleModal').classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// ---- SVG CANDLE DRAWING ----
function drawCandleSVG(candle, w, h) {
  const color = candle.bullishBearish === 'bearish' ? '#E74C3C' :
                candle.bullishBearish === 'neutral' ? '#7F8C8D' :
                candle.bullishBearish === 'both' ? '#6C63FF' : '#27AE60';
  const cx = w / 2;
  let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">`;

  switch (candle.bodySize) {
    case 'none': // Doji
      svg += `<line x1="${cx}" y1="${h*0.1}" x2="${cx}" y2="${h*0.9}" stroke="${color}" stroke-width="2"/>`;
      svg += `<rect x="${cx-w*0.18}" y="${h*0.47}" width="${w*0.36}" height="${h*0.06}" fill="${color}" rx="1"/>`;
      break;
    case 'small':
      if (candle.shadowSize === 'long-lower') { // Hammer
        svg += `<line x1="${cx}" y1="${h*0.05}" x2="${cx}" y2="${h*0.25}" stroke="${color}" stroke-width="2"/>`;
        svg += `<rect x="${cx-w*0.2}" y="${h*0.25}" width="${w*0.4}" height="${h*0.2}" fill="${color}" rx="2"/>`;
        svg += `<line x1="${cx}" y1="${h*0.45}" x2="${cx}" y2="${h*0.95}" stroke="${color}" stroke-width="2"/>`;
      } else if (candle.shadowSize === 'long-upper') { // Shooting Star / Inverted Hammer
        svg += `<line x1="${cx}" y1="${h*0.05}" x2="${cx}" y2="${h*0.55}" stroke="${color}" stroke-width="2"/>`;
        svg += `<rect x="${cx-w*0.2}" y="${h*0.55}" width="${w*0.4}" height="${h*0.2}" fill="${color}" rx="2"/>`;
        svg += `<line x1="${cx}" y1="${h*0.75}" x2="${cx}" y2="${h*0.88}" stroke="${color}" stroke-width="2"/>`;
      } else { // Spinning Top small
        svg += `<line x1="${cx}" y1="${h*0.1}" x2="${cx}" y2="${h*0.35}" stroke="${color}" stroke-width="2"/>`;
        svg += `<rect x="${cx-w*0.2}" y="${h*0.35}" width="${w*0.4}" height="${h*0.3}" fill="${color}" rx="2"/>`;
        svg += `<line x1="${cx}" y1="${h*0.65}" x2="${cx}" y2="${h*0.9}" stroke="${color}" stroke-width="2"/>`;
      }
      break;
    case 'large': // Engulfing
      svg += `<line x1="${cx}" y1="${h*0.08}" x2="${cx}" y2="${h*0.18}" stroke="${color}" stroke-width="2"/>`;
      svg += `<rect x="${cx-w*0.28}" y="${h*0.18}" width="${w*0.56}" height="${h*0.64}" fill="${color}" rx="3"/>`;
      svg += `<line x1="${cx}" y1="${h*0.82}" x2="${cx}" y2="${h*0.92}" stroke="${color}" stroke-width="2"/>`;
      break;
    case 'full': // Marubozu
      svg += `<rect x="${cx-w*0.28}" y="${h*0.08}" width="${w*0.56}" height="${h*0.84}" fill="${color}" rx="3"/>`;
      break;
    case 'mixed': // Morning/Evening Star â€” show 3 candles
      const w3 = w / 3.5;
      // Candle 1
      const c1 = candle.type === 'bullish' ? '#E74C3C' : '#27AE60';
      svg += `<rect x="${w*0.04}" y="${h*0.18}" width="${w3}" height="${h*0.5}" fill="${c1}" rx="2"/>`;
      svg += `<line x1="${w*0.04+w3/2}" y1="${h*0.08}" x2="${w*0.04+w3/2}" y2="${h*0.18}" stroke="${c1}" stroke-width="1.5"/>`;
      svg += `<line x1="${w*0.04+w3/2}" y1="${h*0.68}" x2="${w*0.04+w3/2}" y2="${h*0.82}" stroke="${c1}" stroke-width="1.5"/>`;
      // Candle 2 (doji in middle)
      const cx2 = w/2;
      svg += `<rect x="${cx2-w3*0.4}" y="${h*0.42}" width="${w3*0.8}" height="${h*0.16}" fill="#7F8C8D" rx="2"/>`;
      svg += `<line x1="${cx2}" y1="${h*0.28}" x2="${cx2}" y2="${h*0.42}" stroke="#7F8C8D" stroke-width="1.5"/>`;
      svg += `<line x1="${cx2}" y1="${h*0.58}" x2="${cx2}" y2="${h*0.72}" stroke="#7F8C8D" stroke-width="1.5"/>`;
      // Candle 3
      svg += `<rect x="${w*0.64}" y="${h*0.22}" width="${w3}" height="${h*0.5}" fill="${color}" rx="2"/>`;
      svg += `<line x1="${w*0.64+w3/2}" y1="${h*0.1}" x2="${w*0.64+w3/2}" y2="${h*0.22}" stroke="${color}" stroke-width="1.5"/>`;
      svg += `<line x1="${w*0.64+w3/2}" y1="${h*0.72}" x2="${w*0.64+w3/2}" y2="${h*0.9}" stroke="${color}" stroke-width="1.5"/>`;
      break;
    default: // equal-long (spinning top)
      svg += `<line x1="${cx}" y1="${h*0.08}" x2="${cx}" y2="${h*0.3}" stroke="${color}" stroke-width="2"/>`;
      svg += `<rect x="${cx-w*0.2}" y="${h*0.3}" width="${w*0.4}" height="${h*0.4}" fill="${color}" rx="2"/>`;
      svg += `<line x1="${cx}" y1="${h*0.7}" x2="${cx}" y2="${h*0.92}" stroke="${color}" stroke-width="2"/>`;
  }
  svg += `</svg>`;
  return svg;
}

// ---- QUIZ ----
async function loadQuizQuestions() {
  try {
    const res = await fetch(`${API_BASE}/quiz`);
    const json = await res.json();
    quizQuestions = json.data;
  } catch (e) {
    quizQuestions = getLocalQuiz();
  }
}

function startQuiz() {
  document.getElementById('quizStart').style.display = 'none';
  document.getElementById('quizResult').style.display = 'none';
  document.getElementById('quizGame').style.display = 'block';
  quizCurrent = 0;
  quizAnswers = {};
  // Shuffle questions
  quizQuestions = quizQuestions.sort(() => Math.random() - 0.5);
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const q = quizQuestions[quizCurrent];
  if (!q) return;
  quizAnsweredThis = false;
  const total = quizQuestions.length;
  const progress = ((quizCurrent) / total) * 100;

  const options = t(q.options);
  const questionText = t(q.question);

  document.getElementById('quizGame').innerHTML = `
    <div class="quiz-game-wrap">
      <div class="quiz-progress-bar-outer">
        <div class="quiz-progress-bar-inner" style="width:${progress}%"></div>
      </div>
      <div class="quiz-progress-text">
        ${currentLang === 'ta' ? 'à®•à¯‡à®³à¯à®µà®¿' : 'Question'} ${quizCurrent + 1} ${currentLang === 'ta' ? 'à®‡à®²à¯' : 'of'} ${total}
      </div>
      <div class="quiz-q-card">
        <div class="quiz-q-num">${currentLang === 'ta' ? 'à®•à¯‡à®³à¯à®µà®¿' : 'Question'} ${quizCurrent + 1}</div>
        <div class="quiz-q-text">${questionText}</div>
        <div class="quiz-options">
          ${options.map((opt, i) => `
            <button class="quiz-option" onclick="selectAnswer(${i})" id="opt_${i}">${opt}</button>
          `).join('')}
        </div>
        <div class="quiz-explanation" id="quizExplanation">
          <strong>${currentLang === 'ta' ? 'à®µà®¿à®³à®•à¯à®•à®®à¯:' : 'Explanation:'}</strong> ${t(q.explanation)}
        </div>
        <div class="quiz-next-btn" id="nextBtnWrap" style="display:none">
          <button class="btn btn-primary" onclick="nextQuestion()">
            ${quizCurrent + 1 < total ? (currentLang === 'ta' ? 'à®…à®Ÿà¯à®¤à¯à®¤ à®•à¯‡à®³à¯à®µà®¿ â†’' : 'Next Question â†’') : (currentLang === 'ta' ? 'à®®à¯à®Ÿà®¿à®µà¯ à®•à®¾à®£à¯à®• â†’' : 'See Results â†’')}
          </button>
        </div>
      </div>
    </div>
  `;
}

function selectAnswer(selectedIdx) {
  if (quizAnsweredThis) return;
  quizAnsweredThis = true;
  const q = quizQuestions[quizCurrent];
  quizAnswers[q.id] = selectedIdx;

  // Show correct/wrong
  document.querySelectorAll('.quiz-option').forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correct) btn.classList.add('correct');
    else if (i === selectedIdx && selectedIdx !== q.correct) btn.classList.add('wrong');
  });

  document.getElementById('quizExplanation').classList.add('show');
  document.getElementById('nextBtnWrap').style.display = 'block';
}

function nextQuestion() {
  quizCurrent++;
  if (quizCurrent >= quizQuestions.length) {
    showQuizResult();
  } else {
    renderQuizQuestion();
  }
}

function showQuizResult() {
  let correct = 0;
  const details = [];

  quizQuestions.forEach(q => {
    const selected = quizAnswers[q.id];
    const isCorrect = selected === q.correct;
    if (isCorrect) correct++;
    details.push({ q, selected, isCorrect });
  });

  const total = quizQuestions.length;
  const score = Math.round((correct / total) * 100);
  const grade = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Average' : 'Keep Studying';
  const gradeClass = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'average' : 'keep';
  const gradeEmoji = score >= 80 ? 'ðŸ†' : score >= 60 ? 'ðŸ‘' : score >= 40 ? 'ðŸ“š' : 'ðŸ’ª';

  const gradeTa = score >= 80 ? 'à®®à®¿à®•à®šà¯ à®šà®¿à®±à®¨à¯à®¤à®¤à¯' : score >= 60 ? 'à®¨à®²à¯à®²à®¤à¯' : score >= 40 ? 'à®šà®°à®¾à®šà®°à®¿' : 'à®¤à¯Šà®Ÿà®°à¯à®¨à¯à®¤à¯ à®ªà®Ÿà®¿à®¯à¯à®™à¯à®•à®³à¯';

  document.getElementById('quizGame').style.display = 'none';
  const resultDiv = document.getElementById('quizResult');
  resultDiv.style.display = 'block';
  resultDiv.innerHTML = `
    <div class="quiz-result-wrap">
      <div class="quiz-result-card">
        <div class="score-circle" style="--score:${score}">
          <div class="score-num">${score}%</div>
        </div>
        <div class="result-grade ${gradeClass}">${gradeEmoji} ${currentLang === 'ta' ? gradeTa : grade}</div>
        <div class="result-sub">
          ${correct}/${total} ${currentLang === 'ta' ? 'à®šà®°à®¿à®¯à®¾à®© à®ªà®¤à®¿à®²à¯à®•à®³à¯' : 'correct answers'}
        </div>
        <div class="result-answers">
          ${details.map(d => `
            <div class="result-answer-item">
              <span class="result-icon">${d.isCorrect ? 'âœ…' : 'âŒ'}</span>
              <div>
                <div style="font-weight:600;color:var(--text);margin-bottom:2px">${t(d.q.question)}</div>
                ${!d.isCorrect ? `<div style="color:var(--success);font-size:0.82rem">${currentLang === 'ta' ? 'à®šà®°à®¿à®¯à®¾à®© à®ªà®¤à®¿à®²à¯:' : 'Correct:'} ${t(d.q.options)[d.q.correct]}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
        <div class="result-btns">
          <button class="btn btn-primary" onclick="startQuiz()">${currentLang === 'ta' ? 'à®®à¯€à®£à¯à®Ÿà¯à®®à¯ à®®à¯à®¯à®±à¯à®šà®¿à®•à¯à®•à®µà¯à®®à¯' : 'Try Again'}</button>
          <button class="btn btn-outline" onclick="showPage('topics')">${currentLang === 'ta' ? 'à®®à¯‡à®²à¯à®®à¯ à®•à®±à¯à®±à¯à®•à¯à®•à¯Šà®³à¯à®³à¯à®™à¯à®•à®³à¯' : 'Learn More'}</button>
        </div>
      </div>
    </div>
  `;
  // Submit to backend
  submitQuizToAPI(quizAnswers);
}

async function submitQuizToAPI(answers) {
  try {
    await fetch(`${API_BASE}/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers })
    });
  } catch (e) { /* silent fail */ }
}

// ---- GLOSSARY ----
async function loadGlossary() {
  try {
    const res = await fetch(`${API_BASE}/glossary`);
    const json = await res.json();
    allGlossary = json.data;
    renderGlossary(allGlossary);
  } catch (e) {
    allGlossary = getLocalGlossary();
    renderGlossary(allGlossary);
  }
}

function searchGlossary(query) {
  const q = query.toLowerCase().trim();
  if (!q) return renderGlossary(allGlossary);
  const filtered = allGlossary.filter(g =>
    g.term.en.toLowerCase().includes(q) ||
    g.term.ta.includes(query) ||
    g.definition.en.toLowerCase().includes(q) ||
    g.definition.ta.includes(query)
  );
  renderGlossary(filtered);
}

function renderGlossary(items) {
  const list = document.getElementById('glossaryList');
  if (!items || items.length === 0) {
    list.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:40px">${currentLang === 'ta' ? 'à®šà¯Šà®±à¯à®•à®³à¯ à®‡à®²à¯à®²à¯ˆ' : 'No terms found'}</div>`;
    return;
  }
  list.innerHTML = items.map(g => `
    <div class="glossary-item">
      <div class="glossary-term">
        ${g.term.en}
        <span class="glossary-term-ta">${g.term.ta}</span>
      </div>
      <div class="glossary-def">${g.definition.en}</div>
      <div class="glossary-def-ta">${g.definition.ta}</div>
    </div>
  `).join('');
}

// ---- HERO ANIMATION ----
function buildHeroAnimation() {
  const wrap = document.getElementById('candleAnimation');
  if (!wrap) return;
  const candles = [
    { h: 0.55, body: 0.3, top: 0.15, bull: true },
    { h: 0.65, body: 0.35, top: 0.1, bull: false },
    { h: 0.75, body: 0.4, top: 0.12, bull: true },
    { h: 0.5, body: 0.25, top: 0.2, bull: true },
    { h: 0.8, body: 0.45, top: 0.08, bull: false },
    { h: 0.6, body: 0.3, top: 0.15, bull: true },
    { h: 0.7, body: 0.38, top: 0.1, bull: true },
  ];
  const W = 320, H = 380;
  const cw = 32, gap = 12;
  const totalW = candles.length * (cw + gap) - gap;
  const startX = (W - totalW) / 2;

  let svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  // Grid lines
  for (let i = 1; i <= 4; i++) {
    const y = H * 0.1 + (H * 0.8 / 4) * i;
    svg += `<line x1="10" y1="${y}" x2="${W-10}" y2="${y}" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>`;
  }

  candles.forEach((c, i) => {
    const x = startX + i * (cw + gap);
    const color = c.bull ? '#27AE60' : '#E74C3C';
    const fullH = H * c.h;
    const bodyH = fullH * c.body / c.h;
    const topY = H * 0.1 + (H * 0.8 - fullH);
    const bodyY = topY + (c.top * fullH);
    const cx = x + cw / 2;
    const delay = i * 0.12;

    svg += `<g style="animation: candleGrow 0.6s ease ${delay}s both">`;
    // wick
    svg += `<line x1="${cx}" y1="${topY}" x2="${cx}" y2="${topY + fullH}" stroke="${color}" stroke-width="2" opacity="0.7"/>`;
    // body
    svg += `<rect x="${x}" y="${bodyY}" width="${cw}" height="${bodyH}" fill="${color}" rx="4" opacity="0.9"/>`;
    svg += `</g>`;
  });

  svg += `</svg>`;
  wrap.innerHTML = svg;
}

// ---- LOCAL FALLBACK DATA (same as backend seed) ----
function getLocalTopics() {
  return [
    { id:1, category:"basics", title:{en:"What is Stock Market?",ta:"à®ªà®™à¯à®•à¯ à®šà®¨à¯à®¤à¯ˆ à®Žà®©à¯à®±à®¾à®²à¯ à®Žà®©à¯à®©?"}, description:{en:"A stock market is a place where buyers and sellers trade shares of publicly listed companies. It allows companies to raise capital and investors to earn returns.",ta:"à®ªà®™à¯à®•à¯ à®šà®¨à¯à®¤à¯ˆ à®Žà®©à¯à®ªà®¤à¯ à®ªà¯Šà®¤à¯à®µà®¿à®²à¯ à®ªà®Ÿà¯à®Ÿà®¿à®¯à®²à®¿à®Ÿà®ªà¯à®ªà®Ÿà¯à®Ÿ à®¨à®¿à®±à¯à®µà®©à®™à¯à®•à®³à®¿à®©à¯ à®ªà®™à¯à®•à¯à®•à®³à¯ˆ à®µà®¾à®™à¯à®•à¯à®µà¯‹à®°à¯ à®®à®±à¯à®±à¯à®®à¯ à®µà®¿à®±à¯à®ªà®µà®°à¯à®•à®³à¯ à®µà®°à¯à®¤à¯à®¤à®•à®®à¯ à®šà¯†à®¯à¯à®¯à¯à®®à¯ à®‡à®Ÿà®®à®¾à®•à¯à®®à¯."}, keyPoints:{en:["BSE and NSE are major Indian stock exchanges","Stocks represent ownership in a company","Prices change based on supply and demand","Market hours: 9:15 AM - 3:30 PM IST"],ta:["BSE à®®à®±à¯à®±à¯à®®à¯ NSE à®®à¯à®•à¯à®•à®¿à®¯ à®‡à®¨à¯à®¤à®¿à®¯ à®ªà®™à¯à®•à¯ à®µà®°à¯à®¤à¯à®¤à®• à®¨à®¿à®²à¯ˆà®¯à®™à¯à®•à®³à¯","à®ªà®™à¯à®•à¯à®•à®³à¯ à®’à®°à¯ à®¨à®¿à®±à¯à®µà®©à®¤à¯à®¤à®¿à®²à¯ à®‰à®°à®¿à®®à¯ˆà®¯à¯ˆ à®•à¯à®±à®¿à®•à¯à®•à®¿à®©à¯à®±à®©","à®µà®¿à®²à¯ˆà®•à®³à¯ à®¤à¯‡à®µà¯ˆ à®®à®±à¯à®±à¯à®®à¯ à®µà®¿à®¨à®¿à®¯à¯‹à®•à®¤à¯à®¤à®¿à®©à¯ à®…à®Ÿà®¿à®ªà¯à®ªà®Ÿà¯ˆà®¯à®¿à®²à¯ à®®à®¾à®±à¯à®®à¯","à®šà®¨à¯à®¤à¯ˆ à®¨à¯‡à®°à®®à¯: à®•à®¾à®²à¯ˆ 9:15 - à®®à®¾à®²à¯ˆ 3:30 IST"]}, icon:"ðŸ“ˆ", difficulty:"beginner", readTime:5 },
    { id:2, category:"basics", title:{en:"Types of Trading",ta:"à®µà®°à¯à®¤à¯à®¤à®•à®¤à¯à®¤à®¿à®©à¯ à®µà®•à¯ˆà®•à®³à¯"}, description:{en:"There are several types of trading strategies based on time frame and trader style.",ta:"à®µà®°à¯à®¤à¯à®¤à®•à®°à®¿à®©à¯ à®¨à¯‡à®° à®…à®Ÿà¯à®Ÿà®µà®£à¯ˆ à®®à®±à¯à®±à¯à®®à¯ à®ªà®¾à®£à®¿à®¯à®¿à®©à¯ à®…à®Ÿà®¿à®ªà¯à®ªà®Ÿà¯ˆà®¯à®¿à®²à¯ à®ªà®² à®µà®•à¯ˆà®¯à®¾à®© à®µà®°à¯à®¤à¯à®¤à®• à®‰à®¤à¯à®¤à®¿à®•à®³à¯ à®‰à®³à¯à®³à®©."}, keyPoints:{en:["Intraday: Buy and sell within the same day","Swing Trading: Hold for days to weeks","Positional: Hold for weeks to months","Long-term: Hold for years"],ta:["à®‡à®©à¯à®Ÿà¯à®°à®¾à®Ÿà¯‡: à®…à®¤à¯‡ à®¨à®¾à®³à®¿à®²à¯ à®µà®¾à®™à¯à®•à®¿ à®µà®¿à®±à¯à®ªà®¤à¯","à®¸à¯à®µà®¿à®™à¯: à®šà®¿à®² à®¨à®¾à®Ÿà¯à®•à®³à¯ à®®à¯à®¤à®²à¯ à®µà®¾à®°à®™à¯à®•à®³à¯","à®ªà¯Šà®šà®¿à®·à®©à®²à¯: à®µà®¾à®°à®™à¯à®•à®³à¯ à®®à¯à®¤à®²à¯ à®®à®¾à®¤à®™à¯à®•à®³à¯","à®¨à¯€à®£à¯à®Ÿ à®•à®¾à®²: à®ªà®² à®†à®£à¯à®Ÿà¯à®•à®³à¯"]}, icon:"ðŸ”„", difficulty:"beginner", readTime:6 },
    { id:3, category:"basics", title:{en:"Understanding Charts",ta:"à®µà®¿à®³à®•à¯à®•à®ªà¯à®ªà®Ÿà®™à¯à®•à®³à¯ˆ à®ªà¯à®°à®¿à®¨à¯à®¤à¯à®•à¯Šà®³à¯à®µà®¤à¯"}, description:{en:"Charts are visual representations of price movements over time. They are the primary tool for technical analysis.",ta:"à®µà®¿à®³à®•à¯à®•à®ªà¯à®ªà®Ÿà®™à¯à®•à®³à¯ à®•à®¾à®²à®ªà¯à®ªà¯‹à®•à¯à®•à®¿à®²à¯ à®µà®¿à®²à¯ˆ à®‡à®¯à®•à¯à®•à®™à¯à®•à®³à®¿à®©à¯ à®•à®¾à®Ÿà¯à®šà®¿ à®ªà®¿à®°à®¤à®¿à®¨à®¿à®¤à®¿à®¤à¯à®¤à¯à®µà®™à¯à®•à®³à¯."}, keyPoints:{en:["Line Chart: Simple price line","Bar Chart: Shows OHLC","Candlestick: Most popular â€” OHLC with colors","Timeframes: 1min, 5min, 15min, 1hr, Daily"],ta:["à®•à¯‹à®Ÿà¯ à®µà®¿à®³à®•à¯à®•à®ªà¯à®ªà®Ÿà®®à¯: à®Žà®³à®¿à®¯ à®µà®¿à®²à¯ˆ à®•à¯‹à®Ÿà¯","à®ªà®¾à®°à¯ à®µà®¿à®³à®•à¯à®•à®ªà¯à®ªà®Ÿà®®à¯: OHLC à®•à®¾à®Ÿà¯à®Ÿà¯à®•à®¿à®±à®¤à¯","à®•à¯‡à®£à¯à®Ÿà®¿à®²à¯à®¸à¯à®Ÿà®¿à®•à¯: à®®à®¿à®•à®µà¯à®®à¯ à®ªà®¿à®°à®ªà®²à®®à®¾à®©à®¤à¯","à®¨à¯‡à®° à®…à®Ÿà¯à®Ÿà®µà®£à¯ˆà®•à®³à¯: 1à®¨à®¿à®®à®¿à®Ÿà®®à¯, 5à®¨à®¿à®®à®¿à®Ÿà®®à¯, 15à®¨à®¿à®®à®¿à®Ÿà®®à¯"]}, icon:"ðŸ“Š", difficulty:"beginner", readTime:7 },
    { id:4, category:"basics", title:{en:"Support and Resistance",ta:"à®†à®¤à®°à®µà¯ à®®à®±à¯à®±à¯à®®à¯ à®Žà®¤à®¿à®°à¯à®ªà¯à®ªà¯"}, description:{en:"Support is where price stops falling. Resistance is where price stops rising. Key concepts in technical analysis.",ta:"à®†à®¤à®°à®µà¯ à®Žà®©à¯à®ªà®¤à¯ à®µà®¿à®²à¯ˆ à®µà®¿à®´à¯à®µà®¤à¯ˆ à®¨à®¿à®±à¯à®¤à¯à®¤à¯à®®à¯ à®‡à®Ÿà®®à¯. à®Žà®¤à®¿à®°à¯à®ªà¯à®ªà¯ à®Žà®©à¯à®ªà®¤à¯ à®µà®¿à®²à¯ˆ à®‰à®¯à®°à¯à®µà®¤à¯ˆ à®¨à®¿à®±à¯à®¤à¯à®¤à¯à®®à¯ à®‡à®Ÿà®®à¯."}, keyPoints:{en:["Support = price floor","Resistance = price ceiling","Broken support becomes resistance","Strong levels tested multiple times"],ta:["à®†à®¤à®°à®µà¯ = à®µà®¿à®²à¯ˆ à®¤à®³à®®à¯","à®Žà®¤à®¿à®°à¯à®ªà¯à®ªà¯ = à®µà®¿à®²à¯ˆ à®•à¯‚à®°à¯ˆ","à®‰à®Ÿà¯ˆà®¨à¯à®¤ à®†à®¤à®°à®µà¯ à®Žà®¤à®¿à®°à¯à®ªà¯à®ªà®¾à®• à®®à®¾à®±à¯à®®à¯","à®µà®²à¯à®µà®¾à®© à®¨à®¿à®²à¯ˆà®•à®³à¯ à®ªà®²à®®à¯à®±à¯ˆ à®šà¯‹à®¤à®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®®à¯"]}, icon:"ðŸ—ï¸", difficulty:"intermediate", readTime:8 },
    { id:5, category:"indicators", title:{en:"Moving Averages (MA)",ta:"à®¨à®•à®°à¯à®®à¯ à®šà®°à®¾à®šà®°à®¿ (MA)"}, description:{en:"A moving average smooths price data to identify trend direction. Calculated by averaging closing prices over periods.",ta:"à®¨à®•à®°à¯à®®à¯ à®šà®°à®¾à®šà®°à®¿ à®µà®¿à®²à¯ˆ à®¤à®°à®µà¯ˆ à®šà®®à®©à¯ à®šà¯†à®¯à¯à®¤à¯ à®ªà¯‹à®•à¯à®•à®¿à®©à¯ à®¤à®¿à®šà¯ˆà®¯à¯ˆ à®•à®¾à®Ÿà¯à®Ÿà¯à®•à®¿à®±à®¤à¯."}, keyPoints:{en:["SMA: Equal weight to all periods","EMA: More weight to recent prices","20 EMA: Short-term trend","50 SMA: Medium-term","200 SMA: Long-term"],ta:["SMA: à®…à®©à¯ˆà®¤à¯à®¤à®¿à®±à¯à®•à¯à®®à¯ à®šà®® à®Žà®Ÿà¯ˆ","EMA: à®šà®®à¯€à®ªà®¤à¯à®¤à®¿à®¯ à®µà®¿à®²à¯ˆà®•à®³à¯à®•à¯à®•à¯ à®…à®¤à®¿à®• à®Žà®Ÿà¯ˆ","20 EMA: à®•à¯à®±à¯à®•à®¿à®¯ à®•à®¾à®² à®ªà¯‹à®•à¯à®•à¯","50 SMA: à®¨à®Ÿà¯à®¤à¯à®¤à®° à®•à®¾à®²","200 SMA: à®¨à¯€à®£à¯à®Ÿ à®•à®¾à®²"]}, icon:"ðŸ“‰", difficulty:"intermediate", readTime:10 },
    { id:6, category:"indicators", title:{en:"RSI - Relative Strength Index",ta:"RSI - à®¤à¯Šà®Ÿà®°à¯à®ªà¯ à®µà®²à®¿à®®à¯ˆ à®•à¯à®±à®¿à®¯à¯€à®Ÿà¯"}, description:{en:"RSI measures speed and change of price movements, oscillating 0-100. Helps identify overbought/oversold.",ta:"RSI à®µà®¿à®²à¯ˆ à®‡à®¯à®•à¯à®•à®™à¯à®•à®³à®¿à®©à¯ à®µà¯‡à®•à®¤à¯à®¤à¯ˆ à®…à®³à®µà®¿à®Ÿà¯à®•à®¿à®±à®¤à¯, 0-100 à®µà®°à¯ˆ à®Šà®šà®²à®¾à®Ÿà¯à®•à®¿à®±à®¤à¯."}, keyPoints:{en:["RSI > 70 = Overbought","RSI < 30 = Oversold","RSI = 50 = Neutral","14-period is standard"],ta:["RSI > 70 = à®…à®¤à®¿à®• à®µà®¾à®™à¯à®•à®²à¯","RSI < 30 = à®…à®¤à®¿à®• à®µà®¿à®±à¯à®ªà®©à¯ˆ","RSI = 50 = à®¨à®Ÿà¯à®¨à®¿à®²à¯ˆ","14-à®•à®¾à®²à®•à®Ÿà¯à®Ÿà®®à¯ à®¨à®¿à®²à¯ˆà®¯à®¾à®©à®¤à¯"]}, icon:"âš¡", difficulty:"intermediate", readTime:9 },
    { id:7, category:"risk", title:{en:"Risk Management",ta:"à®†à®ªà®¤à¯à®¤à¯ à®®à¯‡à®²à®¾à®£à¯à®®à¯ˆ"}, description:{en:"Risk management protects your capital from large losses. It is the most important skill for any trader.",ta:"à®†à®ªà®¤à¯à®¤à¯ à®®à¯‡à®²à®¾à®£à¯à®®à¯ˆ à®‰à®™à¯à®•à®³à¯ à®®à¯‚à®²à®¤à®©à¯ˆ à®ªà¯†à®°à®¿à®¯ à®‡à®´à®ªà¯à®ªà¯à®•à®³à®¿à®²à®¿à®°à¯à®¨à¯à®¤à¯ à®ªà®¾à®¤à¯à®•à®¾à®•à¯à®•à®¿à®±à®¤à¯."}, keyPoints:{en:["Never risk more than 1-2% per trade","Always use Stop Loss","Risk:Reward should be 1:2 minimum","Never trade with money you can't lose"],ta:["à®’à®°à¯ à®µà®°à¯à®¤à¯à®¤à®•à®¤à¯à®¤à®¿à®²à¯ 1-2% à®•à¯à®•à¯à®®à¯ à®…à®¤à®¿à®•à®®à®¾à®• à®†à®ªà®¤à¯à®¤à®¿à®²à¯ à®µà¯‡à®£à¯à®Ÿà®¾à®®à¯","à®Žà®ªà¯à®ªà¯‹à®¤à¯à®®à¯ à®¸à¯à®Ÿà®¾à®ªà¯ à®²à®¾à®¸à¯ à®ªà®¯à®©à¯à®ªà®Ÿà¯à®¤à¯à®¤à¯à®™à¯à®•à®³à¯","à®†à®ªà®¤à¯à®¤à¯:à®µà¯†à®•à¯à®®à®¤à®¿ à®•à¯à®±à¯ˆà®¨à¯à®¤à®¤à¯ 1:2","à®‡à®´à®•à¯à®• à®®à¯à®Ÿà®¿à®¯à®¾à®¤ à®ªà®£à®¤à¯à®¤à®¿à®²à¯ à®µà®°à¯à®¤à¯à®¤à®•à®®à¯ à®šà¯†à®¯à¯à®¯à®¾à®¤à¯€à®°à¯à®•à®³à¯"]}, icon:"ðŸ›¡ï¸", difficulty:"beginner", readTime:8 },
    { id:8, category:"psychology", title:{en:"Trading Psychology",ta:"à®µà®°à¯à®¤à¯à®¤à®• à®‰à®³à®µà®¿à®¯à®²à¯"}, description:{en:"Fear and greed are the two most common emotions that lead to poor trading decisions.",ta:"à®ªà®¯à®®à¯ à®®à®±à¯à®±à¯à®®à¯ à®ªà¯‡à®°à®¾à®šà¯ˆ à®®à¯‹à®šà®®à®¾à®© à®µà®°à¯à®¤à¯à®¤à®• à®®à¯à®Ÿà®¿à®µà¯à®•à®³à¯à®•à¯à®•à¯ à®µà®´à®¿à®µà®•à¯à®•à¯à®•à¯à®®à¯ à®‡à®°à®£à¯à®Ÿà¯ à®ªà¯Šà®¤à¯à®µà®¾à®© à®‰à®£à®°à¯à®šà¯à®šà®¿à®•à®³à¯."}, keyPoints:{en:["Fear leads to exiting trades too early","Greed makes you hold losers too long","FOMO is dangerous","Keep a trading journal","Always follow your trading plan"],ta:["à®ªà®¯à®®à¯ à®®à®¿à®• à®šà¯€à®•à¯à®•à®¿à®°à®®à¯ à®µà¯†à®³à®¿à®¯à¯‡à®± à®µà¯ˆà®•à¯à®•à¯à®®à¯","à®ªà¯‡à®°à®¾à®šà¯ˆ à®¤à¯‹à®²à¯à®µà®¿ à®µà®°à¯à®¤à¯à®¤à®•à®™à¯à®•à®³à¯ˆ à®¨à¯€à®£à¯à®Ÿ à®¨à¯‡à®°à®®à¯ à®µà¯ˆà®¤à¯à®¤à®¿à®°à¯à®•à¯à®• à®µà¯ˆà®•à¯à®•à¯à®®à¯","FOMO à®†à®ªà®¤à¯à®¤à®¾à®©à®¤à¯","à®µà®°à¯à®¤à¯à®¤à®• à®œà®°à¯à®©à®²à¯ à®µà¯ˆà®¤à¯à®¤à®¿à®°à¯à®™à¯à®•à®³à¯"]}, icon:"ðŸ§ ", difficulty:"beginner", readTime:7 },
    { id:9, category:"indicators", title:{en:"Fibonacci Retracement",ta:"à®ƒà®ªà®¿à®ªà¯‹à®©à®¾à®šà¯à®šà®¿ à®°à®¿à®Ÿà¯à®°à¯‡à®¸à¯à®®à¯†à®©à¯à®Ÿà¯"}, description:{en:"Technical tool using horizontal lines based on Fibonacci sequence to find support and resistance.",ta:"à®†à®¤à®°à®µà¯ à®®à®±à¯à®±à¯à®®à¯ à®Žà®¤à®¿à®°à¯à®ªà¯à®ªà¯ˆ à®•à®£à¯à®Ÿà®±à®¿à®¯ à®ƒà®ªà®¿à®ªà¯‹à®©à®¾à®šà¯à®šà®¿ à®µà®°à®¿à®šà¯ˆà®¯à®¿à®©à¯ à®…à®Ÿà®¿à®ªà¯à®ªà®Ÿà¯ˆà®¯à®¿à®²à¯ à®…à®®à¯ˆà®¨à¯à®¤ à®•à®°à¯à®µà®¿."}, keyPoints:{en:["61.8% is Golden Ratio","Finds entry on pullbacks"],ta:["61.8% à®•à¯‹à®²à¯à®Ÿà®©à¯ à®°à¯‡à®·à®¿à®¯à¯‹","à®¤à®¿à®°à¯à®®à¯à®ªà®¿ à®µà®°à¯à®®à¯ à®ªà¯‹à®¤à¯ à®¨à¯à®´à¯ˆà®µà¯ˆ à®•à®£à¯à®Ÿà®±à®¿à®¯à¯à®®à¯"]}, icon:"ðŸ“", difficulty:"advanced", readTime:12 },
    { id:10, category:"basics", title:{en:"Price Action Trading",ta:"à®µà®¿à®²à¯ˆ à®¨à®Ÿà®µà®Ÿà®¿à®•à¯à®•à¯ˆ à®µà®°à¯à®¤à¯à®¤à®•à®®à¯"}, description:{en:"Trading purely on naked charts without lagging indicators.",ta:"à®ªà®¿à®©à¯à®¤à®™à¯à®•à®¿à®¯ à®•à¯à®±à®¿à®•à®¾à®Ÿà¯à®Ÿà®¿à®•à®³à¯ à®‡à®²à¯à®²à®¾à®®à®²à¯ à®¤à¯‚à®¯ à®µà®¿à®³à®•à¯à®•à®ªà¯à®ªà®Ÿà®™à¯à®•à®³à®¿à®²à¯ à®µà®°à¯à®¤à¯à®¤à®•à®®à¯ à®šà¯†à®¯à¯à®¤à®²à¯."}, keyPoints:{en:["Higher Highs, Lower Lows","Candlestick confirmation"],ta:["à®…à®¤à®¿à®• à®‰à®¯à®°à¯à®µà¯à®•à®³à¯, à®•à¯à®±à¯ˆà®¨à¯à®¤ à®¤à®¾à®´à¯à®µà¯à®•à®³à¯","à®®à¯†à®´à¯à®•à¯à®¤à®¿à®°à®¿ à®‰à®±à¯à®¤à®¿à®ªà¯à®ªà®Ÿà¯à®¤à¯à®¤à®²à¯"]}, icon:"ðŸ‘ï¸", difficulty:"advanced", readTime:15 },
    { id:11, category:"risk", title:{en:"Options & Derivatives",ta:"à®µà®¿à®°à¯à®ªà¯à®ªà®™à¯à®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯ à®µà®´à®¿à®¤à¯à®¤à¯‹à®©à¯à®±à®²à¯à®•à®³à¯"}, description:{en:"Financial contracts giving the right but not obligation to buy/sell assets.",ta:"à®šà¯Šà®¤à¯à®¤à¯à®•à¯à®•à®³à¯ˆ à®µà®¾à®™à¯à®•/à®µà®¿à®±à¯à®• à®‰à®°à®¿à®®à¯ˆ à®…à®³à®¿à®•à¯à®•à¯à®®à¯ à®¨à®¿à®¤à®¿ à®’à®ªà¯à®ªà®¨à¯à®¤à®™à¯à®•à®³à¯."}, keyPoints:{en:["Calls = Buy right","Puts = Sell right","Theta decay"],ta:["à®…à®´à¯ˆà®ªà¯à®ªà¯à®•à®³à¯ = à®µà®¾à®™à¯à®•à¯à®®à¯ à®‰à®°à®¿à®®à¯ˆ","à®ªà¯à®Ÿà¯à®¸à¯ = à®µà®¿à®±à¯à®•à¯à®®à¯ à®‰à®°à®¿à®®à¯ˆ","à®¨à¯‡à®° à®šà®¿à®¤à¯ˆà®µà¯"]}, icon:"ðŸ“œ", difficulty:"pro", readTime:20 },
    { id:12, category:"basics", title:{en:"Institutional Order Flow",ta:"à®¨à®¿à®±à¯à®µà®© à®†à®°à¯à®Ÿà®°à¯ à®“à®Ÿà¯à®Ÿà®®à¯"}, description:{en:"Trading with smart money, understanding liquidity grabs and order blocks.",ta:"à®¸à¯à®®à®¾à®°à¯à®Ÿà¯ à®®à®©à®¿ à®‰à®Ÿà®©à¯ à®µà®°à¯à®¤à¯à®¤à®•à®®à¯ à®šà¯†à®¯à¯à®¤à®²à¯, à®ªà®£à®ªà¯à®ªà¯à®´à®•à¯à®• à®ˆà®°à¯à®ªà¯à®ªà¯à®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯ à®†à®°à¯à®Ÿà®°à¯ à®ªà®¿à®³à®¾à®•à¯à®•à¯à®•à®³à¯."}, keyPoints:{en:["Smart Money Concepts","Order Blocks","Fair Value Gaps"],ta:["à®¸à¯à®®à®¾à®°à¯à®Ÿà¯ à®®à®©à®¿ à®•à®¾à®©à¯à®šà¯†à®ªà¯à®Ÿà¯à®¸à¯","à®†à®°à¯à®Ÿà®°à¯ à®ªà®¿à®³à®¾à®•à¯à®•à¯à®•à®³à¯","à®¨à®¿à®¯à®¾à®¯à®®à®¾à®© à®®à®¤à®¿à®ªà¯à®ªà¯ à®‡à®Ÿà¯ˆà®µà¯†à®³à®¿à®•à®³à¯"]}, icon:"ðŸ¦", difficulty:"pro", readTime:18 },
    { id:13, category:"execution", title:{en:"Brokerage & Order Types",ta:"à®¤à®°à®•à®°à¯ à®®à®±à¯à®±à¯à®®à¯ à®†à®°à¯à®Ÿà®°à¯ à®µà®•à¯ˆà®•à®³à¯"}, description:{en:"The mechanics of live trading. Understanding brokers, taxes, and how to execute Market, Limit, and Stop orders.",ta:"à®¨à¯‡à®°à®Ÿà®¿ à®µà®°à¯à®¤à¯à®¤à®•à®¤à¯à®¤à®¿à®©à¯ à®‡à®¯à®•à¯à®•à®µà®¿à®¯à®²à¯. à®®à®¾à®°à¯à®•à¯à®•à¯†à®Ÿà¯, à®²à®¿à®®à®¿à®Ÿà¯ à®®à®±à¯à®±à¯à®®à¯ à®¸à¯à®Ÿà®¾à®ªà¯ à®†à®°à¯à®Ÿà®°à¯à®•à®³à¯ˆ à®Žà®µà¯à®µà®¾à®±à¯ à®šà¯†à®¯à®²à¯à®ªà®Ÿà¯à®¤à¯à®¤à¯à®µà®¤à¯."}, keyPoints:{en:["Market vs Limit Orders","Stop-Loss (SL) & GTT","Bid-ask spread"],ta:["à®®à®¾à®°à¯à®•à¯à®•à¯†à®Ÿà¯ vs à®²à®¿à®®à®¿à®Ÿà¯ à®†à®°à¯à®Ÿà®°à¯à®•à®³à¯","à®¸à¯à®Ÿà®¾à®ªà¯-à®²à®¾à®¸à¯ (SL) & GTT","à®ªà®¿à®Ÿà¯-à®†à®¸à¯à®•à¯ à®¸à¯à®ªà¯à®°à¯†à®Ÿà¯"]}, icon:"ðŸ’»", difficulty:"execution", readTime:12 },
    { id:14, category:"execution", title:{en:"Paper Trading & Sizing",ta:"à®•à®¾à®•à®¿à®¤ à®µà®°à¯à®¤à¯à®¤à®•à®®à¯ & à®…à®³à®µà¯"}, description:{en:"Test your strategy before risking money. Learn to calculate position size to survive losing streaks.",ta:"à®ªà®£à®¤à¯à®¤à¯ˆ à®†à®ªà®¤à¯à®¤à®¿à®²à¯ à®µà¯ˆà®ªà¯à®ªà®¤à®±à¯à®•à¯ à®®à¯à®©à¯ à®‰à®¤à¯à®¤à®¿à®¯à¯ˆ à®šà¯‹à®¤à®¿à®•à¯à®•à®µà¯à®®à¯. à®¨à®¿à®²à¯ˆ à®…à®³à®µà¯ˆ à®•à®£à®•à¯à®•à®¿à®Ÿ à®•à®±à¯à®±à¯à®•à¯à®•à¯Šà®³à¯à®³à¯à®™à¯à®•à®³à¯."}, keyPoints:{en:["Backtest strategies","Never risk more than 1%","Calculate quantity based on Stop-Loss"],ta:["à®‰à®¤à¯à®¤à®¿à®•à®³à¯ˆ à®šà¯‹à®¤à®¿à®•à¯à®•à®µà¯à®®à¯","1% à®•à¯à®•à¯à®®à¯ à®…à®¤à®¿à®•à®®à®¾à®• à®†à®ªà®¤à¯à®¤à®¿à®²à¯ à®µà¯ˆà®•à¯à®• à®µà¯‡à®£à¯à®Ÿà®¾à®®à¯","à®…à®³à®µà¯ˆà®•à¯ à®•à®£à®•à¯à®•à®¿à®Ÿà¯à®™à¯à®•à®³à¯"]}, icon:"ðŸ“", difficulty:"execution", readTime:10 },
    { id:15, category:"execution", title:{en:"Live Trading Psychology",ta:"à®¨à¯‡à®°à®Ÿà®¿ à®µà®°à¯à®¤à¯à®¤à®• à®‰à®³à®µà®¿à®¯à®²à¯"}, description:{en:"Real money brings real emotions. Managing FOMO, revenge trading, and following your pre-market checklist.",ta:"à®‰à®£à¯à®®à¯ˆà®¯à®¾à®© à®ªà®£à®®à¯ à®‰à®£à¯à®®à¯ˆà®¯à®¾à®© à®‰à®£à®°à¯à®šà¯à®šà®¿à®•à®³à¯ˆà®•à¯ à®•à¯Šà®£à¯à®Ÿà¯à®µà®°à¯à®•à®¿à®±à®¤à¯. FOMO, à®ªà®´à®¿à®µà®¾à®™à¯à®•à¯à®®à¯ à®µà®°à¯à®¤à¯à®¤à®•à®®à¯ à®¨à®¿à®°à¯à®µà®•à®¿à®¤à¯à®¤à®²à¯."}, keyPoints:{en:["Don't revenge trade","Maintain a daily journal","Have a pre-market routine"],ta:["à®ªà®´à®¿à®µà®¾à®™à¯à®•à¯à®®à¯ à®µà®°à¯à®¤à¯à®¤à®•à®®à¯ à®šà¯†à®¯à¯à®¯ à®µà¯‡à®£à¯à®Ÿà®¾à®®à¯","à®¤à®¿à®©à®šà®°à®¿ à®œà®°à¯à®©à®²à¯ˆ à®ªà®°à®¾à®®à®°à®¿à®•à¯à®•à®µà¯à®®à¯","à®®à¯à®©à¯-à®šà®¨à¯à®¤à¯ˆ à®µà®´à®•à¯à®•à®¤à¯à®¤à¯ˆà®•à¯ à®•à¯Šà®£à¯à®Ÿà®¿à®°à¯à®™à¯à®•à®³à¯"]}, icon:"ðŸ§˜", difficulty:"execution", readTime:15 }
  ];
}

function getLocalCandles() {
  return [
    { id:1, name:{en:"Doji",ta:"à®Ÿà¯‹à®œà®¿"}, type:"neutral", pattern:"single", description:{en:"Opens and closes at virtually the same price. Signals indecision in the market.",ta:"à®¤à®¿à®±à®ªà¯à®ªà¯ à®®à®±à¯à®±à¯à®®à¯ à®®à¯‚à®Ÿà®²à¯ à®•à®¿à®Ÿà¯à®Ÿà®¤à¯à®¤à®Ÿà¯à®Ÿ à®’à®°à¯‡ à®µà®¿à®²à¯ˆà®¯à®¿à®²à¯. à®šà®¨à¯à®¤à¯ˆà®¯à®¿à®²à¯ à®®à¯à®Ÿà®¿à®µà®¿à®©à¯à®®à¯ˆà®¯à¯ˆ à®šà®®à®¿à®•à¯à®žà¯ˆ à®šà¯†à®¯à¯à®•à®¿à®±à®¤à¯."}, signal:{en:"Indecision / Reversal possible",ta:"à®®à¯à®Ÿà®¿à®µà®¿à®©à¯à®®à¯ˆ / à®¤à®¿à®°à¯à®®à¯à®ªà¯à®¤à®²à¯ à®šà®¾à®¤à¯à®¤à®¿à®¯à®®à¯"}, psychology:{en:"Market is undecided. Watch the next candle.",ta:"à®šà®¨à¯à®¤à¯ˆ à®®à¯à®Ÿà®¿à®µà¯ à®šà¯†à®¯à¯à®¯à®µà®¿à®²à¯à®²à¯ˆ. à®…à®Ÿà¯à®¤à¯à®¤ à®®à¯†à®´à¯à®•à¯à®¤à®¿à®°à®¿à®¯à¯ˆ à®•à®µà®©à®¿à®¯à¯à®™à¯à®•à®³à¯."}, emoji:"âž•", color:"#9B59B6", bodySize:"none", shadowSize:"equal", bullishBearish:"neutral" },
    { id:2, name:{en:"Hammer",ta:"à®šà¯à®¤à¯à®¤à®¿"}, type:"bullish", pattern:"single", description:{en:"Small body at top with long lower shadow. Appears after downtrend â€” signals bullish reversal.",ta:"à®®à¯‡à®²à¯‡ à®šà®¿à®±à®¿à®¯ à®‰à®Ÿà®²à¯, à®¨à¯€à®£à¯à®Ÿ à®•à¯€à®´à¯ à®¨à®¿à®´à®²à¯. à®•à¯€à®´à¯à®¨à¯‹à®•à¯à®•à®¿à®¯ à®ªà¯‹à®•à¯à®•à®¿à®±à¯à®•à¯ à®ªà®¿à®±à®•à¯ à®¨à¯‡à®°à¯à®®à®±à¯ˆ à®¤à®¿à®°à¯à®®à¯à®ªà¯à®¤à®²à¯ˆ à®šà®®à®¿à®•à¯à®žà¯ˆ à®šà¯†à®¯à¯à®•à®¿à®±à®¤à¯."}, signal:{en:"Bullish reversal after downtrend",ta:"à®•à¯€à®´à¯à®¨à¯‹à®•à¯à®•à®¿à®¯ à®ªà¯‹à®•à¯à®•à®¿à®±à¯à®•à¯ à®ªà®¿à®±à®•à¯ à®¨à¯‡à®°à¯à®®à®±à¯ˆ à®¤à®¿à®°à¯à®®à¯à®ªà¯à®¤à®²à¯"}, psychology:{en:"Sellers pushed down but buyers fought back strongly.",ta:"à®µà®¿à®±à¯à®ªà®µà®°à¯à®•à®³à¯ à®•à¯€à®´à¯‡ à®¤à®³à¯à®³à®¿à®©à®°à¯, à®†à®©à®¾à®²à¯ à®µà®¾à®™à¯à®•à¯à®µà¯‹à®°à¯ à®µà®²à¯à®µà®¾à®• à®¤à®¿à®°à¯à®®à¯à®ªà®¿ à®µà®¨à¯à®¤à®©à®°à¯."}, emoji:"ðŸ”¨", color:"#27AE60", bodySize:"small", shadowSize:"long-lower", bullishBearish:"bullish" },
    { id:3, name:{en:"Shooting Star",ta:"à®·à¯‚à®Ÿà¯à®Ÿà®¿à®™à¯ à®¸à¯à®Ÿà®¾à®°à¯"}, type:"bearish", pattern:"single", description:{en:"Small body at bottom with long upper shadow. Appears after uptrend â€” signals bearish reversal.",ta:"à®•à¯€à®´à¯‡ à®šà®¿à®±à®¿à®¯ à®‰à®Ÿà®²à¯, à®¨à¯€à®£à¯à®Ÿ à®®à¯‡à®²à¯ à®¨à®¿à®´à®²à¯. à®®à¯‡à®²à¯à®¨à¯‹à®•à¯à®•à®¿à®¯ à®ªà¯‹à®•à¯à®•à®¿à®±à¯à®•à¯ à®ªà®¿à®±à®•à¯ à®Žà®¤à®¿à®°à¯à®®à®±à¯ˆ à®¤à®¿à®°à¯à®®à¯à®ªà¯à®¤à®²à¯ˆ à®šà®®à®¿à®•à¯à®žà¯ˆ à®šà¯†à®¯à¯à®•à®¿à®±à®¤à¯."}, signal:{en:"Bearish reversal after uptrend",ta:"à®®à¯‡à®²à¯à®¨à¯‹à®•à¯à®•à®¿à®¯ à®ªà¯‹à®•à¯à®•à®¿à®±à¯à®•à¯ à®ªà®¿à®±à®•à¯ à®Žà®¤à®¿à®°à¯à®®à®±à¯ˆ à®¤à®¿à®°à¯à®®à¯à®ªà¯à®¤à®²à¯"}, psychology:{en:"Buyers pushed up but sellers overwhelmed them.",ta:"à®µà®¾à®™à¯à®•à¯à®µà¯‹à®°à¯ à®®à¯‡à®²à¯‡ à®¤à®³à¯à®³à®¿à®©à®°à¯, à®†à®©à®¾à®²à¯ à®µà®¿à®±à¯à®ªà®µà®°à¯à®•à®³à¯ à®®à®¿à®•à¯ˆà®¤à¯à®¤à®©à®°à¯."}, emoji:"â­", color:"#E74C3C", bodySize:"small", shadowSize:"long-upper", bullishBearish:"bearish" },
    { id:4, name:{en:"Bullish Engulfing",ta:"à®ªà¯à®²à¯à®²à®¿à®·à¯ à®Žà®™à¯à®•à¯à®²à¯à®ƒà®ªà®¿à®™à¯"}, type:"bullish", pattern:"double", description:{en:"Small bearish candle followed by large bullish candle that engulfs it. Strong reversal signal.",ta:"à®šà®¿à®±à®¿à®¯ à®Žà®¤à®¿à®°à¯à®®à®±à¯ˆ à®®à¯†à®´à¯à®•à¯à®¤à®¿à®°à®¿à®¯à¯ˆ à®¤à¯Šà®Ÿà®°à¯à®¨à¯à®¤à¯ à®…à®¤à¯ˆ à®µà®¿à®´à¯à®™à¯à®•à¯à®®à¯ à®ªà¯†à®°à®¿à®¯ à®¨à¯‡à®°à¯à®®à®±à¯ˆ à®®à¯†à®´à¯à®•à¯à®¤à®¿à®°à®¿."}, signal:{en:"Strong bullish reversal",ta:"à®µà®²à¯à®µà®¾à®© à®¨à¯‡à®°à¯à®®à®±à¯ˆ à®¤à®¿à®°à¯à®®à¯à®ªà¯à®¤à®²à¯"}, psychology:{en:"Bulls completely overpowered bears.",ta:"à®•à®¾à®³à¯ˆà®•à®³à¯ à®•à®°à®Ÿà®¿à®•à®³à¯ˆ à®®à¯à®±à¯à®±à®¿à®²à¯à®®à¯ à®®à®¿à®•à¯ˆà®¤à¯à®¤à®©à®°à¯."}, emoji:"ðŸŸ¢", color:"#27AE60", bodySize:"large", shadowSize:"minimal", bullishBearish:"bullish" },
    { id:5, name:{en:"Bearish Engulfing",ta:"à®ªà®¿à®¯à®°à®¿à®·à¯ à®Žà®™à¯à®•à¯à®²à¯à®ƒà®ªà®¿à®™à¯"}, type:"bearish", pattern:"double", description:{en:"Small bullish candle followed by large bearish candle that engulfs it. Strong selling pressure signal.",ta:"à®šà®¿à®±à®¿à®¯ à®¨à¯‡à®°à¯à®®à®±à¯ˆ à®®à¯†à®´à¯à®•à¯à®¤à®¿à®°à®¿à®¯à¯ˆ à®¤à¯Šà®Ÿà®°à¯à®¨à¯à®¤à¯ à®…à®¤à¯ˆ à®µà®¿à®´à¯à®™à¯à®•à¯à®®à¯ à®ªà¯†à®°à®¿à®¯ à®Žà®¤à®¿à®°à¯à®®à®±à¯ˆ à®®à¯†à®´à¯à®•à¯à®¤à®¿à®°à®¿."}, signal:{en:"Strong bearish reversal",ta:"à®µà®²à¯à®µà®¾à®© à®Žà®¤à®¿à®°à¯à®®à®±à¯ˆ à®¤à®¿à®°à¯à®®à¯à®ªà¯à®¤à®²à¯"}, psychology:{en:"Bears completely overpowered bulls.",ta:"à®•à®°à®Ÿà®¿à®•à®³à¯ à®•à®¾à®³à¯ˆà®•à®³à¯ˆ à®®à¯à®±à¯à®±à®¿à®²à¯à®®à¯ à®®à®¿à®•à¯ˆà®¤à¯à®¤à®©à®°à¯."}, emoji:"ðŸ”´", color:"#E74C3C", bodySize:"large", shadowSize:"minimal", bullishBearish:"bearish" },
    { id:6, name:{en:"Morning Star",ta:"à®®à®¾à®°à¯à®©à®¿à®™à¯ à®¸à¯à®Ÿà®¾à®°à¯"}, type:"bullish", pattern:"triple", description:{en:"Three candles: large bearish, small doji, large bullish. Signals end of downtrend.",ta:"à®®à¯‚à®©à¯à®±à¯ à®®à¯†à®´à¯à®•à¯à®¤à®¿à®°à®¿à®•à®³à¯: à®ªà¯†à®°à®¿à®¯ à®Žà®¤à®¿à®°à¯à®®à®±à¯ˆ, à®šà®¿à®±à®¿à®¯ à®Ÿà¯‹à®œà®¿, à®ªà¯†à®°à®¿à®¯ à®¨à¯‡à®°à¯à®®à®±à¯ˆ. à®•à¯€à®´à¯à®¨à¯‹à®•à¯à®•à®¿à®¯ à®ªà¯‹à®•à¯à®•à®¿à®©à¯ à®®à¯à®Ÿà®¿à®µà¯ˆ à®šà®®à®¿à®•à¯à®žà¯ˆ à®šà¯†à®¯à¯à®•à®¿à®±à®¤à¯."}, signal:{en:"End of downtrend / Bullish reversal",ta:"à®•à¯€à®´à¯à®¨à¯‹à®•à¯à®•à®¿à®¯ à®ªà¯‹à®•à¯à®•à®¿à®©à¯ à®®à¯à®Ÿà®¿à®µà¯ / à®¨à¯‡à®°à¯à®®à®±à¯ˆ à®¤à®¿à®°à¯à®®à¯à®ªà¯à®¤à®²à¯"}, psychology:{en:"Selling exhausted â†’ indecision â†’ buyers take control.",ta:"à®µà®¿à®±à¯à®ªà®©à¯ˆ à®¤à¯€à®°à¯à®¨à¯à®¤à®¤à¯ â†’ à®®à¯à®Ÿà®¿à®µà®¿à®©à¯à®®à¯ˆ â†’ à®µà®¾à®™à¯à®•à¯à®µà¯‹à®°à¯ à®•à®Ÿà¯à®Ÿà¯à®ªà¯à®ªà®¾à®Ÿà¯."}, emoji:"ðŸŒ…", color:"#27AE60", bodySize:"mixed", shadowSize:"mixed", bullishBearish:"bullish" },
    { id:7, name:{en:"Evening Star",ta:"à®ˆà®µà®¿à®©à®¿à®™à¯ à®¸à¯à®Ÿà®¾à®°à¯"}, type:"bearish", pattern:"triple", description:{en:"Three candles: large bullish, small doji, large bearish. Signals end of uptrend.",ta:"à®®à¯‚à®©à¯à®±à¯ à®®à¯†à®´à¯à®•à¯à®¤à®¿à®°à®¿à®•à®³à¯: à®ªà¯†à®°à®¿à®¯ à®¨à¯‡à®°à¯à®®à®±à¯ˆ, à®šà®¿à®±à®¿à®¯ à®Ÿà¯‹à®œà®¿, à®ªà¯†à®°à®¿à®¯ à®Žà®¤à®¿à®°à¯à®®à®±à¯ˆ. à®®à¯‡à®²à¯à®¨à¯‹à®•à¯à®•à®¿à®¯ à®ªà¯‹à®•à¯à®•à®¿à®©à¯ à®®à¯à®Ÿà®¿à®µà¯ˆ à®šà®®à®¿à®•à¯à®žà¯ˆ à®šà¯†à®¯à¯à®•à®¿à®±à®¤à¯."}, signal:{en:"End of uptrend / Bearish reversal",ta:"à®®à¯‡à®²à¯à®¨à¯‹à®•à¯à®•à®¿à®¯ à®ªà¯‹à®•à¯à®•à®¿à®©à¯ à®®à¯à®Ÿà®¿à®µà¯ / à®Žà®¤à®¿à®°à¯à®®à®±à¯ˆ à®¤à®¿à®°à¯à®®à¯à®ªà¯à®¤à®²à¯"}, psychology:{en:"Buying exhausted â†’ indecision â†’ sellers take control.",ta:"à®µà®¾à®™à¯à®•à¯à®¤à®²à¯ à®¤à¯€à®°à¯à®¨à¯à®¤à®¤à¯ â†’ à®®à¯à®Ÿà®¿à®µà®¿à®©à¯à®®à¯ˆ â†’ à®µà®¿à®±à¯à®ªà®µà®°à¯à®•à®³à¯ à®•à®Ÿà¯à®Ÿà¯à®ªà¯à®ªà®¾à®Ÿà¯."}, emoji:"ðŸŒ†", color:"#E74C3C", bodySize:"mixed", shadowSize:"mixed", bullishBearish:"bearish" },
    { id:8, name:{en:"Marubozu",ta:"à®®à®¾à®°à¯à®ªà¯‹à®šà¯"}, type:"strong", pattern:"single", description:{en:"No shadows â€” just a solid body. Full dominance by buyers (green) or sellers (red).",ta:"à®¨à®¿à®´à®²à¯à®•à®³à¯ à®‡à®²à¯à®²à¯ˆ â€” à®¤à®¿à®Ÿà®®à®¾à®© à®‰à®Ÿà®²à¯ à®®à®Ÿà¯à®Ÿà¯à®®à¯‡. à®µà®¾à®™à¯à®•à¯à®µà¯‹à®°à¯ (à®ªà®šà¯à®šà¯ˆ) à®…à®²à¯à®²à®¤à¯ à®µà®¿à®±à¯à®ªà®µà®°à¯à®•à®³à¯ (à®šà®¿à®µà®ªà¯à®ªà¯) à®®à¯à®´à¯à®®à¯ˆà®¯à®¾à®© à®†à®¤à®¿à®•à¯à®•à®®à¯."}, signal:{en:"Strong trend continuation",ta:"à®µà®²à¯à®µà®¾à®© à®ªà¯‹à®•à¯à®•à¯ à®¤à¯Šà®Ÿà®°à¯à®šà¯à®šà®¿"}, psychology:{en:"Complete dominance throughout the session.",ta:"à®®à¯à®´à¯ à®…à®®à®°à¯à®µà¯ à®®à¯à®´à¯à®µà®¤à¯à®®à¯ à®®à¯à®´à¯à®®à¯ˆà®¯à®¾à®© à®†à®¤à®¿à®•à¯à®•à®®à¯."}, emoji:"ðŸŸ¥", color:"#6C63FF", bodySize:"full", shadowSize:"none", bullishBearish:"both" },
    { id:9, name:{en:"Spinning Top",ta:"à®¸à¯à®ªà®¿à®©à¯à®©à®¿à®™à¯ à®Ÿà®¾à®ªà¯"}, type:"neutral", pattern:"single", description:{en:"Small body with long shadows on both sides. Indecision â€” both buyers and sellers active.",ta:"à®‡à®°à¯ à®ªà®•à¯à®•à®™à¯à®•à®³à®¿à®²à¯à®®à¯ à®¨à¯€à®£à¯à®Ÿ à®¨à®¿à®´à®²à¯à®•à®³à¯à®Ÿà®©à¯ à®šà®¿à®±à®¿à®¯ à®‰à®Ÿà®²à¯. à®®à¯à®Ÿà®¿à®µà®¿à®©à¯à®®à¯ˆ â€” à®µà®¾à®™à¯à®•à¯à®µà¯‹à®°à¯ à®®à®±à¯à®±à¯à®®à¯ à®µà®¿à®±à¯à®ªà®µà®°à¯à®•à®³à¯ à®‡à®°à¯à®µà®°à¯à®®à¯ à®šà¯†à®¯à®²à®¿à®²à¯."}, signal:{en:"Indecision â€” possible reversal",ta:"à®®à¯à®Ÿà®¿à®µà®¿à®©à¯à®®à¯ˆ â€” à®šà®¾à®¤à¯à®¤à®¿à®¯à®®à®¾à®© à®¤à®¿à®°à¯à®®à¯à®ªà¯à®¤à®²à¯"}, psychology:{en:"Neither bulls nor bears won â€” look for next candle.",ta:"à®•à®¾à®³à¯ˆà®•à®³à¯‹ à®•à®°à®Ÿà®¿à®•à®³à¯‹ à®µà¯†à®²à¯à®²à®µà®¿à®²à¯à®²à¯ˆ â€” à®…à®Ÿà¯à®¤à¯à®¤ à®®à¯†à®´à¯à®•à¯à®¤à®¿à®°à®¿à®¯à¯ˆ à®ªà®¾à®°à¯à®™à¯à®•à®³à¯."}, emoji:"ðŸŒ€", color:"#7F8C8D", bodySize:"small", shadowSize:"equal-long", bullishBearish:"neutral" },
    { id:10, name:{en:"Inverted Hammer",ta:"à®¤à®²à¯ˆà®•à¯€à®´à¯ à®šà¯à®¤à¯à®¤à®¿"}, type:"bullish", pattern:"single", description:{en:"Like Shooting Star but appears after downtrend. Small body at bottom, long upper shadow. Possible bullish reversal.",ta:"à®·à¯‚à®Ÿà¯à®Ÿà®¿à®™à¯ à®¸à¯à®Ÿà®¾à®°à¯ à®ªà¯‹à®²à¯ à®¤à¯†à®°à®¿à®•à®¿à®±à®¤à¯ à®†à®©à®¾à®²à¯ à®•à¯€à®´à¯à®¨à¯‹à®•à¯à®•à®¿à®¯ à®ªà¯‹à®•à¯à®•à®¿à®±à¯à®•à¯ à®ªà®¿à®±à®•à¯ à®¤à¯‹à®©à¯à®±à¯à®•à®¿à®±à®¤à¯."}, signal:{en:"Potential bullish reversal after downtrend",ta:"à®•à¯€à®´à¯à®¨à¯‹à®•à¯à®•à®¿à®¯ à®ªà¯‹à®•à¯à®•à®¿à®±à¯à®•à¯ à®ªà®¿à®±à®•à¯ à®šà®¾à®¤à¯à®¤à®¿à®¯à®®à®¾à®© à®¨à¯‡à®°à¯à®®à®±à¯ˆ à®¤à®¿à®°à¯à®®à¯à®ªà¯à®¤à®²à¯"}, psychology:{en:"Buyers attempted reversal after downtrend.",ta:"à®•à¯€à®´à¯à®¨à¯‹à®•à¯à®•à®¿à®¯ à®ªà¯‹à®•à¯à®•à®¿à®±à¯à®•à¯ à®ªà®¿à®±à®•à¯ à®µà®¾à®™à¯à®•à¯à®µà¯‹à®°à¯ à®¤à®¿à®°à¯à®®à¯à®ªà¯à®¤à®²à¯ à®®à¯à®¯à®©à¯à®±à®©à®°à¯."}, emoji:"ðŸ”½", color:"#27AE60", bodySize:"small", shadowSize:"long-upper", bullishBearish:"bullish" },
    { id:11, name:{en:"Three White Soldiers",ta:"à®®à¯‚à®©à¯à®±à¯ à®µà¯†à®³à¯à®³à¯ˆ à®µà¯€à®°à®°à¯à®•à®³à¯"}, type:"bullish", pattern:"triple", description:{en:"Three consecutive long green candles. Strong bullish reversal.",ta:"à®®à¯‚à®©à¯à®±à¯ à®¤à¯Šà®Ÿà®°à¯à®šà¯à®šà®¿à®¯à®¾à®© à®¨à¯€à®£à¯à®Ÿ à®ªà®šà¯à®šà¯ˆ à®®à¯†à®´à¯à®•à¯à®¤à®¿à®°à®¿à®•à®³à¯. à®µà®²à¯à®µà®¾à®© à®¨à¯‡à®°à¯à®®à®±à¯ˆ à®¤à®¿à®°à¯à®®à¯à®ªà¯à®¤à®²à¯."}, signal:{en:"Strong bullish reversal",ta:"à®µà®²à¯à®µà®¾à®© à®¨à¯‡à®°à¯à®®à®±à¯ˆ à®¤à®¿à®°à¯à®®à¯à®ªà¯à®¤à®²à¯"}, psychology:{en:"Steady advance of buying pressure. Bears overwhelmed.",ta:"à®µà®¾à®™à¯à®•à¯à®¤à®²à¯ à®…à®´à¯à®¤à¯à®¤à®¤à¯à®¤à®¿à®©à¯ à®¨à®¿à®²à¯ˆà®¯à®¾à®© à®®à¯à®©à¯à®©à¯‡à®±à¯à®±à®®à¯. à®•à®°à®Ÿà®¿à®•à®³à¯ à®®à®¿à®•à¯ˆà®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®•à®¿à®±à®¾à®°à¯à®•à®³à¯."}, emoji:"âš”ï¸", color:"#27AE60", bodySize:"large", shadowSize:"minimal", bullishBearish:"bullish" },
    { id:12, name:{en:"Three Black Crows",ta:"à®®à¯‚à®©à¯à®±à¯ à®•à®°à¯à®ªà¯à®ªà¯ à®•à®¾à®•à®™à¯à®•à®³à¯"}, type:"bearish", pattern:"triple", description:{en:"Three consecutive long red candles. Strong bearish reversal.",ta:"à®®à¯‚à®©à¯à®±à¯ à®¤à¯Šà®Ÿà®°à¯à®šà¯à®šà®¿à®¯à®¾à®© à®¨à¯€à®£à¯à®Ÿ à®šà®¿à®µà®ªà¯à®ªà¯ à®®à¯†à®´à¯à®•à¯à®¤à®¿à®°à®¿à®•à®³à¯. à®µà®²à¯à®µà®¾à®© à®Žà®¤à®¿à®°à¯à®®à®±à¯ˆ à®¤à®¿à®°à¯à®®à¯à®ªà¯à®¤à®²à¯."}, signal:{en:"Strong bearish reversal",ta:"à®µà®²à¯à®µà®¾à®© à®Žà®¤à®¿à®°à¯à®®à®±à¯ˆ à®¤à®¿à®°à¯à®®à¯à®ªà¯à®¤à®²à¯"}, psychology:{en:"Steady advance of selling pressure. Bulls overwhelmed.",ta:"à®µà®¿à®±à¯à®ªà®©à¯ˆ à®…à®´à¯à®¤à¯à®¤à®¤à¯à®¤à®¿à®©à¯ à®¨à®¿à®²à¯ˆà®¯à®¾à®© à®®à¯à®©à¯à®©à¯‡à®±à¯à®±à®®à¯. à®•à®¾à®³à¯ˆà®•à®³à¯ à®®à®¿à®•à¯ˆà®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®•à®¿à®±à®¾à®°à¯à®•à®³à¯."}, emoji:"ðŸ¦…", color:"#E74C3C", bodySize:"large", shadowSize:"minimal", bullishBearish:"bearish" }
  ];
}

function getLocalQuiz() {
  return [
    { id:1, question:{en:"What does a green (bullish) candlestick indicate?",ta:"à®ªà®šà¯à®šà¯ˆ (à®¨à¯‡à®°à¯à®®à®±à¯ˆ) à®®à¯†à®´à¯à®•à¯à®¤à®¿à®°à®¿ à®Žà®©à¯à®© à®•à¯à®±à®¿à®•à¯à®•à®¿à®±à®¤à¯?"}, options:{en:["Price closed lower than open","Price closed higher than open","Price did not change","Volume was very high"],ta:["à®¤à®¿à®±à®ªà¯à®ªà¯ˆ à®µà®¿à®Ÿ à®µà®¿à®²à¯ˆ à®•à¯à®±à¯ˆà®µà®¾à®• à®®à¯‚à®Ÿà®¿à®¯à®¤à¯","à®¤à®¿à®±à®ªà¯à®ªà¯ˆ à®µà®¿à®Ÿ à®µà®¿à®²à¯ˆ à®…à®¤à®¿à®•à®®à®¾à®• à®®à¯‚à®Ÿà®¿à®¯à®¤à¯","à®µà®¿à®²à¯ˆ à®®à®¾à®±à®µà®¿à®²à¯à®²à¯ˆ","à®µà®¾à®²à¯à®¯à¯‚à®®à¯ à®®à®¿à®• à®…à®¤à®¿à®•à®®à®¾à®• à®‡à®°à¯à®¨à¯à®¤à®¤à¯"]}, correct:1, explanation:{en:"A green candle forms when closing price is higher than opening price â€” buying pressure.",ta:"à®®à¯‚à®Ÿà®²à¯ à®¤à®¿à®±à®ªà¯à®ªà¯ˆ à®µà®¿à®Ÿ à®…à®¤à®¿à®•à®®à®¾à®• à®‡à®°à¯à®•à¯à®•à¯à®®à¯à®ªà¯‹à®¤à¯ à®ªà®šà¯à®šà¯ˆ à®®à¯†à®´à¯à®•à¯à®¤à®¿à®°à®¿ à®‰à®°à¯à®µà®¾à®•à®¿à®±à®¤à¯ â€” à®µà®¾à®™à¯à®•à¯à®¤à®²à¯ à®…à®´à¯à®¤à¯à®¤à®®à¯."}, category:"candlesticks", difficulty:"easy" },
    { id:2, question:{en:"What does RSI above 70 indicate?",ta:"RSI 70 à®•à¯à®•à¯ à®®à¯‡à®²à¯ à®Žà®©à¯à®© à®•à¯à®±à®¿à®•à¯à®•à®¿à®±à®¤à¯?"}, options:{en:["Oversold condition","Overbought condition","Strong uptrend","Neutral market"],ta:["à®…à®¤à®¿à®• à®µà®¿à®±à¯à®ªà®©à¯ˆ à®¨à®¿à®²à¯ˆ","à®…à®¤à®¿à®• à®µà®¾à®™à¯à®•à®²à¯ à®¨à®¿à®²à¯ˆ","à®µà®²à¯à®µà®¾à®© à®®à¯‡à®²à¯à®¨à¯‹à®•à¯à®•à®¿à®¯ à®ªà¯‹à®•à¯à®•à¯","à®¨à®Ÿà¯à®¨à®¿à®²à¯ˆ à®šà®¨à¯à®¤à¯ˆ"]}, correct:1, explanation:{en:"RSI above 70 = overbought. Price may reverse downward.",ta:"RSI 70à®•à¯à®•à¯ à®®à¯‡à®²à¯ = à®…à®¤à®¿à®• à®µà®¾à®™à¯à®•à®²à¯. à®µà®¿à®²à¯ˆ à®•à¯€à®´à¯‡ à®¤à®¿à®°à¯à®®à¯à®ªà®²à®¾à®®à¯."}, category:"indicators", difficulty:"easy" },
    { id:3, question:{en:"A Hammer after a downtrend signals?",ta:"à®•à¯€à®´à¯à®¨à¯‹à®•à¯à®•à®¿à®¯ à®ªà¯‹à®•à¯à®•à®¿à®±à¯à®•à¯ à®ªà®¿à®±à®•à¯ à®šà¯à®¤à¯à®¤à®¿ à®Žà®©à¯à®© à®šà®®à®¿à®•à¯à®žà¯ˆ à®šà¯†à®¯à¯à®•à®¿à®±à®¤à¯?"}, options:{en:["Continuation of downtrend","Bullish reversal","Bearish reversal","Sideways market"],ta:["à®•à¯€à®´à¯à®¨à¯‹à®•à¯à®•à®¿à®¯ à®ªà¯‹à®•à¯à®•à®¿à®©à¯ à®¤à¯Šà®Ÿà®°à¯à®šà¯à®šà®¿","à®¨à¯‡à®°à¯à®®à®±à¯ˆ à®¤à®¿à®°à¯à®®à¯à®ªà¯à®¤à®²à¯","à®Žà®¤à®¿à®°à¯à®®à®±à¯ˆ à®¤à®¿à®°à¯à®®à¯à®ªà¯à®¤à®²à¯","à®ªà®•à¯à®•à®µà®¾à®Ÿà¯à®Ÿà¯ à®šà®¨à¯à®¤à¯ˆ"]}, correct:1, explanation:{en:"Hammer after downtrend = potential bullish reversal. Long lower wick shows buyers fought back.",ta:"à®•à¯€à®´à¯à®¨à¯‹à®•à¯à®•à®¿à®¯ à®ªà¯‹à®•à¯à®•à®¿à®±à¯à®•à¯ à®ªà®¿à®±à®•à¯ à®šà¯à®¤à¯à®¤à®¿ = à®¨à¯‡à®°à¯à®®à®±à¯ˆ à®¤à®¿à®°à¯à®®à¯à®ªà¯à®¤à®²à¯. à®¨à¯€à®£à¯à®Ÿ à®•à¯€à®´à¯ à®µà®¿à®•à¯ à®µà®¾à®™à¯à®•à¯à®µà¯‹à®°à¯ à®¤à®¿à®°à¯à®®à¯à®ªà®¿ à®µà®¨à¯à®¤à®¤à¯ˆ à®•à®¾à®Ÿà¯à®Ÿà¯à®•à®¿à®±à®¤à¯."}, category:"candlesticks", difficulty:"medium" },
    { id:4, question:{en:"Maximum % of capital to risk per trade?",ta:"à®’à®°à¯ à®µà®°à¯à®¤à¯à®¤à®•à®¤à¯à®¤à®¿à®²à¯ à®†à®ªà®¤à¯à®¤à®¿à®²à¯ à®µà¯ˆà®•à¯à®• à®µà¯‡à®£à¯à®Ÿà®¿à®¯ à®…à®¤à®¿à®•à®ªà®Ÿà¯à®š % à®Žà®©à¯à®©?"}, options:{en:["10-20%","5-10%","1-2%","50%"],ta:["10-20%","5-10%","1-2%","50%"]}, correct:2, explanation:{en:"Professional traders risk only 1-2% per trade to survive losing streaks.",ta:"à®¤à¯Šà®´à®¿à®²à¯à®®à¯à®±à¯ˆ à®µà®°à¯à®¤à¯à®¤à®•à®°à¯à®•à®³à¯ à®’à®°à¯ à®µà®°à¯à®¤à¯à®¤à®•à®¤à¯à®¤à®¿à®²à¯ 1-2% à®®à®Ÿà¯à®Ÿà¯à®®à¯‡ à®†à®ªà®¤à¯à®¤à®¿à®²à¯ à®µà¯ˆà®•à¯à®•à®¿à®±à®¾à®°à¯à®•à®³à¯."}, category:"risk", difficulty:"easy" },
    { id:5, question:{en:"What does the body of a candlestick represent?",ta:"à®®à¯†à®´à¯à®•à¯à®¤à®¿à®°à®¿à®¯à®¿à®©à¯ à®‰à®Ÿà®²à¯ à®Žà®©à¯à®© à®•à¯à®±à®¿à®•à¯à®•à®¿à®±à®¤à¯?"}, options:{en:["Highest and lowest prices","Difference between open and close","Trading volume","Time period"],ta:["à®…à®¤à®¿à®•à®ªà®Ÿà¯à®š à®®à®±à¯à®±à¯à®®à¯ à®•à¯à®±à¯ˆà®¨à¯à®¤à®ªà®Ÿà¯à®š à®µà®¿à®²à¯ˆà®•à®³à¯","à®¤à®¿à®±à®ªà¯à®ªà¯ à®®à®±à¯à®±à¯à®®à¯ à®®à¯‚à®Ÿà®²à¯ à®µà¯‡à®±à¯à®ªà®¾à®Ÿà¯","à®µà®°à¯à®¤à¯à®¤à®• à®…à®³à®µà¯","à®¨à¯‡à®° à®•à®¾à®²à®®à¯"]}, correct:1, explanation:{en:"Candle body = range between open and close. Green = close > open.",ta:"à®®à¯†à®´à¯à®•à¯à®¤à®¿à®°à®¿ à®‰à®Ÿà®²à¯ = à®¤à®¿à®±à®ªà¯à®ªà¯ à®®à®±à¯à®±à¯à®®à¯ à®®à¯‚à®Ÿà®²à¯ à®µà®°à®®à¯à®ªà¯. à®ªà®šà¯à®šà¯ˆ = à®®à¯‚à®Ÿà®²à¯ > à®¤à®¿à®±à®ªà¯à®ªà¯."}, category:"candlesticks", difficulty:"easy" },
    { id:6, question:{en:"Golden Cross in moving averages means?",ta:"à®¨à®•à®°à¯à®®à¯ à®šà®°à®¾à®šà®°à®¿à®¯à®¿à®²à¯ à®•à¯‹à®²à¯à®Ÿà®©à¯ à®•à®¿à®°à®¾à®¸à¯ à®Žà®©à¯à®±à®¾à®²à¯?"}, options:{en:["50 MA crosses below 200 MA","50 MA crosses above 200 MA","20 MA crosses 50 MA","Price crosses 200 MA"],ta:["50 MA 200 MA à®•à¯à®•à¯ à®•à¯€à®´à¯‡ à®•à®Ÿà®•à¯à®•à¯à®®à¯","50 MA 200 MA à®•à¯à®•à¯ à®®à¯‡à®²à¯‡ à®•à®Ÿà®•à¯à®•à¯à®®à¯","20 MA 50 MA à® à®•à®Ÿà®•à¯à®•à¯à®®à¯","à®µà®¿à®²à¯ˆ 200 MA à® à®•à®Ÿà®•à¯à®•à¯à®®à¯"]}, correct:1, explanation:{en:"Golden Cross = 50MA crosses above 200MA. Strong bullish signal.",ta:"à®•à¯‹à®²à¯à®Ÿà®©à¯ à®•à®¿à®°à®¾à®¸à¯ = 50MA 200MA à®•à¯à®•à¯ à®®à¯‡à®²à¯‡ à®•à®Ÿà®•à¯à®•à¯à®®à¯. à®µà®²à¯à®µà®¾à®© à®¨à¯‡à®°à¯à®®à®±à¯ˆ à®šà®®à®¿à®•à¯à®žà¯ˆ."}, category:"indicators", difficulty:"medium" },
    { id:7, question:{en:"Which emotion makes traders hold losing positions too long?",ta:"à®Žà®¨à¯à®¤ à®‰à®£à®°à¯à®šà¯à®šà®¿ à®¤à¯‹à®²à¯à®µà®¿ à®¨à®¿à®²à¯ˆà®•à®³à¯ˆ à®®à®¿à®• à®¨à¯€à®£à¯à®Ÿ à®•à®¾à®²à®®à¯ à®µà¯ˆà®¤à¯à®¤à®¿à®°à¯à®•à¯à®• à®µà¯ˆà®•à¯à®•à®¿à®±à®¤à¯?"}, options:{en:["Fear","Greed","Confidence","Patience"],ta:["à®ªà®¯à®®à¯","à®ªà¯‡à®°à®¾à®šà¯ˆ","à®¨à®®à¯à®ªà®¿à®•à¯à®•à¯ˆ","à®ªà¯Šà®±à¯à®®à¯ˆ"]}, correct:1, explanation:{en:"Greed makes traders hope losing trades will recover instead of cutting losses.",ta:"à®ªà¯‡à®°à®¾à®šà¯ˆ à®µà®°à¯à®¤à¯à®¤à®•à®°à¯à®•à®³à¯ˆ à®‡à®´à®ªà¯à®ªà¯ˆ à®•à¯à®±à¯ˆà®•à¯à®•à®¾à®®à®²à¯ à®®à¯€à®Ÿà¯à®•à¯à®®à¯ à®Žà®©à¯à®±à¯ à®¨à®®à¯à®ª à®µà¯ˆà®•à¯à®•à®¿à®±à®¤à¯."}, category:"psychology", difficulty:"easy" },
    { id:8, question:{en:"What does OHLC stand for?",ta:"OHLC à®Žà®©à¯à®±à®¾à®²à¯ à®Žà®©à¯à®©?"}, options:{en:["Only High Low Close","Open High Low Close","Order High Limit Close","Open Hold Low Continue"],ta:["à®“à®©à¯à®²à®¿ à®¹à¯ˆ à®²à¯‹ à®•à¯à®³à¯‹à®¸à¯","à®“à®ªà®©à¯ à®¹à¯ˆ à®²à¯‹ à®•à¯à®³à¯‹à®¸à¯","à®†à®°à¯à®Ÿà®°à¯ à®¹à¯ˆ à®²à®¿à®®à®¿à®Ÿà¯ à®•à¯à®³à¯‹à®¸à¯","à®“à®ªà®©à¯ à®¹à¯‹à®²à¯à®Ÿà¯ à®²à¯‹ à®•à®©à¯à®Ÿà®¿à®©à®¿à®¯à¯‚"]}, correct:1, explanation:{en:"OHLC = Open, High, Low, Close â€” the four key price points of a candlestick.",ta:"OHLC = à®¤à®¿à®±à®ªà¯à®ªà¯, à®‰à®¯à®°à¯à®µà¯, à®¤à®¾à®´à¯à®µà¯, à®®à¯‚à®Ÿà¯à®¤à®²à¯ â€” à®®à¯†à®´à¯à®•à¯à®¤à®¿à®°à®¿à®¯à®¿à®©à¯ à®¨à®¾à®©à¯à®•à¯ à®®à¯à®•à¯à®•à®¿à®¯ à®µà®¿à®²à¯ˆ à®ªà¯à®³à¯à®³à®¿à®•à®³à¯."}, category:"basics", difficulty:"easy" },
    { id:9, question:{en:"Which Fibonacci retracement level is widely known as the 'Golden Ratio'?",ta:"à®Žà®¨à¯à®¤ à®ƒà®ªà®¿à®ªà¯‹à®©à®¾à®šà¯à®šà®¿ à®¨à®¿à®²à¯ˆ 'à®•à¯‹à®²à¯à®Ÿà®©à¯ à®°à¯‡à®·à®¿à®¯à¯‹' à®Žà®© à®…à®±à®¿à®¯à®ªà¯à®ªà®Ÿà¯à®•à®¿à®±à®¤à¯?"}, options:{en:["23.6%","38.2%","50.0%","61.8%"],ta:["23.6%","38.2%","50.0%","61.8%"]}, correct:3, explanation:{en:"61.8% is the Golden Ratio in Fibonacci sequence.",ta:"61.8% à®Žà®©à¯à®ªà®¤à¯ à®ƒà®ªà®¿à®ªà¯‹à®©à®¾à®šà¯à®šà®¿ à®µà®°à®¿à®šà¯ˆà®¯à®¿à®²à¯ à®•à¯‹à®²à¯à®Ÿà®©à¯ à®°à¯‡à®·à®¿à®¯à¯‹."}, category:"indicators", difficulty:"advanced" },
    { id:10, question:{en:"What does an 'Order Block' represent in Institutional Order Flow?",ta:"à®¨à®¿à®±à¯à®µà®© à®†à®°à¯à®Ÿà®°à¯ à®“à®Ÿà¯à®Ÿà®¤à¯à®¤à®¿à®²à¯ 'à®†à®°à¯à®Ÿà®°à¯ à®ªà®¿à®³à®¾à®•à¯' à®Žà®¤à¯ˆà®•à¯ à®•à¯à®±à®¿à®•à¯à®•à®¿à®±à®¤à¯?"}, options:{en:["A block on trading","An area where institutions accumulated large positions","A software glitch","A standard stop loss"],ta:["à®µà®°à¯à®¤à¯à®¤à®•à®¤à¯à®¤à®¿à®±à¯à®•à¯ à®¤à®Ÿà¯ˆ","à®¨à®¿à®±à¯à®µà®©à®™à¯à®•à®³à¯ à®ªà¯†à®°à®¿à®¯ à®¨à®¿à®²à¯ˆà®•à®³à¯ˆ à®•à¯à®µà®¿à®•à¯à®•à¯à®®à¯ à®ªà®•à¯à®¤à®¿","à®®à¯†à®©à¯à®ªà¯Šà®°à¯à®³à¯ à®•à¯‹à®³à®¾à®±à¯","à®¨à®¿à®²à¯ˆà®¯à®¾à®© à®¸à¯à®Ÿà®¾à®ªà¯ à®²à®¾à®¸à¯"]}, correct:1, explanation:{en:"Order blocks are price levels where large institutions placed massive orders.",ta:"à®†à®°à¯à®Ÿà®°à¯ à®ªà®¿à®³à®¾à®•à¯à®•à¯à®•à®³à¯ à®Žà®©à¯à®ªà®µà¯ˆ à®ªà¯†à®°à®¿à®¯ à®¨à®¿à®±à¯à®µà®©à®™à¯à®•à®³à¯ à®ªà®¾à®°à®¿à®¯ à®†à®°à¯à®Ÿà®°à¯à®•à®³à¯ˆ à®µà®´à®™à¯à®•à®¿à®¯ à®µà®¿à®²à¯ˆ à®¨à®¿à®²à¯ˆà®•à®³à¯."}, category:"basics", difficulty:"pro" }
  ];
}

function getLocalGlossary() {
  return [
    { id:1, term:{en:"Bull Market",ta:"à®•à®¾à®³à¯ˆ à®šà®¨à¯à®¤à¯ˆ"}, definition:{en:"A market where prices are rising or expected to rise.",ta:"à®µà®¿à®²à¯ˆà®•à®³à¯ à®‰à®¯à®°à¯à®®à¯ à®…à®²à¯à®²à®¤à¯ à®‰à®¯à®°à¯à®®à¯ à®Žà®©à¯à®±à¯ à®Žà®¤à®¿à®°à¯à®ªà®¾à®°à¯à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®®à¯ à®šà®¨à¯à®¤à¯ˆ."} },
    { id:2, term:{en:"Bear Market",ta:"à®•à®°à®Ÿà®¿ à®šà®¨à¯à®¤à¯ˆ"}, definition:{en:"A market where prices are falling or expected to fall.",ta:"à®µà®¿à®²à¯ˆà®•à®³à¯ à®µà®¿à®´à¯à®®à¯ à®…à®²à¯à®²à®¤à¯ à®µà®¿à®´à¯à®®à¯ à®Žà®©à¯à®±à¯ à®Žà®¤à®¿à®°à¯à®ªà®¾à®°à¯à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®®à¯ à®šà®¨à¯à®¤à¯ˆ."} },
    { id:3, term:{en:"Stop Loss",ta:"à®¸à¯à®Ÿà®¾à®ªà¯ à®²à®¾à®¸à¯"}, definition:{en:"An order to sell when price reaches a specific level, limiting your loss.",ta:"à®µà®¿à®²à¯ˆ à®•à¯à®±à®¿à®ªà¯à®ªà®¿à®Ÿà¯à®Ÿ à®¨à®¿à®²à¯ˆà®¯à¯ˆ à®…à®Ÿà¯ˆà®¯à¯à®®à¯à®ªà¯‹à®¤à¯ à®µà®¿à®±à¯à®• à®†à®°à¯à®Ÿà®°à¯, à®‡à®´à®ªà¯à®ªà¯ˆ à®•à¯à®±à¯ˆà®•à¯à®•à®¿à®±à®¤à¯."} },
    { id:4, term:{en:"Volume",ta:"à®µà®¾à®²à¯à®¯à¯‚à®®à¯"}, definition:{en:"Number of shares traded in a period. High volume confirms price moves.",ta:"à®’à®°à¯ à®•à®¾à®²à®¤à¯à®¤à®¿à®²à¯ à®µà®°à¯à®¤à¯à®¤à®•à®®à¯ à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿ à®ªà®™à¯à®•à¯à®•à®³à®¿à®©à¯ à®Žà®£à¯à®£à®¿à®•à¯à®•à¯ˆ."} },
    { id:5, term:{en:"Trend",ta:"à®ªà¯‹à®•à¯à®•à¯"}, definition:{en:"General direction of price â€” uptrend, downtrend, or sideways.",ta:"à®µà®¿à®²à¯ˆà®¯à®¿à®©à¯ à®ªà¯Šà®¤à¯à®µà®¾à®© à®¤à®¿à®šà¯ˆ â€” à®®à¯‡à®²à¯, à®•à¯€à®´à¯, à®…à®²à¯à®²à®¤à¯ à®ªà®•à¯à®•à®µà®¾à®Ÿà¯à®Ÿà¯."} },
    { id:6, term:{en:"Breakout",ta:"à®ªà®¿à®°à¯‡à®•à¯à®…à®µà¯à®Ÿà¯"}, definition:{en:"Price moves above resistance or below support with high volume, signaling new trend.",ta:"à®µà®¿à®²à¯ˆ à®…à®¤à®¿à®• à®µà®¾à®²à¯à®¯à¯‚à®®à¯à®Ÿà®©à¯ à®Žà®¤à®¿à®°à¯à®ªà¯à®ªà¯ˆ à®®à¯€à®±à¯à®•à®¿à®±à®¤à¯ à®…à®²à¯à®²à®¤à¯ à®†à®¤à®°à®µà¯à®•à¯à®•à¯ à®•à¯€à®´à¯‡ à®ªà¯‹à®•à®¿à®±à®¤à¯."} },
    { id:7, term:{en:"Consolidation",ta:"à®’à®°à¯à®™à¯à®•à®¿à®£à¯ˆà®ªà¯à®ªà¯"}, definition:{en:"Period when price moves sideways in a range before breaking out.",ta:"à®µà¯†à®Ÿà®¿à®ªà¯à®ªà®¤à®±à¯à®•à¯ à®®à¯à®©à¯ à®µà®¿à®²à¯ˆ à®’à®°à¯ à®µà®°à®®à¯à®ªà®¿à®²à¯ à®ªà®•à¯à®•à®µà®¾à®Ÿà¯à®Ÿà®¾à®• à®¨à®•à®°à¯à®®à¯ à®•à®¾à®²à®®à¯."} },
    { id:8, term:{en:"Fibonacci Retracement",ta:"à®ƒà®ªà®¿à®ªà¯‹à®©à®¾à®šà¯à®šà®¿ à®°à®¿à®Ÿà¯à®°à¯‡à®¸à¯à®®à¯†à®©à¯à®Ÿà¯"}, definition:{en:"Technical tool using ratios (23.6%, 38.2%, 61.8%) to find support/resistance.",ta:"à®†à®¤à®°à®µà¯/à®Žà®¤à®¿à®°à¯à®ªà¯à®ªà¯ à®¨à®¿à®²à¯ˆà®•à®³à¯ˆ à®•à®£à¯à®Ÿà®±à®¿à®¯ à®µà®¿à®•à®¿à®¤à®™à¯à®•à®³à¯ˆ à®ªà®¯à®©à¯à®ªà®Ÿà¯à®¤à¯à®¤à¯à®®à¯ à®¤à¯Šà®´à®¿à®²à¯à®¨à¯à®Ÿà¯à®ª à®•à®°à¯à®µà®¿."} },
    { id:9, term:{en:"Liquidity",ta:"à®ªà®£à®ªà¯à®ªà¯à®´à®•à¯à®•à®®à¯"}, definition:{en:"How easily a stock can be bought/sold without affecting its price.",ta:"à®µà®¿à®²à¯ˆà®¯à¯ˆ à®ªà®¾à®¤à®¿à®•à¯à®•à®¾à®®à®²à¯ à®Žà®µà¯à®µà®³à®µà¯ à®Žà®³à®¿à®¤à®¾à®• à®µà®¾à®™à¯à®•à®²à®¾à®®à¯/à®µà®¿à®±à¯à®•à®²à®¾à®®à¯."} },
    { id:10, term:{en:"Scalping",ta:"à®¸à¯à®•à®¾à®²à¯à®ªà®¿à®™à¯"}, definition:{en:"Very short-term trading â€” many trades within minutes for small profits.",ta:"à®®à®¿à®•à®µà¯à®®à¯ à®•à¯à®±à¯à®•à®¿à®¯ à®•à®¾à®² à®µà®°à¯à®¤à¯à®¤à®•à®®à¯ â€” à®šà®¿à®±à®¿à®¯ à®²à®¾à®ªà®™à¯à®•à®³à¯à®•à¯à®•à®¾à®• à®¨à®¿à®®à®¿à®Ÿà®™à¯à®•à®³à¯à®•à¯à®•à¯à®³à¯ à®ªà®² à®µà®°à¯à®¤à¯à®¤à®•à®™à¯à®•à®³à¯."} }
  ];
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  applyLang();
  buildHeroAnimation();
  // Pre-load quiz data
  loadQuizQuestions();

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (window.scrollY > 20) nav.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)';
    else nav.style.boxShadow = 'none';
  });

  // Close mobile nav on outside click
  document.addEventListener('click', (e) => {
    const nav = document.getElementById('navLinks');
    const burger = document.getElementById('navHamburger');
    if (nav.classList.contains('open') && !nav.contains(e.target) && !burger.contains(e.target)) {
      nav.classList.remove('open');
    }
  });

  // Keyboard: close modals with Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal('topicModal');
      closeModal('candleModal');
    }
  });
});
