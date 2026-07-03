const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/topics', require('./routes/topics'));
app.use('/api/candlesticks', require('./routes/candlesticks'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/glossary', require('./routes/glossary'));
app.use('/api/progress', require('./routes/progress'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Trading Study API is running' });
});

// Connect to MongoDB (optional — app works with seed data even without DB)
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.log('MongoDB not available — running with in-memory seed data');
  }
};

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
