// script.js
// ─────────────── DOM Elements ───────────────
const cultivateBtn = document.getElementById('cultivateBtn');
const meditateBtn = document.getElementById('meditateBtn');
const realmNameEl = document.getElementById('realmName');
const qiValueEl = document.getElementById('qiValue');
const progressFillEl = document.getElementById('progressFill');
const nextRealmInfoEl = document.getElementById('nextRealmInfo');
const meditationTimerDiv = document.getElementById('meditationTimer');
const timerTextEl = document.getElementById('timerText');
const breakthroughOverlay = document.getElementById('breakthroughOverlay');
const breakthroughMessageEl = document.getElementById('breakthroughMessage');

// ─────────────── Game State ───────────────
// Realms: thresholds for Qi
const realms = [
  { name: 'Mortal Scholar', min: 0, max: 99 },
  { name: 'Book Apprentice', min: 100, max: 299 },
  { name: 'Knowledge Gatherer', min: 300, max: 599 },
  { name: 'Spirit Reader', min: 600, max: Infinity },
];

// Current state (loaded from localStorage or fresh)
let currentQi = 0;
let currentRealmIndex = 0;
let isMeditating = false;

// ─────────────── Helper Functions ───────────────
function getCurrentRealm() {
  return realms[currentRealmIndex];
}

function getNextRealm() {
  return realms[currentRealmIndex + 1] || null;
}

// Calculate realm index based on Qi (for loading from save)
function calculateRealmIndex(qi) {
  for (let i = realms.length - 1; i >= 0; i--) {
    if (qi >= realms[i].min) return i;
  }
  return 0;
}

// Update UI to reflect current state
function updateUI() {
  const realm = getCurrentRealm();
  const nextRealm = getNextRealm();

  // Realm name
  realmNameEl.textContent = realm.name;
  // Qi display
  qiValueEl.textContent = currentQi;

  // Progress bar: percentage within current realm
  let progressPercent = 0;
  if (realm.max !== Infinity) {
    const range = realm.max - realm.min + 1;
    const progress = currentQi - realm.min;
    progressPercent = Math.min(100, Math.floor((progress / range) * 100));
  } else {
    // At max realm, show full bar
    progressPercent = 100;
  }
  progressFillEl.style.width = progressPercent + '%';

  // Next realm info
  if (nextRealm) {
    const needed = nextRealm.min - currentQi;
    nextRealmInfoEl.textContent = `Next: ${nextRealm.name} (${needed} Qi needed)`;
  } else {
    nextRealmInfoEl.textContent = 'Maximum realm achieved!';
  }
}

// Save progress to localStorage
function saveProgress() {
  const data = {
    qi: currentQi,
    realmIndex: currentRealmIndex,
  };
  localStorage.setItem('knowledgeCultivation', JSON.stringify(data));
}

// Load progress from localStorage
function loadProgress() {
  const saved = localStorage.getItem('knowledgeCultivation');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      currentQi = data.qi || 0;
      // recalc realm index from Qi to be safe
      currentRealmIndex = calculateRealmIndex(currentQi);
      updateUI();
    } catch (e) {
      console.warn('Failed to load save data');
    }
  }
}

// Check for realm breakthrough
function checkBreakthrough() {
  const nextRealm = getNextRealm();
  if (nextRealm && currentQi >= nextRealm.min) {
    // Advance to next realm
    currentRealmIndex++;
    // Show breakthrough animation
    const newRealm = getCurrentRealm();
    breakthroughMessageEl.textContent = `Realm Breakthrough!\n${newRealm.name}`;
    breakthroughOverlay.classList.add('active');
    setTimeout(() => {
      breakthroughOverlay.classList.remove('active');
    }, 2000);
    updateUI();
    saveProgress();
  }
}

// ─────────────── Core Actions ───────────────
function cultivate() {
  if (isMeditating) return; // cannot cultivate while meditating
  // Gain Qi (1-3 random, mainly 2)
  const gain = Math.floor(Math.random() * 3) + 1;
  currentQi += gain;
  updateUI();
  checkBreakthrough();
  saveProgress();
  // Add subtle button animation feedback (already via active state)
}

function startMeditation() {
  if (isMeditating) return;
  isMeditating = true;
  meditateBtn.disabled = true;
  cultivateBtn.disabled = true;
  meditationTimerDiv.style.display = 'flex';

  let timeLeft = 10;
  timerTextEl.textContent = timeLeft;

  const interval = setInterval(() => {
    timeLeft--;
    timerTextEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(interval);
      finishMeditation();
    }
  }, 1000);
}

function finishMeditation() {
  // Grant bonus Qi (20-30)
  const bonus = Math.floor(Math.random() * 11) + 20;
  currentQi += bonus;
  updateUI();
  checkBreakthrough();
  saveProgress();

  // Reset UI
  meditationTimerDiv.style.display = 'none';
  isMeditating = false;
  meditateBtn.disabled = false;
  cultivateBtn.disabled = false;

  // Show a small alert (or we could use overlay)
  alert(`Meditation complete! You absorbed ${bonus} Qi.`);
}

// ─────────────── Event Listeners ───────────────
cultivateBtn.addEventListener('click', cultivate);
meditateBtn.addEventListener('click', startMeditation);

// ─────────────── Initialization ───────────────
loadProgress();
updateUI();
