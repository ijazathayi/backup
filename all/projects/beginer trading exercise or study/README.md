# TradeLearn - Beginner Trading Education App

TradeLearn is a beginner-friendly trading study app with a React frontend and an Express backend. It includes learning topics, candlestick pattern guides, quiz practice, and a glossary.

## How to Run

### 1. Start the backend

Double-click `start-backend.bat`, or run:

```bash
cd backend
npm install
node server.js
```

Backend URL: `http://localhost:5000`

### 2. Start the React frontend

Double-click `open-app.bat`, or run:

```bash
cd frontend
npm install --cache .\.npm-cache
npm run dev
```

Frontend URL: `http://localhost:3000`

## Features

- Learning hub for trading basics, indicators, risk, psychology, and advanced workflow
- Candlestick pattern library with visual candle drawings
- Quiz with scoring and explanations
- Searchable trading glossary
- English/Tamil language toggle using the available bilingual content

## Project Structure

```text
backend/
  server.js
  routes/
  data/seedData.js

frontend/
  index.html
  package.json
  src/
    main.jsx
    App.jsx
    styles.css
  css/style.css
```

## API Endpoints

- `GET /api/health`
- `GET /api/topics`
- `GET /api/candlesticks`
- `GET /api/quiz`
- `POST /api/quiz/submit`
- `GET /api/glossary`

Disclaimer: This app is for educational purposes only. It is not financial advice.
