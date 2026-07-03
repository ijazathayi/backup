function pickList(value, lang) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value[lang] || value.en || [];
}

function normalizeTopic(topic) {
  const summary = topic.summary || topic.description;
  const deep = topic.deepDive || {};
  const hasDeepContent = !!(
    deep.description ||
    deep.keyPoints ||
    deep.practice ||
    deep.mistakes ||
    deep.checklist ||
    deep.examples ||
    topic.practice ||
    topic.mistakes ||
    topic.checklist
  );

  return {
    ...topic,
    summary,
    description: summary,
    hasDeepDive: topic.hasDeepDive !== false && hasDeepContent,
    learningPath: topic.learningPath || 'both',
    deepReadTime: topic.deepReadTime || (topic.readTime || 5) + 10,
    deepDive: {
      description: deep.description || summary,
      keyPoints: deep.keyPoints || topic.keyPoints,
      examples: deep.examples || topic.examples || { en: [], ta: [] },
      practice: deep.practice || topic.practice || { en: [], ta: [] },
      mistakes: deep.mistakes || topic.mistakes || { en: [], ta: [] },
      checklist: deep.checklist || topic.checklist || { en: [], ta: [] }
    },
    bookRef: topic.bookRef || null
  };
}

module.exports = { normalizeTopic, pickList };
