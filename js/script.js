// =============================================
// script.js — To-Do List Life Dashboard
// =============================================


// =============================================
// CLOCK
// =============================================

// Reads the current time and updates the #clock element with HH:MM:SS format
function updateClock() {
  const now     = new Date();
  const hours   = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const clockEl = document.querySelector('#clock');
  clockEl.textContent = `${hours}:${minutes}:${seconds}`;
}

// Starts the live clock — runs immediately then updates every 1 second
function startClock() {
  updateClock();
  setInterval(updateClock, 1000);
}


// =============================================
// GREETING
// =============================================

// Determines the greeting based on the current hour and updates #greeting-text
// 05:00–11:59 → Good Morning | 12:00–17:59 → Good Afternoon | 18:00–04:59 → Good Evening
function updateGreeting() {
  const hour = new Date().getHours();

  let greeting;

  if (hour >= 5 && hour < 12) {
    greeting = 'Good Morning!';
  } else if (hour >= 12 && hour < 18) {
    greeting = 'Good Afternoon!';
  } else {
    greeting = 'Good Evening!';
  }

  const greetingEl = document.querySelector('#greeting-text');
  greetingEl.textContent = greeting;
}


// =============================================
// DATE
// =============================================

// Reads the current date and updates the #date element
// Format: Thursday, July 16, 2026
function updateDate() {
  const now = new Date();

  const formatted = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });

  const dateEl = document.querySelector('#date');
  dateEl.textContent = formatted;
}


// =============================================
// FOCUS TIMER
// =============================================

// Timer state
const TIMER_DURATION = 25 * 60; // 25 minutes in seconds
let remainingSeconds = TIMER_DURATION;
let intervalId       = null;
let isRunning        = false;

// Converts remainingSeconds to MM:SS and writes it to #timer-display
function renderTimer() {
  const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const seconds = String(remainingSeconds % 60).padStart(2, '0');

  const timerDisplay = document.querySelector('#timer-display');
  timerDisplay.textContent = `${minutes}:${seconds}`;
}

// Updates the disabled state of Start, Stop, and Reset buttons
function updateTimerButtons() {
  const startBtn = document.querySelector('#start-btn');
  const stopBtn  = document.querySelector('#stop-btn');
  const resetBtn = document.querySelector('#reset-btn');

  startBtn.disabled = isRunning;
  stopBtn.disabled  = !isRunning;
  resetBtn.disabled = false;
}

// Starts the countdown — guards against multiple intervals if called repeatedly
function startTimer() {
  if (isRunning) return;

  isRunning  = true;
  updateTimerButtons();

  intervalId = setInterval(function () {
    remainingSeconds--;
    renderTimer();

    // Stop automatically when the timer reaches zero
    if (remainingSeconds <= 0) {
      stopTimer();
    }
  }, 1000);
}

// Pauses the countdown without resetting the remaining time
function stopTimer() {
  clearInterval(intervalId);
  intervalId = null;
  isRunning  = false;
  updateTimerButtons();
}

// Resets the timer back to 25:00 and stops any active countdown
function resetTimer() {
  clearInterval(intervalId);
  intervalId       = null;
  isRunning        = false;
  remainingSeconds = TIMER_DURATION;
  renderTimer();
  updateTimerButtons();
}

// Wires up timer buttons and sets the initial display
function initTimer() {
  const startBtn = document.querySelector('#start-btn');
  const stopBtn  = document.querySelector('#stop-btn');
  const resetBtn = document.querySelector('#reset-btn');

  startBtn.addEventListener('click', startTimer);
  stopBtn.addEventListener('click', stopTimer);
  resetBtn.addEventListener('click', resetTimer);

  // Show 25:00 on load and set correct initial button states
  renderTimer();
  updateTimerButtons();
}


// =============================================
// INIT — runs when the page is fully loaded
// =============================================

// Entry point: initialises all features in order
function init() {
  startClock();
  updateDate();
  updateGreeting();
  initTimer();
}

document.addEventListener('DOMContentLoaded', init);
