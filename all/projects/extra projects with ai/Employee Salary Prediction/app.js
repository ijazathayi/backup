'use strict';

// Employee Salary Prediction - Linear Regression Model Simulation

// Sample profiles
const PROFILES = {
  junior: {
    experience: 2,
    education: 'bachelor',
    role: 'junior',
    skills: 45,
    location: 'midcity',
    industry: 'tech'
  },
  senior: {
    experience: 8,
    education: 'master',
    role: 'senior',
    skills: 75,
    location: 'largecity',
    industry: 'tech'
  },
  manager: {
    experience: 15,
    education: 'master',
    role: 'manager',
    skills: 85,
    location: 'metro',
    industry: 'finance'
  }
};

// Base salary values by role (in thousands)
const ROLE_BASE = {
  junior: 45,
  senior: 85,
  manager: 120,
  director: 160,
  vp: 220,
  clevel: 300
};

// Education multipliers
const EDUCATION_MULTIPLIER = {
  highschool: 0.8,
  bachelor: 1.0,
  master: 1.25,
  phd: 1.5
};

// Location multipliers
const LOCATION_MULTIPLIER = {
  rural: 0.7,
  smallcity: 0.85,
  midcity: 1.0,
  largecity: 1.2,
  metro: 1.4
};

// Industry multipliers
const INDUSTRY_MULTIPLIER = {
  retail: 0.8,
  education: 0.85,
  manufacturing: 0.9,
  healthcare: 1.0,
  finance: 1.3,
  tech: 1.4
};

// DOM elements
const elements = {
  experience: document.getElementById('experience'),
  experienceNum: document.getElementById('experienceNum'),
  expBadge: document.getElementById('expBadge'),
  education: document.getElementById('education'),
  role: document.getElementById('role'),
  skills: document.getElementById('skills'),
  skillsNum: document.getElementById('skillsNum'),
  skillsBadge: document.getElementById('skillsBadge'),
  location: document.getElementById('location'),
  industry: document.getElementById('industry'),
  salaryForm: document.getElementById('salaryForm'),
  predictBtn: document.getElementById('predictBtn'),
  profileBtns: document.querySelectorAll('.profile-btn'),
  placeholder: document.getElementById('placeholder'),
  resultsContent: document.getElementById('resultsContent'),
  salaryAmount: document.getElementById('salaryAmount'),
  monthlySalary: document.getElementById('monthlySalary'),
  rangeMin: document.getElementById('rangeMin'),
  rangeMax: document.getElementById('rangeMax'),
  rangeFill: document.getElementById('rangeFill'),
  rangeMarker: document.getElementById('rangeMarker'),
  yourBar: document.getElementById('yourBar'),
  yourBarValue: document.getElementById('yourBarValue'),
  avgBar: document.getElementById('avgBar'),
  avgBarValue: document.getElementById('avgBarValue'),
  compDelta: document.getElementById('compDelta'),
  factorsChart: document.getElementById('factorsChart'),
  confidenceText: document.getElementById('confidenceText')
};

// Initialize app
function init() {
  setupSliders();
  setupProfileButtons();
  setupForm();
}

// Setup slider synchronization
function setupSliders() {
  // Experience slider
  elements.experience.addEventListener('input', () => {
    elements.experienceNum.value = elements.experience.value;
    elements.expBadge.textContent = `${elements.experience.value} yrs`;
  });
  
  elements.experienceNum.addEventListener('input', () => {
    let val = parseInt(elements.experienceNum.value) || 0;
    val = Math.max(0, Math.min(40, val));
    elements.experience.value = val;
    elements.expBadge.textContent = `${val} yrs`;
  });
  
  // Skills slider
  elements.skills.addEventListener('input', () => {
    elements.skillsNum.value = elements.skills.value;
    elements.skillsBadge.textContent = `${elements.skills.value} / 100`;
  });
  
  elements.skillsNum.addEventListener('input', () => {
    let val = parseInt(elements.skillsNum.value) || 0;
    val = Math.max(0, Math.min(100, val));
    elements.skills.value = val;
    elements.skillsBadge.textContent = `${val} / 100`;
  });
}

// Setup profile buttons
function setupProfileButtons() {
  elements.profileBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const profile = PROFILES[btn.dataset.profile];
      if (profile) {
        loadProfile(profile);
      }
    });
  });
}

// Load profile data
function loadProfile(profile) {
  elements.experience.value = profile.experience;
  elements.experienceNum.value = profile.experience;
  elements.expBadge.textContent = `${profile.experience} yrs`;
  
  elements.education.value = profile.education;
  elements.role.value = profile.role;
  
  elements.skills.value = profile.skills;
  elements.skillsNum.value = profile.skills;
  elements.skillsBadge.textContent = `${profile.skills} / 100`;
  
  elements.location.value = profile.location;
  elements.industry.value = profile.industry;
}

// Setup form submission
function setupForm() {
  elements.salaryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    predictSalary();
  });
}

// Calculate predicted salary
function calculateSalary() {
  const experience = parseInt(elements.experience.value);
  const education = elements.education.value;
  const role = elements.role.value;
  const skills = parseInt(elements.skills.value);
  const location = elements.location.value;
  const industry = elements.industry.value;
  
  // Base salary from role
  let baseSalary = ROLE_BASE[role];
  
  // Experience bonus (diminishing returns)
  const experienceBonus = Math.log(experience + 1) * 15;
  
  // Skills bonus
  const skillsBonus = (skills / 100) * 20;
  
  // Apply multipliers
  const educationMult = EDUCATION_MULTIPLIER[education];
  const locationMult = LOCATION_MULTIPLIER[location];
  const industryMult = INDUSTRY_MULTIPLIER[industry];
  
  // Calculate final salary (in thousands)
  const predictedSalary = (baseSalary + experienceBonus + skillsBonus) * 
                          educationMult * locationMult * industryMult;
  
  // Add some randomness for realism
  const randomFactor = 0.95 + Math.random() * 0.1;
  const finalSalary = predictedSalary * randomFactor;
  
  // Calculate range (±15%)
  const minSalary = finalSalary * 0.85;
  const maxSalary = finalSalary * 1.15;
  
  // Calculate industry average
  const industryAvg = calculateIndustryAverage(industry, experience);
  
  return {
    salary: finalSalary,
    min: minSalary,
    max: maxSalary,
    industryAvg: industryAvg,
    factors: {
      base: baseSalary,
      experience: experienceBonus,
      skills: skillsBonus,
      education: educationMult,
      location: locationMult,
      industry: industryMult
    }
  };
}

// Calculate industry average
function calculateIndustryAverage(industry, experience) {
  const baseAvg = {
    retail: 35,
    education: 45,
    manufacturing: 55,
    healthcare: 65,
    finance: 90,
    tech: 95
  };
  
  const expBonus = Math.log(experience + 1) * 10;
  return (baseAvg[industry] + expBonus) * LOCATION_MULTIPLIER.midcity;
}

// Predict salary and display results
function predictSalary() {
  // Show loading state
  elements.predictBtn.classList.add('loading');
  elements.predictBtn.disabled = true;
  
  setTimeout(() => {
    const result = calculateSalary();
    
    // Hide placeholder, show results
    elements.placeholder.style.display = 'none';
    elements.resultsContent.style.display = 'block';
    
    // Update salary display with animation
    animateValue(elements.salaryAmount, 0, result.salary * 1000, 1000, '$');
    
    // Update monthly salary
    const monthly = Math.round(result.salary * 1000 / 12);
    elements.monthlySalary.textContent = `$${monthly.toLocaleString()} / month`;
    
    // Update range
    elements.rangeMin.textContent = `$${Math.round(result.min * 1000).toLocaleString()}`;
    elements.rangeMax.textContent = `$${Math.round(result.max * 1000).toLocaleString()}`;
    
    // Update range bar
    const rangePercent = ((result.salary - result.min) / (result.max - result.min)) * 100;
    elements.rangeFill.style.width = `${rangePercent}%`;
    elements.rangeMarker.style.left = `${rangePercent}%`;
    
    // Update comparison
    updateComparison(result.salary, result.industryAvg);
    
    // Update factors chart
    renderFactorsChart(result.factors);
    
    // Update confidence
    const confidence = 85 + Math.floor(Math.random() * 10);
    elements.confidenceText.textContent = `${confidence}% Confidence`;
    
    // Remove loading state
    elements.predictBtn.classList.remove('loading');
    elements.predictBtn.disabled = false;
    
  }, 800);
}

// Update comparison section
function updateComparison(yourSalary, industryAvg) {
  const yourSalaryAnnual = yourSalary * 1000;
  const avgSalaryAnnual = industryAvg * 1000;
  
  elements.yourBarValue.textContent = `$${Math.round(yourSalaryAnnual).toLocaleString()}`;
  elements.avgBarValue.textContent = `$${Math.round(avgSalaryAnnual).toLocaleString()}`;
  
  const maxVal = Math.max(yourSalaryAnnual, avgSalaryAnnual);
  const yourPercent = (yourSalaryAnnual / maxVal) * 100;
  const avgPercent = (avgSalaryAnnual / maxVal) * 100;
  
  elements.yourBar.style.width = `${yourPercent}%`;
  elements.avgBar.style.width = `${avgPercent}%`;
  
  const delta = ((yourSalary - industryAvg) / industryAvg * 100).toFixed(1);
  const isAbove = yourSalary > industryAvg;
  
  elements.compDelta.innerHTML = `
    <span class="delta-icon">${isAbove ? '↑' : '↓'}</span>
    <span class="delta-value">${isAbove ? '+' : ''}${delta}%</span>
    <span class="delta-label">${isAbove ? 'above avg' : 'below avg'}</span>
  `;
  elements.compDelta.className = `comp-delta ${isAbove ? 'positive' : 'negative'}`;
}

// Render factors chart
function renderFactorsChart(factors) {
  const factorData = [
    { name: 'Base Role', value: factors.base, max: 300 },
    { name: 'Experience', value: factors.experience, max: 50 },
    { name: 'Skills', value: factors.skills, max: 30 },
    { name: 'Education', value: (factors.education - 1) * 100, max: 50 },
    { name: 'Location', value: (factors.location - 1) * 100, max: 50 },
    { name: 'Industry', value: (factors.industry - 1) * 100, max: 50 }
  ];
  
  elements.factorsChart.innerHTML = factorData.map(factor => {
    const percent = Math.min((factor.value / factor.max) * 100, 100);
    return `
      <div class="factor-item">
        <div class="factor-name">${factor.name}</div>
        <div class="factor-bar-wrapper">
          <div class="factor-bar" style="width: ${percent}%"></div>
        </div>
        <div class="factor-value">${factor.value.toFixed(1)}</div>
      </div>
    `;
  }).join('');
}

// Animate number value
function animateValue(element, start, end, duration, prefix = '') {
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (end - start) * eased;
    
    element.textContent = prefix + Math.round(current).toLocaleString();
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', init);
