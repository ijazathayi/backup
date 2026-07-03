const express = require('express');
const router = express.Router();
const { candlesticks } = require('../data/seedData');

// GET all candlestick patterns
router.get('/', (req, res) => {
  const { type, pattern } = req.query;
  let result = candlesticks;
  if (type) result = result.filter(c => c.type === type);
  if (pattern) result = result.filter(c => c.pattern === pattern);
  res.json({ success: true, data: result, count: result.length });
});

// GET single candlestick by ID
router.get('/:id', (req, res) => {
  const candle = candlesticks.find(c => c.id === parseInt(req.params.id));
  if (!candle) return res.status(404).json({ success: false, message: 'Candlestick pattern not found' });
  res.json({ success: true, data: candle });
});

module.exports = router;
