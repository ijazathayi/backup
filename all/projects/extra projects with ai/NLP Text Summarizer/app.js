'use strict';

const SAMPLES = {
  news: `Artificial intelligence is transforming the global economy at an unprecedented pace. Major technology companies have invested billions of dollars into AI research and development over the past decade. These investments are beginning to pay off, with AI systems now capable of performing complex tasks that previously required human expertise. From medical diagnostics to financial modeling, AI applications are being deployed across virtually every industry. The healthcare sector has seen particularly dramatic changes, with AI algorithms now able to detect certain types of cancer more accurately than trained radiologists. In finance, AI-driven trading systems handle trillions of dollars in transactions daily. However, the rapid adoption of AI technology has also raised significant concerns about job displacement and economic inequality. Economists estimate that AI could automate up to 40% of current jobs within the next 20 years. Governments around the world are grappling with how to regulate AI technology while still allowing innovation to flourish. Some countries, such as China and the United States, are engaged in a fierce competition to dominate AI development, viewing technological supremacy as critical to their economic and national security interests. Despite these challenges, many experts remain optimistic about the long-term benefits of AI, arguing that the technology will ultimately create more jobs than it destroys while significantly improving quality of life.`,
  research: `Recent advances in transformer-based neural network architectures have dramatically improved natural language processing capabilities. The introduction of attention mechanisms has allowed models to capture long-range dependencies in text more effectively than previous recurrent approaches. Large language models trained on diverse internet-scale corpora have demonstrated remarkable few-shot and zero-shot generalization abilities, suggesting that scale alone may be sufficient to acquire broad language understanding. However, these models also exhibit significant limitations, including hallucination of factual information, sensitivity to prompt engineering, and difficulty with formal reasoning tasks. Researchers have proposed several mitigation strategies, including retrieval-augmented generation, chain-of-thought prompting, and reinforcement learning from human feedback. The computational costs associated with training and deploying these models remain a significant barrier to widespread adoption. Carbon emissions from large-scale model training have become an increasingly important consideration in the field. Alternative architectures, including state-space models and mixture-of-experts approaches, are being actively investigated as potentially more efficient alternatives to the standard transformer architecture. The question of whether current approaches can be scaled to achieve artificial general intelligence remains hotly contested within the research community.`,
  story: `The old lighthouse stood at the edge of the rocky cliff, its white paint peeling from decades of salt and wind. Elena had passed it countless times on her way to the fishing village below, but she had never once considered stopping. That changed on a stormy October evening when she noticed a faint light flickering in the supposedly abandoned structure. Curiosity overcame her better judgment, and she pushed open the creaking iron door. Inside, she found an elderly man hunched over a collection of antique nautical instruments, surrounded by towers of yellowed charts and logbooks. He introduced himself as Thomas, the last keeper of the lighthouse, who had refused to leave when the automated systems replaced him forty years ago. Elena sat with him for hours as the storm raged outside, listening to stories of ships guided safely to harbor, of lives saved and lost, of a world that existed before GPS and satellite navigation. When she finally rose to leave, Thomas pressed a small brass compass into her hand. The needle spun wildly at first, then settled, pointing not north, but toward the village where her own forgotten dreams awaited. She walked home through the clearing storm, seeing the familiar path with entirely new eyes.`
};

const STOP_WORDS = new Set(['a','an','the','is','it','in','on','at','to','for','of','and','or','but','not','with','this','that','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','shall','can','from','by','as','its','their','there','these','those','they','them','then','than','so','yet','both','also','just','only','very','about','over','into','some','any','all','most','other','more','such','even','up','out','if','each','how','which','who','what','when','where','why','he','she','we','you','i','my','your','his','her','our','it']);

const inputArea = document.getElementById('inputArea');
const summarizeBtn = document.getElementById('summarizeBtn');
const clearInputBtn = document.getElementById('clearInputBtn');
const summaryArea = document.getElementById('summaryArea');
const copySummaryBtn = document.getElementById('copySummaryBtn');
const compressionBadge = document.getElementById('compressionBadge');
const statsRow = document.getElementById('statsRow');
const keywordsSection = document.getElementById('keywordsSection');
const keywordsGrid = document.getElementById('keywordsGrid');
const inputWc = document.getElementById('inputWc');
const origWcEl = document.getElementById('origWc');
const summWcEl = document.getElementById('summWc');
const compRatioEl = document.getElementById('compRatio');

let summaryRatio = 0.40;
let currentSummary = '';

// Length buttons
document.querySelectorAll('.len-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.len-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    summaryRatio = parseFloat(btn.dataset.pct);
  });
});

// Sample buttons
document.querySelectorAll('.sample-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    inputArea.value = SAMPLES[btn.dataset.sample];
    updateWordCount();
  });
});

inputArea.addEventListener('input', updateWordCount);

function updateWordCount() {
  const wc = countWords(inputArea.value);
  inputWc.textContent = wc + ' words';
}

function countWords(text) {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

function computeTFIDF(sentences) {
  const docCount = sentences.length;
  const df = {};
  const sentTokens = sentences.map(s => tokenize(s));

  sentTokens.forEach(tokens => {
    const unique = new Set(tokens);
    unique.forEach(w => { df[w] = (df[w] || 0) + 1; });
  });

  return sentTokens.map(tokens => {
    if (tokens.length === 0) return 0;
    const tf = {};
    tokens.forEach(w => { tf[w] = (tf[w] || 0) + 1; });
    let score = 0;
    Object.entries(tf).forEach(([w, freq]) => {
      const tfidf = (freq / tokens.length) * Math.log((docCount + 1) / ((df[w] || 0) + 1));
      score += tfidf;
    });
    return score / tokens.length;
  });
}

function extractKeywords(text, n = 10) {
  const tokens = tokenize(text);
  const freq = {};
  tokens.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

function summarize(text, ratio) {
  // Split into sentences (handle . ! ?)
  const rawSents = text.match(/[^.!?]+[.!?]*/g) || [text];
  const sentences = rawSents.map(s => s.trim()).filter(s => s.length > 10);

  if (sentences.length <= 2) return { summary: text, sentences };

  const scores = computeTFIDF(sentences);
  const numToKeep = Math.max(1, Math.round(sentences.length * ratio));

  // Get indices of top-scoring sentences, sorted by original position
  const indexed = scores.map((s, i) => ({ score: s, idx: i }));
  indexed.sort((a, b) => b.score - a.score);
  const topIdxs = new Set(indexed.slice(0, numToKeep).map(x => x.idx));

  const selectedSentences = sentences.filter((_, i) => topIdxs.has(i));
  return { summary: selectedSentences.join(' '), sentences: selectedSentences };
}

summarizeBtn.addEventListener('click', () => {
  const text = inputArea.value.trim();
  if (!text) { inputArea.focus(); return; }

  summarizeBtn.textContent = '⏳ Summarizing...';
  summarizeBtn.disabled = true;

  setTimeout(() => {
    const { summary, sentences } = summarize(text, summaryRatio);
    currentSummary = summary;

    // Build HTML with highlighted key sentences
    summaryArea.innerHTML = sentences.map(s =>
      `<span class="highlight-sentence">${escapeHtml(s)}</span> `
    ).join('');

    const origWc = countWords(text);
    const summWc = countWords(summary);
    const ratio = origWc > 0 ? Math.round((1 - summWc / origWc) * 100) : 0;

    origWcEl.textContent = origWc;
    summWcEl.textContent = summWc;
    compRatioEl.textContent = ratio + '%';
    statsRow.style.display = 'flex';

    compressionBadge.textContent = ratio + '% compressed';
    compressionBadge.style.display = 'inline';

    copySummaryBtn.disabled = false;

    // Keywords
    const kws = extractKeywords(text);
    const maxFreq = kws[0] ? kws[0][1] : 1;
    keywordsGrid.innerHTML = kws.map(([word, freq]) => `
      <div class="kw-item">
        <span class="kw-word">${word}</span>
        <div class="kw-bar-bg"><div class="kw-bar-fill" style="width:${(freq/maxFreq*100).toFixed(0)}%"></div></div>
        <span class="kw-count">${freq}×</span>
      </div>`).join('');
    keywordsSection.style.display = 'block';

    summarizeBtn.textContent = '⚡ Summarize Text';
    summarizeBtn.disabled = false;
  }, 400);
});

copySummaryBtn.addEventListener('click', async () => {
  if (!currentSummary) return;
  try {
    await navigator.clipboard.writeText(currentSummary);
    copySummaryBtn.textContent = '✅ Copied!';
    setTimeout(() => { copySummaryBtn.textContent = '📋 Copy'; }, 2000);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = currentSummary; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    copySummaryBtn.textContent = '✅ Copied!';
    setTimeout(() => { copySummaryBtn.textContent = '📋 Copy'; }, 2000);
  }
});

clearInputBtn.addEventListener('click', () => {
  inputArea.value = '';
  inputWc.textContent = '0 words';
  summaryArea.innerHTML = `<div class="output-placeholder"><div class="ph-icon">📄</div><p>Your summary will appear here</p><p class="ph-sub">Paste text and click Summarize</p></div>`;
  statsRow.style.display = 'none';
  keywordsSection.style.display = 'none';
  compressionBadge.style.display = 'none';
  copySummaryBtn.disabled = true;
  currentSummary = '';
});

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
