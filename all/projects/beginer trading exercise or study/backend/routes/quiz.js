const express = require('express');
const router = express.Router();
const { quizQuestions } = require('../data/seedData');

// GET all quiz questions (optionally filtered)
router.get('/', (req, res) => {
  const { category, difficulty } = req.query;
  let result = quizQuestions;
  if (category) result = result.filter(q => q.category === category);
  if (difficulty) result = result.filter(q => q.difficulty === difficulty);
  // Shuffle
  result = result.sort(() => Math.random() - 0.5);
  res.json({ success: true, data: result, count: result.length });
});

// POST submit quiz answers and get score
router.post('/submit', (req, res) => {
  const { answers } = req.body; // { questionId: selectedOptionIndex }
  if (!answers) return res.status(400).json({ success: false, message: 'Answers required' });

  let correct = 0;
  let total = 0;
  const results = [];

  for (const [qId, selected] of Object.entries(answers)) {
    const question = quizQuestions.find(q => q.id === parseInt(qId));
    if (!question) continue;
    total++;
    const isCorrect = parseInt(selected) === question.correct;
    if (isCorrect) correct++;
    results.push({
      questionId: question.id,
      selected: parseInt(selected),
      correct: question.correct,
      isCorrect,
      explanation: question.explanation
    });
  }

  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  res.json({
    success: true,
    data: {
      score,
      correct,
      total,
      results,
      grade: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Average' : 'Keep Studying'
    }
  });
});

module.exports = router;
