const express = require('express');
const router = express.Router();
const { topics } = require('../data/seedData');

// GET all topics
router.get('/', (req, res) => {
  const { category, difficulty, lang } = req.query;
  let result = topics;
  if (category) result = result.filter(t => t.category === category);
  if (difficulty) result = result.filter(t => t.difficulty === difficulty);
  res.json({ success: true, data: result, count: result.length });
});

// GET single topic by ID
router.get('/:id', (req, res) => {
  const topic = topics.find(t => t.id === parseInt(req.params.id));
  if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });
  res.json({ success: true, data: topic });
});

// GET categories list
router.get('/meta/categories', (req, res) => {
  const categories = [...new Set(topics.map(t => t.category))];
  res.json({ success: true, data: categories });
});

module.exports = router;
