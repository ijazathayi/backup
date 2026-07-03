'use strict';

// Rainfall Prediction System - Meteorological Analysis

// DOM elements
const elements = {
  temperature: document.getElementById('temperature'),
  humidity: document.getElementById('humidity'),
  pressure: document.getElementById('pressure'),
  windSpeed: document.getElementById('windSpeed'),
  cloudCover: document.getElementById('cloudCover'),
  season: document.getElementById('season'),
  region: document.getElementById('region'),
  tempVal: document.getElementById('tempVal'),
  humVal: document.getElementById('humVal'),
  pressVal: document.getElementById('pressVal'),
  windVal: document.getElementById('windVal'),
  cloudVal: document.getElementById('cloudVal'),
  tempFill: document.getElementById('tempFill'),
  humFill: document.getElementById('humFill'),
  pressFill: document.getElementById('pressFill'),
  windFill: document.getElementById('windFill'),
  cloudFill: document.getElementById('cloudFill'),
  predictBtn: document.getElementById('predictBtn'),
  randomBtn: document.getElementById('randomBtn'),
  condTemp: document.getElementById('condTemp'),
  condHum: document.getElementById('condHum'),
  condPress: document.getElementById('condPress'),
  condWind: document.getElementById('condWind'),
  condCloud: document.getElementById('condCloud'),
  condRegion: document.getElementById('condRegion'),
  predPlaceholder: document.getElementById('predPlaceholder'),
  predResult: document.getElementById('predResult'),
  weatherIconBig: document.getElementById('weatherIconBig'),
  resultCategory: document.getElementById('resultCategory'),
  mmNumber: document.getElementById('mmNumber'),
  gaugeFill: document.getElementById('gaugeFill'),
  gaugePct: document.getElementById('gaugePct'),
  badgeIcon: document.getElementById('badgeIcon'),
  badgeText: document.getElementById('badgeText'),
  factorsList: document.getElementById('factorsList'),
  forecastPlaceholder: document.getElementById('forecastPlaceholder'),
  forecastChart: document.getElementById('forecastChart'),
  chartBars: document.getElementById('chartBars'),
  rainContainer: document.getElementById('rainContainer')
};

// Rainfall categories
const RAINFALL_CATEGORIES = {
  none: { min: 0, max: 0.1, icon: '☀️', label: 'No Rain', color: '#f59e0b' },
  light: { min: 0.1, max: 2.5, icon: '🌤️', label: 'Light Rain', color: '#3b82f6' },
  moderate: { min: 2.5, max: 10, icon: '🌧️', label: 'Moderate Rain', color: '#6366f1' },
  heavy: { min: 10, max: 50, icon: '⛈️', label: 'Heavy Rain', color: '#8b5cf6' },
  very_heavy: { min: 50, max: Infinity, icon: '🌊', label: 'Very Heavy Rain', color: '#dc2626' }
};

// Region modifiers
const REGION_MODIFIERS = {
  coastal: { humidity: 1.2, rainfall: 1.3 },
  mountain: { humidity: 0.9, rainfall: 1.4 },
  desert: { humidity: 0.5, rainfall: 0.3 },
  plain: { humidity: 1.0, rainfall: 1.0 },
  tropical: { humidity: 1.4, rainfall: 1.8 }
};

// Season modifiers
const SEASON_MODIFIERS = {
  spring: { rainfall: 1.1 },
  summer: { rainfall: 0.8 },
  autumn: { rainfall: 1.3 },
  winter: { rainfall: 1.0 }
};

// Initialize app
function init() {
  setupSliders();
  setupButtons();
  createRainEffect();
  updateConditions();
}

// Setup sliders
function setupSliders() {
  const sliders = [
    { input: elements.temperature, display: elements.tempVal, fill: elements.tempFill, unit: '°C' },
    { input: elements.humidity, display: elements.humVal, fill: elements.humFill, unit: '%' },
    { input: elements.pressure, display: elements.pressVal, fill: elements.pressFill, unit: ' hPa' },
    { input: elements.windSpeed, display: elements.windVal, fill: elements.windFill, unit: ' km/h' },
    { input: elements.cloudCover, display: elements.cloudVal, fill: elements.cloudFill, unit: '%' }
  ];
  
  sliders.forEach(({ input, display, fill, unit }) => {
    input.addEventListener('input', () => {
      display.textContent = input.value + unit;
      const percent = ((input.value - input.min) / (input.max - input.min)) * 100;
      fill.style.width = percent + '%';
      updateConditions();
    });
  });
}

// Setup buttons
function setupButtons() {
  elements.predictBtn.addEventListener('click', predict);
  elements.randomBtn.addEventListener('click', randomWeather);
}

// Create rain effect
function createRainEffect() {
  const container = elements.rainContainer;
  
  function createDrop() {
    const drop = document.createElement('div');
    drop.className = 'rain-drop';
    drop.style.left = Math.random() * 100 + '%';
    drop.style.animationDuration = (Math.random() * 1 + 0.5) + 's';
    drop.style.opacity = Math.random() * 0.5 + 0.2;
    container.appendChild(drop);
    
    setTimeout(() => drop.remove(), 2000);
  }
  
  setInterval(createDrop, 100);
}

// Update conditions display
function updateConditions() {
  elements.condTemp.textContent = elements.temperature.value + '°C';
  elements.condHum.textContent = elements.humidity.value + '%';
  elements.condPress.textContent = elements.pressure.value + ' hPa';
  elements.condWind.textContent = elements.windSpeed.value + ' km/h';
  elements.condCloud.textContent = elements.cloudCover.value + '%';
  
  const regionSelect = elements.region;
  elements.condRegion.textContent = regionSelect.options[regionSelect.selectedIndex].text.split(' ')[1];
}

// Random weather
function randomWeather() {
  elements.temperature.value = Math.floor(Math.random() * 40 - 5);
  elements.humidity.value = Math.floor(Math.random() * 80 + 20);
  elements.pressure.value = Math.floor(Math.random() * 80 + 970);
  elements.windSpeed.value = Math.floor(Math.random() * 60);
  elements.cloudCover.value = Math.floor(Math.random() * 100);
  
  // Trigger input events to update displays
  [elements.temperature, elements.humidity, elements.pressure, elements.windSpeed, elements.cloudCover].forEach(el => {
    el.dispatchEvent(new Event('input'));
  });
  
  // Random season and region
  const seasons = ['spring', 'summer', 'autumn', 'winter'];
  const regions = ['coastal', 'mountain', 'desert', 'plain', 'tropical'];
  elements.season.value = seasons[Math.floor(Math.random() * seasons.length)];
  elements.region.value = regions[Math.floor(Math.random() * regions.length)];
  
  updateConditions();
}

// Predict rainfall
function predict() {
  const temp = parseFloat(elements.temperature.value);
  const humidity = parseFloat(elements.humidity.value);
  const pressure = parseFloat(elements.pressure.value);
  const wind = parseFloat(elements.windSpeed.value);
  const cloud = parseFloat(elements.cloudCover.value);
  const season = elements.season.value;
  const region = elements.region.value;
  
  // Calculate base rainfall probability
  let probability = 0;
  
  // Humidity factor (higher humidity = higher chance)
  probability += (humidity / 100) * 40;
  
  // Cloud cover factor (more clouds = higher chance)
  probability += (cloud / 100) * 30;
  
  // Pressure factor (lower pressure = higher chance)
  if (pressure < 1000) {
    probability += (1000 - pressure) / 50 * 15;
  } else if (pressure > 1020) {
    probability -= (pressure - 1020) / 30 * 10;
  }
  
  // Temperature factor (moderate temps better for rain)
  if (temp > 0 && temp < 30) {
    probability += 10;
  } else if (temp > 35) {
    probability -= 15;
  }
  
  // Wind factor (moderate wind helps)
  if (wind > 5 && wind < 30) {
    probability += 5;
  }
  
  // Apply region modifiers
  const regionMod = REGION_MODIFIERS[region];
  probability *= regionMod.rainfall;
  
  // Apply season modifiers
  const seasonMod = SEASON_MODIFIERS[season];
  probability *= seasonMod.rainfall;
  
  // Clamp probability
  probability = Math.max(0, Math.min(100, probability));
  
  // Calculate rainfall amount based on probability
  let rainfallAmount = 0;
  if (probability > 20) {
    rainfallAmount = (probability - 20) * 0.8;
    rainfallAmount *= regionMod.rainfall;
    rainfallAmount *= (humidity / 100);
    rainfallAmount *= (cloud / 100);
  }
  
  // Determine category
  let category = 'none';
  for (const [key, cat] of Object.entries(RAINFALL_CATEGORIES)) {
    if (rainfallAmount >= cat.min && rainfallAmount < cat.max) {
      category = key;
      break;
    }
  }
  
  // Display results
  displayResults(rainfallAmount, probability, category);
  
  // Generate forecast
  generateForecast(rainfallAmount, probability, season, region);
}

// Display results
function displayResults(amount, probability, category) {
  const cat = RAINFALL_CATEGORIES[category];
  
  elements.predPlaceholder.style.display = 'none';
  elements.predResult.classList.remove('hidden');
  
  elements.weatherIconBig.textContent = cat.icon;
  elements.resultCategory.textContent = cat.label;
  elements.mmNumber.textContent = amount.toFixed(1);
  
  // Animate gauge
  const circumference = 314;
  const offset = circumference - (probability / 100) * circumference;
  elements.gaugeFill.style.strokeDashoffset = offset;
  elements.gaugePct.textContent = Math.round(probability) + '%';
  
  // Update badge
  elements.badgeIcon.textContent = cat.icon;
  elements.badgeText.textContent = cat.label;
  elements.badgeText.style.color = cat.color;
  
  // Display key factors
  displayKeyFactors(amount, probability, category);
}

// Display key factors
function displayKeyFactors(amount, probability, category) {
  const factors = [];
  
  const humidity = parseFloat(elements.humidity.value);
  const cloud = parseFloat(elements.cloudCover.value);
  const pressure = parseFloat(elements.pressure.value);
  const temp = parseFloat(elements.temperature.value);
  
  if (humidity > 70) {
    factors.push({ icon: '💧', text: 'High humidity increases rain chance', impact: 'positive' });
  } else if (humidity < 40) {
    factors.push({ icon: '💧', text: 'Low humidity reduces rain chance', impact: 'negative' });
  }
  
  if (cloud > 70) {
    factors.push({ icon: '☁️', text: 'Heavy cloud cover indicates rain', impact: 'positive' });
  } else if (cloud < 30) {
    factors.push({ icon: '☁️', text: 'Low cloud cover reduces rain chance', impact: 'negative' });
  }
  
  if (pressure < 1000) {
    factors.push({ icon: '🔵', text: 'Low pressure system approaching', impact: 'positive' });
  } else if (pressure > 1020) {
    factors.push({ icon: '🔵', text: 'High pressure suppresses rain', impact: 'negative' });
  }
  
  if (temp > 35) {
    factors.push({ icon: '🌡️', text: 'High temperature may evaporate moisture', impact: 'negative' });
  }
  
  const region = elements.region.value;
  if (region === 'coastal' || region === 'tropical') {
    factors.push({ icon: '🌍', text: 'Region prone to rainfall', impact: 'positive' });
  } else if (region === 'desert') {
    factors.push({ icon: '🌍', text: 'Arid region reduces rain chance', impact: 'negative' });
  }
  
  elements.factorsList.innerHTML = factors.map(f => `
    <div class="factor-item ${f.impact}">
      <span class="factor-icon">${f.icon}</span>
      <span class="factor-text">${f.text}</span>
    </div>
  `).join('');
}

// Generate 7-day forecast
function generateForecast(currentAmount, probability, season, region) {
  elements.forecastPlaceholder.style.display = 'none';
  elements.forecastChart.classList.remove('hidden');
  
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const forecast = [];
  
  for (let i = 0; i < 7; i++) {
    // Add some randomness to the forecast
    const variation = (Math.random() - 0.5) * 0.4;
    const dayProbability = Math.max(0, Math.min(100, probability + variation * 100));
    
    let dayAmount = 0;
    if (dayProbability > 25) {
      dayAmount = (dayProbability - 25) * 0.6;
      dayAmount *= REGION_MODIFIERS[region].rainfall;
    }
    
    // Determine category
    let dayCategory = 'none';
    for (const [key, cat] of Object.entries(RAINFALL_CATEGORIES)) {
      if (dayAmount >= cat.min && dayAmount < cat.max) {
        dayCategory = key;
        break;
      }
    }
    
    forecast.push({ day: days[i], amount: dayAmount, category: dayCategory });
  }
  
  // Render forecast chart
  elements.chartBars.innerHTML = forecast.map((f, i) => {
    const cat = RAINFALL_CATEGORIES[f.category];
    const height = Math.min((f.amount / 50) * 100, 100);
    return `
      <div class="forecast-bar" style="animation-delay: ${i * 0.1}s">
        <div class="bar-fill ${f.category}" style="height: ${height}%; background: ${cat.color}"></div>
        <div class="bar-label">${f.day}</div>
        <div class="bar-amount">${f.amount > 0 ? f.amount.toFixed(1) + 'mm' : '0mm'}</div>
      </div>
    `;
  }).join('');
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', init);
