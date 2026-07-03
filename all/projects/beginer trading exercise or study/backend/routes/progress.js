const express = require('express');
const router = express.Router();

// In-memory progress store (replace with DB in production)
const progressStore = {};

// GET progress for a session
router.get('/:sessionId', (req, res) => {
  const data = progressStore[req.params.sessionId] || {
    completedTopics: [],
    quizScores: [],
    streak: 0,
    lastActive: null
  };
  res.json({ success: true, data });
});

// POST update progress
router.post('/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const { topicId, quizScore, category } = req.body;

  if (!progressStore[sessionId]) {
    progressStore[sessionId] = { completedTopics: [], quizScores: [], streak: 0, lastActive: null };
  }

  const progress = progressStore[sessionId];

  if (topicId && !progress.completedTopics.includes(topicId)) {
    progress.completedTopics.push(topicId);
  }

  if (quizScore !== undefined) {
    progress.quizScores.push({ score: quizScore, category, date: new Date() });
  }

  progress.lastActive = new Date();
  progress.streak++;

  res.json({ success: true, data: progress });
});

module.exports = router;
