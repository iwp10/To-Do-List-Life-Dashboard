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
// INIT — runs when the page is fully loaded
// =============================================

// Entry point: initialises all features in order
function init() {
  startClock();
}

document.addEventListener('DOMContentLoaded', init);
