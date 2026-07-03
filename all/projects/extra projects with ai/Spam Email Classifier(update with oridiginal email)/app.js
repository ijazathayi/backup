// ═══════════════════════════════════════════
//  SpamShield – Classification Engine + UI
// ═══════════════════════════════════════════

/* ── State ── */
let history = JSON.parse(localStorage.getItem('spamshield_history') || '[]');
let totalScanned = parseInt(localStorage.getItem('spamshield_total') || '0');
let totalSpam    = parseInt(localStorage.getItem('spamshield_spam')  || '0');
let lastResult   = null;

// ── Spam Signal Dictionaries ──────────────────────────────────────────────────

const SPAM_KEYWORDS = [
  'free', 'winner', 'won', 'prize', 'lottery', 'cash', 'money',
  'million', 'billion', 'urgent', 'act now', 'limited time', 'expire',
  'click here', 'click below', 'unsubscribe', 'congratulations', 'guaranteed',
  'no risk', 'risk-free', '100% free', 'earn money', 'make money',
  'work from home', 'income', 'investment', 'profit', 'earn extra',
  'credit card', 'bank account', 'wire transfer', 'western union', 'bitcoin',
  'crypto', 'password', 'verify', 'confirm your', 'validate',
  'pharmacy', 'viagra', 'cialis', 'pills', 'medication', 'prescription',
  'weight loss', 'lose weight', 'diet pill', 'fat burner',
  'dear friend', 'dear sir', 'dear beneficiary', 'prince', 'inheritance',
  'attorney', 'confidential', 'secret', 'billion dollar',
  'click link', 'click the link', 'login here', 'signin', 'sign in here',
  'account suspended', 'verify account', 'security alert',
  'claim your', 'claim now', 'redeem', 'coupon', 'discount', 'deal',
  'cheap', 'lowest price', 'order now', 'buy now', 'shop now',
  '!!!', '???', '$$$', 'CONGRAT', 'WINNER', 'FREE!!!',
];

const PHISHING_KEYWORDS = [
  'verify your account', 'confirm your identity', 'update your payment',
  'unusual activity', 'your account has been', 'suspended', 'locked',
  'login attempt', 'we detected', 'click to verify', 'reset your password',
  'dear customer', 'dear user', 'dear valued customer',
  'paypal', 'amazon', 'apple', 'microsoft', 'google', 'irs', 'ssa', 'bank',
];

const SUSPICIOUS_TLDS = [
  '.xyz', '.top', '.click', '.info', '.gq', '.ml', '.cf', '.tk',
  '.work', '.club', '.win', '.bid', '.loan', '.stream', '.download',
  '.racing', '.webcam', '.men', '.date', '.review', '.trade',
];

const SAFE_DOMAINS = [
  'gmail.com','yahoo.com','outlook.com','hotmail.com','icloud.com',
  'microsoft.com','apple.com','amazon.com','google.com','github.com',
  'linkedin.com','twitter.com','facebook.com','instagram.com',
];

/* ── Sample Emails ── */
const SAMPLES = {
  spam1: {
    sender: 'lottery-winner@global-prize.xyz',
    subject: '🎉 CONGRATULATIONS! You WON $5,000,000 — CLAIM NOW!!!',
    body: `Dear Lucky Winner,

CONGRATULATIONS!!! You have been selected as the GRAND PRIZE WINNER of our International Email Lottery Draw!

You have WON the sum of FIVE MILLION DOLLARS ($5,000,000.00 USD). 

To claim your FREE prize money, you must ACT NOW! This offer expires in 24 HOURS.

Click the link below to verify your identity and claim your winnings:
http://claim-prize.xyz/winner/verify?ref=A8K29

You are required to provide:
- Your full name
- Bank account details
- Credit card number for processing fee ($49.99)

This is GUARANTEED! 100% FREE! No risk whatsoever!

Sincerely,
Dr. James Wilson
International Lottery Commission
Tel: +44-7491-XXXXX`
  },
  spam2: {
    sender: 'meds@cheap-pharmacy-online.top',
    subject: 'Buy Cheap Medications — 90% OFF — No Prescription Needed!!!',
    body: `Special offer just for YOU!

Get the cheapest medications online! No prescription needed!

✔ Viagra — $0.30/pill
✔ Cialis — $0.25/pill  
✔ Weight loss pills — BUY NOW
✔ All medications 90% OFF

ORDER NOW and get FREE shipping worldwide!

Click here to order: http://cheapmeds24.top/order-now

Limited time offer! Act now before prices go up!

Unsubscribe | This email was sent to you because you signed up`
  },
  spam3: {
    sender: 'security-team@paypa1-secure.click',
    subject: 'Action Required: Your PayPal Account Has Been Suspended',
    body: `Dear Valued Customer,

We have detected unusual activity on your PayPal account. To protect your security, we have temporarily suspended your account.

To restore access, you must verify your identity immediately:

Click Here to Verify Your Account: http://paypa1-verify.click/restore-account

You will need to provide:
- Your PayPal email & password
- Credit card information
- Social Security Number (for identity verification)

If you do not verify within 24 hours, your account will be permanently closed.

PayPal Security Team
security@paypal.com (do not reply to this address)`
  },
  legit1: {
    sender: 'sarah.johnson@techcorp.com',
    subject: 'Q3 Project Update – Meeting Tomorrow at 10 AM',
    body: `Hi Team,

Just a quick update on the Q3 development project.

We've completed the backend API integration and are now in the testing phase. The QA team has been running tests since Monday and we expect to finish by end of week.

**Key Updates:**
- API integration: Complete ✓
- Unit tests: 87% coverage
- UI review: Scheduled for Thursday

Please join us tomorrow (Wednesday) at 10 AM in Conference Room B for the sprint review. Remote team members can join via the usual Teams link.

Let me know if you have any questions before then.

Best regards,
Sarah Johnson
Senior Project Manager | TechCorp Inc.
sarah.johnson@techcorp.com | +1 (555) 234-5678`
  },
  legit2: {
    sender: 'newsletter@medium.com',
    subject: 'Your Weekly Reading List – Top Stories This Week',
    body: `Hi there,

Here are the top stories curated for you this week based on your reading history.

─────────────────────────
📖 Top Stories
─────────────────────────

1. "The Future of AI in Software Development" by James K.
   8 min read · 2.4k claps

2. "Why TypeScript is Worth the Learning Curve" by Ana Gomez
   6 min read · 1.8k claps

3. "Building Scalable Microservices with Node.js" by David Lee
   12 min read · 3.1k claps

─────────────────────────

Follow your favorite topics to get more personalized recommendations.

Happy reading!
The Medium Team

You're receiving this because you subscribed to Medium's newsletter.
Manage preferences | Unsubscribe`
  }
};

/* ── Classification Engine ─────────────────────────────────────────────────── */

function classifyEmailText(sender, subject, body) {
  const fullText = `${sender} ${subject} ${body}`.toLowerCase();
  const subjectLower = subject.toLowerCase();
  const bodyLower = body.toLowerCase();

  const signals = [];
  let totalScore = 0;

  // ── 1. Keyword Detection ──────────────────────────────────────────────────
  const foundKeywords = SPAM_KEYWORDS.filter(k => fullText.includes(k.toLowerCase()));
  const kwScore = Math.min(foundKeywords.length / 8, 1);
  signals.push({ name: 'Spam Keywords', icon: '🔑', score: kwScore, weight: 0.28 });
  totalScore += kwScore * 0.28;

  // ── 2. Phishing Keywords ──────────────────────────────────────────────────
  const phishFound = PHISHING_KEYWORDS.filter(k => fullText.includes(k.toLowerCase()));
  const phishScore = Math.min(phishFound.length / 3, 1);
  signals.push({ name: 'Phishing Patterns', icon: '🎣', score: phishScore, weight: 0.22 });
  totalScore += phishScore * 0.22;

  // ── 3. Sender Domain Analysis ─────────────────────────────────────────────
  let senderScore = 0;
  if (sender) {
    const domain = sender.split('@')[1] || '';
    const domainLower = domain.toLowerCase();
    if (SUSPICIOUS_TLDS.some(tld => domainLower.endsWith(tld))) senderScore += 0.7;
    if (/\d{3,}/.test(domain)) senderScore += 0.2;
    if ((domain.match(/-/g) || []).length > 2) senderScore += 0.15;
    if (PHISHING_KEYWORDS.some(k => domainLower.includes(k.split(' ')[0]))) senderScore += 0.4;
    if (SAFE_DOMAINS.some(d => domainLower === d)) senderScore = Math.max(senderScore - 0.8, 0);
    senderScore = Math.min(senderScore, 1);
  }
  signals.push({ name: 'Sender Reputation', icon: '📧', score: senderScore, weight: 0.20 });
  totalScore += senderScore * 0.20;

  // ── 4. Urgency & Pressure Language ───────────────────────────────────────
  const urgencyPhrases = ['act now','limited time','expire','hurry','immediate','urgent','24 hours','don\'t wait','today only','last chance','respond immediately','asap'];
  const urgencyFound = urgencyPhrases.filter(p => fullText.includes(p));
  const urgencyScore = Math.min(urgencyFound.length / 4, 1);
  signals.push({ name: 'Urgency / Pressure', icon: '⚡', score: urgencyScore, weight: 0.15 });
  totalScore += urgencyScore * 0.15;

  // ── 5. Text Structure Analysis ────────────────────────────────────────────
  let structScore = 0;
  const capsRatio = (subject.match(/[A-Z]/g) || []).length / Math.max(subject.length, 1);
  if (capsRatio > 0.4) structScore += 0.35;
  const exclamCount = (fullText.match(/!/g) || []).length;
  if (exclamCount > 3) structScore += Math.min((exclamCount - 3) * 0.1, 0.3);
  const urlCount = (body.match(/https?:\/\/[^\s]+/g) || []).length;
  if (urlCount > 2) structScore += Math.min((urlCount - 2) * 0.1, 0.25);
  if (/\$[\d,]+/.test(body)) structScore += 0.2;
  structScore = Math.min(structScore, 1);
  signals.push({ name: 'Text Structure', icon: '📝', score: structScore, weight: 0.15 });
  totalScore += structScore * 0.15;

  // ── Final Score ───────────────────────────────────────────────────────────
  const spamProbability = Math.min(Math.max(totalScore, 0), 1);
  const confidence = Math.round(spamProbability * 100);

  let verdict, label, subLabel;
  if (spamProbability >= 0.65) {
    verdict = 'spam';
    label = '🚨 SPAM DETECTED';
    subLabel = confidence >= 85 ? 'This email shows very strong spam signals' : 'This email shows multiple spam indicators';
  } else if (spamProbability >= 0.35) {
    verdict = 'warn';
    label = '⚠️ SUSPICIOUS';
    subLabel = 'Some spam-like signals detected — review carefully';
  } else {
    verdict = 'safe';
    label = '✅ LOOKS SAFE';
    subLabel = 'No significant spam signals detected';
  }

  return {
    verdict, label, subLabel, confidence, spamProbability,
    signals, foundKeywords: [...new Set(foundKeywords)].slice(0, 12),
    sender, subject, body
  };
}

/* ── UI Functions ────────────────────────────────────────────────────────────*/

function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('section' + name.charAt(0).toUpperCase() + name.slice(1)).classList.add('active');
  document.getElementById('nav' + name.charAt(0).toUpperCase() + name.slice(1)).classList.add('active');

  if (name === 'history') renderHistory();
  if (name === 'about') animateAccuracyBars();
}

async function classifyEmail() {
  const sender  = document.getElementById('senderEmail').value.trim();
  const subject = document.getElementById('emailSubject').value.trim();
  const body    = document.getElementById('emailBody').value.trim();

  if (!subject && !body) {
    showToast('⚠️ Please enter an email subject or body to analyze.', 'warn');
    return;
  }

  const btn = document.getElementById('classifyBtn');
  btn.disabled = true;

  // Show loading
  document.getElementById('resultPlaceholder').classList.add('hidden');
  document.getElementById('resultContent').classList.add('hidden');
  document.getElementById('loadingState').classList.remove('hidden');

  // Animate loading steps
  const steps = ['step1','step2','step3','step4'];
  for (let i = 0; i < steps.length; i++) {
    await delay(400);
    if (i > 0) document.getElementById(steps[i-1]).classList.remove('active');
    document.getElementById(steps[i]).classList.add('active');
  }
  await delay(500);
  document.getElementById(steps[steps.length-1]).classList.remove('active');
  steps.forEach(s => document.getElementById(s).classList.add('done'));
  await delay(200);

  // Run classifier
  const result = classifyEmailText(sender, subject || '(No Subject)', body);
  lastResult = result;

  // Update stats
  totalScanned++;
  if (result.verdict === 'spam') totalSpam++;
  localStorage.setItem('spamshield_total', totalScanned);
  localStorage.setItem('spamshield_spam', totalSpam);
  document.getElementById('totalScanned').textContent = totalScanned;
  document.getElementById('totalSpam').textContent = totalSpam;

  // Hide loading, show result
  document.getElementById('loadingState').classList.add('hidden');
  steps.forEach(s => { document.getElementById(s).classList.remove('done','active'); });
  renderResult(result);

  btn.disabled = false;
}

function renderResult(result) {
  const content = document.getElementById('resultContent');
  content.classList.remove('hidden');

  // Verdict Banner
  const banner = document.getElementById('verdictBanner');
  banner.className = 'verdict-banner ' +
    (result.verdict === 'spam' ? 'spam-banner' : result.verdict === 'warn' ? 'warn-banner' : 'safe-banner');

  const colorClass = result.verdict === 'spam' ? 'spam-color' : result.verdict === 'warn' ? 'warn-color' : 'safe-color';
  document.getElementById('verdictIcon').innerHTML =
    `<div class="verdict-icon ${result.verdict}-icon">${result.verdict === 'spam' ? '🚨' : result.verdict === 'warn' ? '⚠️' : '✅'}</div>`;
  document.getElementById('verdictLabel').textContent = result.label;
  document.getElementById('verdictLabel').className = 'verdict-label ' + colorClass;
  document.getElementById('verdictSub').textContent = result.subLabel;

  const scoreColor = result.verdict === 'spam' ? '#f43f5e' : result.verdict === 'warn' ? '#f59e0b' : '#10b981';
  document.getElementById('scoreNum').textContent = result.confidence + '%';
  document.getElementById('scoreNum').style.color = scoreColor;

  // Gauge
  setTimeout(() => {
    const pct = result.spamProbability * 100;
    const fill = document.getElementById('gaugeFill');
    fill.style.width = pct + '%';
    fill.className = 'gauge-fill ' + (result.verdict !== 'safe' ? 'spam-fill' : 'safe-fill');
    document.getElementById('gaugeMarker').style.left = pct + '%';
  }, 50);

  // Signals
  const signalsList = document.getElementById('signalsList');
  signalsList.innerHTML = result.signals.map(s => {
    const pct = Math.round(s.score * 100);
    const col = pct >= 60 ? '#f43f5e' : pct >= 30 ? '#f59e0b' : '#10b981';
    return `<div class="signal-item">
      <span class="signal-icon">${s.icon}</span>
      <span class="signal-name">${s.name}</span>
      <div class="signal-bar-wrap">
        <div class="signal-bar-track">
          <div class="signal-bar-fill" style="width:0%;background:${col}" data-width="${pct}"></div>
        </div>
      </div>
      <span class="signal-value" style="color:${col}">${pct}%</span>
    </div>`;
  }).join('');

  // Animate signal bars
  setTimeout(() => {
    document.querySelectorAll('.signal-bar-fill').forEach(el => {
      el.style.width = el.dataset.width + '%';
    });
  }, 100);

  // Keywords
  const kwSection = document.getElementById('keywordsSection');
  const kwTags = document.getElementById('keywordsTags');
  if (result.foundKeywords.length > 0) {
    kwSection.style.display = 'block';
    kwTags.innerHTML = result.foundKeywords.map(k => `<span class="keyword-tag">${k}</span>`).join('');
  } else {
    kwSection.style.display = 'none';
  }
}

/* ── Sample Loaders ── */
function loadSample(key) {
  const s = SAMPLES[key];
  if (!s) return;
  document.getElementById('senderEmail').value  = s.sender;
  document.getElementById('emailSubject').value = s.subject;
  document.getElementById('emailBody').value    = s.body;
  updateCharCount();
  showToast('📋 Sample email loaded — click Analyze Email!');
}

/* ── Utility Functions ── */
function clearInput() {
  document.getElementById('senderEmail').value  = '';
  document.getElementById('emailSubject').value = '';
  document.getElementById('emailBody').value    = '';
  document.getElementById('charCount').textContent = '0';
  document.getElementById('resultPlaceholder').classList.remove('hidden');
  document.getElementById('resultContent').classList.add('hidden');
  document.getElementById('loadingState').classList.add('hidden');
  lastResult = null;
}

async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById('emailBody').value = text;
    updateCharCount();
    showToast('📋 Pasted from clipboard!');
  } catch {
    showToast('⚠️ Clipboard access denied. Please paste manually.', 'warn');
  }
}

function updateCharCount() {
  const len = document.getElementById('emailBody').value.length;
  document.getElementById('charCount').textContent = len.toLocaleString();
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3000);
}

function copyResult() {
  if (!lastResult) return;
  const text = `SpamShield Classification Report
================================
Verdict: ${lastResult.label}
Confidence: ${lastResult.confidence}%
Subject: ${lastResult.subject}
Sender: ${lastResult.sender}
Flagged Keywords: ${lastResult.foundKeywords.join(', ') || 'None'}
Signal Breakdown:
${lastResult.signals.map(s => `  ${s.name}: ${Math.round(s.score*100)}%`).join('\n')}`;
  navigator.clipboard.writeText(text).then(() => showToast('📋 Report copied to clipboard!')).catch(() => showToast('⚠️ Could not copy.','warn'));
}

function addToHistory() {
  if (!lastResult) return;
  history.unshift({ ...lastResult, timestamp: Date.now() });
  if (history.length > 50) history = history.slice(0, 50);
  localStorage.setItem('spamshield_history', JSON.stringify(history));
  showToast('✅ Saved to history!');
}

function renderHistory() {
  const list = document.getElementById('historyList');
  const empty = document.getElementById('historyEmpty');
  if (history.length === 0) {
    empty.style.display = 'flex';
    list.innerHTML = '';
    return;
  }
  empty.style.display = 'none';
  list.innerHTML = history.map((h, i) => {
    const date = new Date(h.timestamp);
    const timeStr = date.toLocaleString();
    const v = h.verdict === 'spam' ? 'spam' : h.verdict === 'warn' ? 'spam' : 'safe';
    const icon = h.verdict === 'spam' ? '🚨' : h.verdict === 'warn' ? '⚠️' : '✅';
    return `<div class="history-item">
      <div class="history-badge ${v}">${icon}</div>
      <div class="history-info">
        <div class="history-subject">${escapeHtml(h.subject)}</div>
        <div class="history-meta">From: ${escapeHtml(h.sender || '—')}</div>
      </div>
      <span class="history-score ${v}">${h.confidence}% ${h.verdict.toUpperCase()}</span>
      <span class="history-time">${timeStr}</span>
    </div>`;
  }).join('');
}

function clearHistory() {
  history = [];
  localStorage.removeItem('spamshield_history');
  renderHistory();
  showToast('🗑️ History cleared!');
}

function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function animateAccuracyBars() {
  setTimeout(() => {
    document.querySelectorAll('.acc-fill').forEach(el => {
      const w = el.style.width;
      el.style.width = '0';
      setTimeout(() => { el.style.width = w; }, 100);
    });
  }, 50);
}

/* ── Particle System ── */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      a: Math.random() * 0.4 + 0.1,
      c: ['#6366f1','#8b5cf6','#f43f5e','#10b981'][Math.floor(Math.random()*4)]
    };
  }

  for (let i = 0; i < 120; i++) particles.push(createParticle());

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c;
      ctx.globalAlpha = p.a;
      ctx.fill();

      // Connect nearby particles
      particles.forEach(q => {
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = p.c;
          ctx.globalAlpha = (1 - dist/100) * 0.07;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });

      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('totalScanned').textContent = totalScanned;
  document.getElementById('totalSpam').textContent = totalSpam;

  // Char counter
  document.getElementById('emailBody').addEventListener('input', updateCharCount);

  // Keyboard shortcut: Ctrl+Enter to classify
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') classifyEmail();
  });
});
