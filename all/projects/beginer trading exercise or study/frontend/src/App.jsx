import { useEffect, useMemo, useState } from 'react';

const API_BASE = 'http://localhost:5000/api';

const pages = [
  { id: 'home', label: 'Home' },
  { id: 'topics', label: 'Learn' },
  { id: 'candlesticks', label: 'Candlesticks' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'glossary', label: 'Glossary' }
];

const fallbackTopics = [
  {
    id: 1,
    category: 'basics',
    title: { en: 'What is Stock Market?', ta: 'Stock Market Basics' },
    description: { en: 'Learn how shares, exchanges, buyers, sellers, and price movement work.', ta: 'Learn how shares, exchanges, buyers, sellers, and price movement work.' },
    keyPoints: { en: ['Stocks represent ownership', 'Prices move by supply and demand', 'Risk management matters from day one'], ta: ['Stocks represent ownership', 'Prices move by supply and demand', 'Risk management matters from day one'] },
    icon: '01',
    difficulty: 'beginner',
    readTime: 5
  }
];

const fallbackCandles = [
  {
    id: 1,
    name: { en: 'Doji', ta: 'Doji' },
    description: { en: 'Open and close are almost equal, showing indecision.', ta: 'Open and close are almost equal, showing indecision.' },
    signal: { en: 'Wait for confirmation before acting.', ta: 'Wait for confirmation before acting.' },
    psychology: { en: 'Neither buyers nor sellers fully controlled the session.', ta: 'Neither buyers nor sellers fully controlled the session.' },
    bullishBearish: 'neutral',
    bodySize: 'none',
    shadowSize: 'equal',
    pattern: 'single'
  }
];

const fallbackQuiz = [
  {
    id: 1,
    question: { en: 'What should you always define before entering a trade?', ta: 'What should you always define before entering a trade?' },
    options: { en: ['Stop loss', 'Rumor', 'Emotion', 'Luck'], ta: ['Stop loss', 'Rumor', 'Emotion', 'Luck'] },
    correct: 0,
    explanation: { en: 'A stop loss defines when the trade idea is wrong.', ta: 'A stop loss defines when the trade idea is wrong.' }
  }
];

const fallbackGlossary = [
  {
    id: 1,
    term: { en: 'Stop Loss', ta: 'Stop Loss' },
    definition: { en: 'An exit level used to limit loss if price moves against your plan.', ta: 'An exit level used to limit loss if price moves against your plan.' }
  }
];

function pick(value, lang) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[lang] || value.en || '';
}

async function getApi(path, fallback) {
  try {
    const response = await fetch(`${API_BASE}${path}`);
    if (!response.ok) throw new Error('Request failed');
    const json = await response.json();
    return json.data || fallback;
  } catch {
    return fallback;
  }
}

function drawCandle(candle, width = 74, height = 94) {
  const color =
    candle.bullishBearish === 'bearish' ? '#E74C3C' :
    candle.bullishBearish === 'neutral' ? '#7F8C8D' :
    candle.bullishBearish === 'both' ? '#5E7CE2' : '#27AE60';
  const cx = width / 2;

  if (candle.bodySize === 'none') {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        <line x1={cx} y1="8" x2={cx} y2={height - 8} stroke={color} strokeWidth="3" />
        <rect x={cx - 16} y={height / 2 - 3} width="32" height="6" rx="2" fill={color} />
      </svg>
    );
  }

  if (candle.bodySize === 'mixed') {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        <rect x="8" y="22" width="14" height="44" rx="2" fill="#E74C3C" />
        <line x1="15" y1="10" x2="15" y2="80" stroke="#E74C3C" strokeWidth="2" />
        <rect x="30" y="42" width="14" height="9" rx="2" fill="#7F8C8D" />
        <line x1="37" y1="28" x2="37" y2="68" stroke="#7F8C8D" strokeWidth="2" />
        <rect x="52" y="24" width="14" height="42" rx="2" fill={color} />
        <line x1="59" y1="12" x2="59" y2="82" stroke={color} strokeWidth="2" />
      </svg>
    );
  }

  const bodyHeight = candle.bodySize === 'small' ? 22 : candle.bodySize === 'full' ? 74 : 52;
  const bodyY = candle.shadowSize === 'long-upper' ? 54 : candle.shadowSize === 'long-lower' ? 18 : (height - bodyHeight) / 2;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <line x1={cx} y1="8" x2={cx} y2={height - 8} stroke={color} strokeWidth="3" />
      <rect x={cx - 18} y={bodyY} width="36" height={bodyHeight} rx="4" fill={color} />
    </svg>
  );
}

function App() {
  const [page, setPage] = useState('home');
  const [lang, setLang] = useState('en');
  const [menuOpen, setMenuOpen] = useState(false);
  const [topics, setTopics] = useState([]);
  const [candles, setCandles] = useState([]);
  const [quiz, setQuiz] = useState([]);
  const [glossary, setGlossary] = useState([]);
  const [topicFilter, setTopicFilter] = useState('all');
  const [candleFilter, setCandleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [quizIndex, setQuizIndex] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    getApi('/topics', fallbackTopics).then(setTopics);
    getApi('/candlesticks', fallbackCandles).then(setCandles);
    getApi('/quiz', fallbackQuiz).then(setQuiz);
    getApi('/glossary', fallbackGlossary).then(setGlossary);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('lang-ta', lang === 'ta');
  }, [lang]);

  const filteredTopics = useMemo(() => {
    return topicFilter === 'all' ? topics : topics.filter((topic) => topic.difficulty === topicFilter);
  }, [topics, topicFilter]);

  const filteredCandles = useMemo(() => {
    return candleFilter === 'all'
      ? candles
      : candles.filter((candle) => candle.bullishBearish === candleFilter || candle.type === candleFilter);
  }, [candles, candleFilter]);

  const filteredGlossary = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return glossary;
    return glossary.filter((item) => {
      return pick(item.term, 'en').toLowerCase().includes(term) ||
        pick(item.definition, 'en').toLowerCase().includes(term) ||
        pick(item.term, 'ta').toLowerCase().includes(term);
    });
  }, [glossary, search]);

  function navigate(id) {
    setPage(id);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startQuiz() {
    setAnswers({});
    setQuizIndex(0);
  }

  function chooseAnswer(questionId, optionIndex) {
    setAnswers((current) => ({ ...current, [questionId]: optionIndex }));
  }

  function resetQuiz() {
    setAnswers({});
    setQuizIndex(null);
  }

  const currentQuestion = quizIndex === null ? null : quiz[quizIndex];
  const score = quiz.length
    ? Math.round((quiz.filter((q) => answers[q.id] === q.correct).length / quiz.length) * 100)
    : 0;

  return (
    <>
      <nav className="navbar">
        <button className="nav-brand" onClick={() => navigate('home')} aria-label="Open home">
          <span className="brand-icon">TL</span>
          <span className="brand-name">TradeLearn</span>
        </button>
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {pages.map((item) => (
            <button key={item.id} className={`nav-link ${page === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="nav-controls">
          <button className="lang-toggle" onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}>
            {lang === 'en' ? 'Tamil' : 'English'}
          </button>
          <button className="nav-hamburger" onClick={() => setMenuOpen((open) => !open)} aria-label="Menu">Menu</button>
        </div>
      </nav>

      <main className="main-content">
        {page === 'home' && (
          <section className="page active">
            <div className="hero">
              <div className="hero-content">
                <div className="hero-badge">For Beginners</div>
                <h1 className="hero-title">Master Trading<br /><span className="gradient-text">from Zero</span></h1>
                <p className="hero-subtitle">
                  Learn market basics, candlestick reading, risk control, and trading discipline in one focused study app.
                </p>
                <div className="hero-actions">
                  <button className="btn btn-primary" onClick={() => navigate('topics')}>Start Learning</button>
                  <button className="btn btn-outline" onClick={() => navigate('candlesticks')}>Candlestick Patterns</button>
                </div>
                <div className="hero-stats">
                  <div className="stat-item"><span className="stat-num">{candles.length || 10}+</span><span className="stat-label">Patterns</span></div>
                  <div className="stat-item"><span className="stat-num">{topics.length || 12}</span><span className="stat-label">Study Topics</span></div>
                  <div className="stat-item"><span className="stat-num">2</span><span className="stat-label">Languages</span></div>
                </div>
              </div>
              <div className="hero-visual">
                <div className="react-chart">
                  {[42, 64, 50, 76, 58, 86, 72].map((height, index) => (
                    <span key={index} className={index % 2 ? 'up' : 'down'} style={{ '--h': `${height}%`, '--delay': `${index * 80}ms` }} />
                  ))}
                </div>
              </div>
            </div>

            <div className="section">
              <h2 className="section-title">What You Will Learn</h2>
              <div className="feature-grid">
                <FeatureCard title="Stock Market Basics" detail="Understand markets, charts, trading types, and important terms." action={() => navigate('topics')} />
                <FeatureCard title="Candlestick Patterns" detail="Study Doji, Hammer, Engulfing, Morning Star, and more." action={() => navigate('candlesticks')} />
                <FeatureCard title="Knowledge Quiz" detail="Test your learning with instant scoring and explanations." action={() => navigate('quiz')} />
                <FeatureCard title="Trading Glossary" detail="Search simple meanings for common trading words." action={() => navigate('glossary')} />
              </div>
            </div>
          </section>
        )}

        {page === 'topics' && (
          <section className="page active">
            <PageHeader title="Learning Hub" subtitle="Choose a topic and study it step by step." />
            <FilterBar value={topicFilter} onChange={setTopicFilter} options={['all', 'beginner', 'intermediate', 'advanced', 'pro']} />
            <div className="cards-grid">
              {filteredTopics.map((topic) => (
                <button className="topic-card" key={topic.id} onClick={() => setModal({ type: 'topic', data: topic })}>
                  <div className="topic-card-header">
                    <div className="topic-icon">{topic.icon || String(topic.id).padStart(2, '0')}</div>
                    <div>
                      <div className="topic-card-title">{pick(topic.title, lang)}</div>
                      <div className="topic-card-sub">{topic.category}</div>
                    </div>
                  </div>
                  <div className="topic-card-desc">{pick(topic.description, lang)}</div>
                  <div className="topic-card-footer">
                    <span className={`difficulty-badge ${topic.difficulty}`}>{topic.difficulty}</span>
                    <span className="read-time">{topic.readTime || 5} min read</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {page === 'candlesticks' && (
          <section className="page active">
            <PageHeader title="Candlestick Patterns" subtitle="Visual guide to reading candle signals and market psychology." />
            <div className="anatomy-box">
              <h3>Anatomy of a Candlestick</h3>
              <div className="anatomy-row">
                {drawCandle({ bodySize: 'large', bullishBearish: 'bullish' }, 90, 170)}
                <div className="anatomy-labels">
                  <Label title="Upper Shadow" text="Highest price reached during the period." />
                  <Label title="Body" text="Range between open and close." />
                  <Label title="Lower Shadow" text="Lowest price reached during the period." />
                </div>
              </div>
            </div>
            <FilterBar value={candleFilter} onChange={setCandleFilter} options={['all', 'bullish', 'bearish', 'neutral']} />
            <div className="cards-grid">
              {filteredCandles.map((candle) => (
                <button className="candle-card" key={candle.id} onClick={() => setModal({ type: 'candle', data: candle })}>
                  <div className="candle-card-header">
                    <div className="candle-visual">{drawCandle(candle)}</div>
                    <div className="candle-card-info">
                      <div className="candle-name">{pick(candle.name, lang)}</div>
                      <div className="candle-name-ta">{pick(candle.name, 'ta')}</div>
                      <span className={`candle-badge ${candle.bullishBearish === 'both' ? 'strong' : candle.bullishBearish}`}>{candle.bullishBearish}</span>
                    </div>
                  </div>
                  <div className="candle-desc">{pick(candle.description, lang)}</div>
                  <div className="candle-signal"><strong>Signal:</strong> {pick(candle.signal, lang)}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        {page === 'quiz' && (
          <section className="page active">
            <PageHeader title="Knowledge Quiz" subtitle="Answer each question and review the explanation." />
            {quizIndex === null && (
              <div className="quiz-start-screen">
                <div className="quiz-start-card">
                  <div className="quiz-icon">Q</div>
                  <h2>Ready to Test Yourself?</h2>
                  <p>{quiz.length || 1} questions covering basics, candlesticks, indicators, risk, and discipline.</p>
                  <button className="btn btn-primary" onClick={startQuiz}>Start Quiz</button>
                </div>
              </div>
            )}
            {currentQuestion && (
              <QuizQuestion
                question={currentQuestion}
                index={quizIndex}
                total={quiz.length}
                selected={answers[currentQuestion.id]}
                lang={lang}
                onAnswer={(optionIndex) => chooseAnswer(currentQuestion.id, optionIndex)}
                onNext={() => setQuizIndex((index) => index + 1)}
                onFinish={() => setQuizIndex(quiz.length)}
              />
            )}
            {quizIndex === quiz.length && (
              <div className="quiz-result-wrap">
                <div className="quiz-result-card">
                  <div className="score-circle" style={{ '--score': score }}><span className="score-num">{score}%</span></div>
                  <div className={`result-grade ${score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'average' : 'keep'}`}>
                    {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Average' : 'Keep Studying'}
                  </div>
                  <p className="result-sub">You answered {quiz.filter((q) => answers[q.id] === q.correct).length} of {quiz.length} correctly.</p>
                  <button className="btn btn-primary" onClick={resetQuiz}>Try Again</button>
                </div>
              </div>
            )}
          </section>
        )}

        {page === 'glossary' && (
          <section className="page active">
            <PageHeader title="Trading Glossary" subtitle="Search simple explanations for trading terms." />
            <div className="search-bar">
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search terms..." />
              <span className="search-icon">Search</span>
            </div>
            <div className="glossary-list">
              {filteredGlossary.map((item) => (
                <div className="glossary-item" key={item.id}>
                  <div className="glossary-term">{pick(item.term, lang)} <span className="glossary-term-ta">{pick(item.term, 'ta')}</span></div>
                  <div className="glossary-def">{pick(item.definition, lang)}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand"><span>TradeLearn</span><span>Learn trading in Tamil and English</span></div>
          <p className="footer-note">For educational purposes only. Not financial advice.</p>
        </div>
      </footer>

      {modal && <DetailModal modal={modal} lang={lang} onClose={() => setModal(null)} />}
    </>
  );
}

function FeatureCard({ title, detail, action }) {
  return (
    <button className="feature-card" onClick={action}>
      <div className="feature-icon">+</div>
      <h3>{title}</h3>
      <p>{detail}</p>
      <span className="feature-tag">Open</span>
    </button>
  );
}

function PageHeader({ title, subtitle }) {
  return (
    <div className="page-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}

function FilterBar({ value, onChange, options }) {
  return (
    <div className="filter-bar">
      {options.map((option) => (
        <button key={option} className={`filter-btn ${value === option ? 'active' : ''}`} onClick={() => onChange(option)}>
          {option === 'all' ? 'All' : option}
        </button>
      ))}
    </div>
  );
}

function Label({ title, text }) {
  return (
    <div className="anatomy-item">
      <span className="dot green" />
      <div><strong>{title}</strong><p>{text}</p></div>
    </div>
  );
}

function QuizQuestion({ question, index, total, selected, lang, onAnswer, onNext, onFinish }) {
  const options = pick(question.options, lang) || [];
  const hasAnswered = selected !== undefined;

  return (
    <div className="quiz-game-wrap">
      <div className="quiz-progress-bar-outer">
        <div className="quiz-progress-bar-inner" style={{ width: `${(index / total) * 100}%` }} />
      </div>
      <div className="quiz-progress-text">Question {index + 1} of {total}</div>
      <div className="quiz-q-card">
        <div className="quiz-q-num">Question {index + 1}</div>
        <div className="quiz-q-text">{pick(question.question, lang)}</div>
        <div className="quiz-options">
          {options.map((option, optionIndex) => {
            const state = hasAnswered && optionIndex === question.correct ? 'correct' : hasAnswered && optionIndex === selected ? 'wrong' : '';
            return (
              <button key={option} className={`quiz-option ${state}`} disabled={hasAnswered} onClick={() => onAnswer(optionIndex)}>
                {option}
              </button>
            );
          })}
        </div>
        {hasAnswered && (
          <>
            <div className="quiz-explanation show"><strong>Explanation:</strong> {pick(question.explanation, lang)}</div>
            <div className="quiz-next-btn">
              <button className="btn btn-primary" onClick={index + 1 < total ? onNext : onFinish}>
                {index + 1 < total ? 'Next Question' : 'See Results'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DetailModal({ modal, lang, onClose }) {
  const item = modal.data;
  const isTopic = modal.type === 'topic';
  const points = isTopic ? pick(item.keyPoints, lang) : [];

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>x</button>
        {isTopic ? (
          <>
            <div className="modal-topic-icon">{item.icon || item.id}</div>
            <div className="modal-topic-title">{pick(item.title, lang)}</div>
            <div className="modal-topic-badge"><span className={`difficulty-badge ${item.difficulty}`}>{item.difficulty}</span></div>
            <div className="modal-desc">{pick(item.description, lang)}</div>
            {Array.isArray(points) && (
              <div className="modal-keypoints">
                <h4>Key Points</h4>
                {points.map((point) => <div className="keypoint-item" key={point}>{point}</div>)}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="candle-modal-header">
              <div className="candle-modal-svg">{drawCandle(item, 90, 130)}</div>
              <div>
                <div className="candle-modal-name">{pick(item.name, lang)}</div>
                <div className="candle-modal-name-ta">{pick(item.name, 'ta')}</div>
                <span className={`candle-badge ${item.bullishBearish === 'both' ? 'strong' : item.bullishBearish}`}>{item.bullishBearish}</span>
              </div>
            </div>
            <div className="candle-modal-section"><h4>Description</h4><p>{pick(item.description, lang)}</p></div>
            <div className="candle-modal-section"><h4>Signal</h4><div className={`signal-box ${item.bullishBearish}`}>{pick(item.signal, lang)}</div></div>
            <div className="candle-modal-section"><h4>Market Psychology</h4><p>{pick(item.psychology, lang)}</p></div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
