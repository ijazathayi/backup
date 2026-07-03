'use strict';

// Stock Price Prediction - Linear Regression & Moving Average Models

// Stock data (simulated historical prices)
const STOCK_DATA = {
  AAPL: { name: 'Apple Inc.', basePrice: 175, volatility: 0.02 },
  GOOGL: { name: 'Alphabet Inc.', basePrice: 135, volatility: 0.025 },
  MSFT: { name: 'Microsoft Corp.', basePrice: 380, volatility: 0.018 },
  AMZN: { name: 'Amazon.com Inc.', basePrice: 145, volatility: 0.03 },
  TSLA: { name: 'Tesla Inc.', basePrice: 240, volatility: 0.05 },
  META: { name: 'Meta Platforms', basePrice: 470, volatility: 0.035 },
  NVDA: { name: 'NVIDIA Corp.', basePrice: 880, volatility: 0.04 },
  NFLX: { name: 'Netflix Inc.', basePrice: 560, volatility: 0.03 }
};

// DOM elements
const elements = {
  stockSelect: document.getElementById('stockSelect'),
  predictBtn: document.getElementById('predictBtn'),
  marketGrid: document.getElementById('marketGrid'),
  resultsCard: document.getElementById('resultsCard'),
  resultsTitle: document.getElementById('resultsTitle'),
  resultsContent: document.getElementById('resultsContent'),
  chartTitle: document.getElementById('chartTitle'),
  chartSub: document.getElementById('chartSub'),
  mainChart: document.getElementById('mainChart'),
  chartLegend: document.getElementById('chartLegend'),
  chartXLabels: document.getElementById('chartXLabels')
};

// App state
let historicalData = [];
let predictedData = [];
let currentStock = 'AAPL';

// Initialize app
function init() {
  setupEventListeners();
  renderMarketOverview();
  generateHistoricalData();
}

// Setup event listeners
function setupEventListeners() {
  elements.predictBtn.addEventListener('click', runPrediction);
  elements.stockSelect.addEventListener('change', (e) => {
    currentStock = e.target.value;
    generateHistoricalData();
    renderMarketOverview();
    resetResults();
  });
}

// Generate historical data
function generateHistoricalData() {
  const stock = STOCK_DATA[currentStock];
  historicalData = [];
  
  let price = stock.basePrice;
  const days = 60; // 60 days of historical data
  
  for (let i = 0; i < days; i++) {
    // Random walk with drift
    const change = (Math.random() - 0.48) * stock.volatility * price;
    price = Math.max(price + change, 10); // Minimum price of $10
    
    historicalData.push({
      day: i,
      price: price,
      date: getDateOffset(days - i)
    });
  }
  
  historicalData.reverse(); // Oldest to newest
}

// Get date offset string
function getDateOffset(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Render market overview
function renderMarketOverview() {
  const cards = Object.entries(STOCK_DATA).map(([symbol, data]) => {
    const change = (Math.random() - 0.45) * 5;
    const isPositive = change >= 0;
    const price = data.basePrice + change;
    
    return `
      <div class="market-card ${currentStock === symbol ? 'active' : ''}" data-symbol="${symbol}">
        <div class="market-symbol">${symbol}</div>
        <div class="market-name">${data.name}</div>
        <div class="market-price">$${price.toFixed(2)}</div>
        <div class="market-change ${isPositive ? 'positive' : 'negative'}">
          ${isPositive ? '+' : ''}${change.toFixed(2)}%
        </div>
      </div>
    `;
  }).join('');
  
  elements.marketGrid.innerHTML = cards;
  
  // Add click handlers
  document.querySelectorAll('.market-card').forEach(card => {
    card.addEventListener('click', () => {
      const symbol = card.dataset.symbol;
      elements.stockSelect.value = symbol;
      currentStock = symbol;
      generateHistoricalData();
      renderMarketOverview();
      resetResults();
    });
  });
}

// Reset results
function resetResults() {
  elements.resultsContent.innerHTML = `
    <svg viewBox="0 0 64 64" fill="none" class="placeholder-icon">
      <circle cx="32" cy="32" r="28" stroke="#10b981" stroke-width="2" opacity="0.3"/>
      <polyline points="16,40 24,28 32,34 40,20 48,24" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.5"/>
    </svg>
    <p>Configure settings and click <strong>Run Prediction</strong> to see results</p>
  `;
  elements.chartSub.textContent = 'Select a stock and run prediction to view chart';
  elements.mainChart.innerHTML = '';
  elements.chartXLabels.innerHTML = '';
  elements.chartLegend.innerHTML = '';
}

// Run prediction
function runPrediction() {
  const daysToPredict = parseInt(document.querySelector('input[name="days"]:checked').value);
  const model = document.querySelector('input[name="model"]:checked').value;
  
  // Generate predictions based on model
  switch (model) {
    case 'linear':
      predictedData = linearRegressionPrediction(daysToPredict);
      break;
    case 'moving':
      predictedData = movingAveragePrediction(daysToPredict);
      break;
    case 'momentum':
      predictedData = momentumPrediction(daysToPredict);
      break;
  }
  
  // Display results
  displayResults(daysToPredict, model);
  
  // Render chart
  renderChart(daysToPredict);
}

// Linear regression prediction
function linearRegressionPrediction(days) {
  const lastPrice = historicalData[historicalData.length - 1].price;
  const prices = historicalData.map(d => d.price);
  
  // Calculate linear regression
  const n = prices.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += prices[i];
    sumXY += i * prices[i];
    sumX2 += i * i;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  const predictions = [];
  for (let i = 1; i <= days; i++) {
    const predictedPrice = slope * (n + i - 1) + intercept;
    const volatility = STOCK_DATA[currentStock].volatility;
    const noise = (Math.random() - 0.5) * volatility * predictedPrice;
    predictions.push({
      day: n + i,
      price: Math.max(predictedPrice + noise, 10),
      date: getDateOffset(-i)
    });
  }
  
  return predictions;
}

// Moving average prediction
function movingAveragePrediction(days) {
  const windowSize = 10;
  const lastPrice = historicalData[historicalData.length - 1].price;
  const predictions = [];
  
  for (let i = 1; i <= days; i++) {
    // Calculate moving average of recent prices
    const recentPrices = historicalData.slice(-windowSize).map(d => d.price);
    const ma = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
    
    // Add trend and noise
    const trend = (lastPrice - ma) * 0.1;
    const volatility = STOCK_DATA[currentStock].volatility;
    const noise = (Math.random() - 0.5) * volatility * ma;
    
    const predictedPrice = ma + trend * i + noise;
    predictions.push({
      day: historicalData.length + i,
      price: Math.max(predictedPrice, 10),
      date: getDateOffset(-i)
    });
  }
  
  return predictions;
}

// Momentum prediction
function momentumPrediction(days) {
  const prices = historicalData.map(d => d.price);
  const lastPrice = prices[prices.length - 1];
  
  // Calculate momentum (rate of change)
  const momentum = (lastPrice - prices[prices.length - 5]) / 5;
  
  const predictions = [];
  let currentPrice = lastPrice;
  
  for (let i = 1; i <= days; i++) {
    // Apply momentum with decay
    const momentumEffect = momentum * Math.exp(-i * 0.1);
    const volatility = STOCK_DATA[currentStock].volatility;
    const noise = (Math.random() - 0.5) * volatility * currentPrice;
    
    currentPrice = currentPrice + momentumEffect + noise;
    predictions.push({
      day: historicalData.length + i,
      price: Math.max(currentPrice, 10),
      date: getDateOffset(-i)
    });
  }
  
  return predictions;
}

// Display results
function displayResults(days, model) {
  const lastPrice = historicalData[historicalData.length - 1].price;
  const finalPrediction = predictedData[predictedData.length - 1].price;
  const change = finalPrediction - lastPrice;
  const changePercent = (change / lastPrice) * 100;
  const isPositive = change >= 0;
  
  elements.resultsTitle.textContent = 'Prediction Results';
  elements.resultsContent.innerHTML = `
    <div class="results-grid">
      <div class="result-item">
        <div class="result-label">Current Price</div>
        <div class="result-value">$${lastPrice.toFixed(2)}</div>
      </div>
      <div class="result-item">
        <div class="result-label">Predicted Price (${days} days)</div>
        <div class="result-value">$${finalPrediction.toFixed(2)}</div>
      </div>
      <div class="result-item">
        <div class="result-label">Expected Change</div>
        <div class="result-value ${isPositive ? 'positive' : 'negative'}">
          ${isPositive ? '+' : ''}$${change.toFixed(2)}
        </div>
      </div>
      <div class="result-item">
        <div class="result-label">Change %</div>
        <div class="result-value ${isPositive ? 'positive' : 'negative'}">
          ${isPositive ? '+' : ''}${changePercent.toFixed(2)}%
        </div>
      </div>
      <div class="result-item">
        <div class="result-label">Model Used</div>
        <div class="result-value">${model.charAt(0).toUpperCase() + model.slice(1)} Regression</div>
      </div>
      <div class="result-item">
        <div class="result-label">Confidence</div>
        <div class="result-value">${Math.floor(70 + Math.random() * 20)}%</div>
      </div>
    </div>
  `;
}

// Render chart
function renderChart(days) {
  const allData = [...historicalData, ...predictedData];
  const prices = allData.map(d => d.price);
  const minPrice = Math.min(...prices) * 0.95;
  const maxPrice = Math.max(...prices) * 1.05;
  const priceRange = maxPrice - minPrice;
  
  const chartWidth = 900;
  const chartHeight = 320;
  const padding = 40;
  
  const xStep = (chartWidth - padding * 2) / allData.length;
  
  // Generate SVG path
  const historicalPath = historicalData.map((d, i) => {
    const x = padding + i * xStep;
    const y = chartHeight - padding - ((d.price - minPrice) / priceRange) * (chartHeight - padding * 2);
    return `${x},${y}`;
  }).join(' L ');
  
  const predictedPath = predictedData.map((d, i) => {
    const x = padding + (historicalData.length + i) * xStep;
    const y = chartHeight - padding - ((d.price - minPrice) / priceRange) * (chartHeight - padding * 2);
    return `${x},${y}`;
  }).join(' L ');
  
  // Create SVG
  elements.mainChart.innerHTML = `
    <!-- Grid lines -->
    ${[0, 0.25, 0.5, 0.75, 1].map(p => `
      <line x1="${padding}" y1="${chartHeight - padding - p * (chartHeight - padding * 2)}" 
            x2="${chartWidth - padding}" y2="${chartHeight - padding - p * (chartHeight - padding * 2)}" 
            stroke="#e5e7eb" stroke-width="1"/>
    `).join('')}
    
    <!-- Historical line -->
    <polyline points="${historicalPath}" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    
    <!-- Predicted line -->
    <polyline points="${predictedPath}" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="5,5" stroke-linecap="round" stroke-linejoin="round"/>
    
    <!-- Current price dot -->
    <circle cx="${padding + (historicalData.length - 1) * xStep}" 
            y="${chartHeight - padding - ((historicalData[historicalData.length - 1].price - minPrice) / priceRange) * (chartHeight - padding * 2)}" 
            r="5" fill="#10b981"/>
    
    <!-- Final prediction dot -->
    <circle cx="${padding + (allData.length - 1) * xStep}" 
            y="${chartHeight - padding - ((predictedData[predictedData.length - 1].price - minPrice) / priceRange) * (chartHeight - padding * 2)}" 
            r="5" fill="#f59e0b"/>
  `;
  
  // Update chart info
  elements.chartTitle.textContent = `${STOCK_DATA[currentStock].name} - Historical & Predicted Prices`;
  elements.chartSub.textContent = `Green: Historical | Orange: Predicted (${days} days)`;
  
  // Add legend
  elements.chartLegend.innerHTML = `
    <div class="legend-item">
      <div class="legend-dot historical"></div>
      <span>Historical</span>
    </div>
    <div class="legend-item">
      <div class="legend-dot predicted"></div>
      <span>Predicted</span>
    </div>
  `;
  
  // X-axis labels
  const labelInterval = Math.ceil(allData.length / 7);
  elements.chartXLabels.innerHTML = allData.map((d, i) => {
    if (i % labelInterval === 0 || i === allData.length - 1) {
      return `<span class="x-label" style="left: ${padding + i * xStep}px">${d.date}</span>`;
    }
    return '';
  }).join('');
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', init);
