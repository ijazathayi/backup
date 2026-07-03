const express = require('express');
const router = express.Router();
const { glossary } = require('../data/seedData');

// GET all glossary terms
router.get('/', (req, res) => {
  const { search } = req.query;
  let result = glossary;
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(g =>
      g.term.en.toLowerCase().includes(q) ||
      g.term.ta.includes(search) ||
      g.definition.en.toLowerCase().includes(q)
    );
  }
  res.json({ success: true, data: result, count: result.length });
});

module.exports = router;
