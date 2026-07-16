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
// TODO LIST
// =============================================

// In-memory task array — each task: { id, text, completed }
let tasks = [];

// Saves the current tasks array to Local Storage as a JSON string
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Loads tasks from Local Storage and returns a valid array.
// Returns an empty array if no data exists or if the data is corrupted.
function loadTasks() {
  try {
    const stored = localStorage.getItem('tasks');
    const parsed = JSON.parse(stored);
    // Confirm the parsed value is actually an array before using it
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

// Builds and renders the full task list into #task-list
function renderTasks() {
  const taskList = document.querySelector('#task-list');
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = 'No tasks yet. Add one above!';
    taskList.appendChild(empty);
    return;
  }

  tasks.forEach(function (task) {
    // --- List item ---
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' done' : '');
    li.dataset.id = task.id;

    // --- Checkbox ---
    const checkbox = document.createElement('input');
    checkbox.type      = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked   = task.completed;
    checkbox.setAttribute('aria-label', 'Mark task as completed');
    checkbox.addEventListener('change', function () {
      toggleTask(task.id);
    });

    // --- Label ---
    const label = document.createElement('span');
    label.className   = 'task-label';
    label.textContent = task.text;

    // --- Action buttons wrapper ---
    const actions = document.createElement('div');
    actions.className = 'task-actions';

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className   = 'btn btn-ghost';
    editBtn.textContent = 'Edit';
    editBtn.setAttribute('aria-label', 'Edit task');
    editBtn.addEventListener('click', function () {
      editTask(task.id, li, label);
    });

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className   = 'btn btn-ghost';
    deleteBtn.textContent = 'Delete';
    deleteBtn.setAttribute('aria-label', 'Delete task');
    deleteBtn.style.color = 'var(--color-danger)';
    deleteBtn.addEventListener('click', function () {
      deleteTask(task.id);
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(actions);
    taskList.appendChild(li);
  });
}

// Reads the input, creates a new task object, and re-renders the list
function addTask() {
  const taskInput = document.querySelector('#task-input');
  const text      = taskInput.value.trim();

  // Ignore empty or whitespace-only input
  if (text === '') return;

  const newTask = {
    id:        Date.now(),
    text:      text,
    completed: false,
  };

  tasks.push(newTask);
  taskInput.value = '';
  saveTasks();
  renderTasks();
}

// Replaces the task label with an inline input field for editing
function editTask(id, li, label) {
  // Prevent opening a second edit field if one is already open
  if (li.querySelector('.edit-input')) return;

  const task = tasks.find(function (t) { return t.id === id; });
  if (!task) return;

  // Create inline edit input
  const editInput = document.createElement('input');
  editInput.type      = 'text';
  editInput.value     = task.text;
  editInput.className = 'task-input edit-input';
  editInput.setAttribute('aria-label', 'Edit task text');

  // Replace the label with the edit input
  li.replaceChild(editInput, label);
  editInput.focus();
  editInput.select();

  // Saves the edited text and restores the label
  function saveEdit() {
    const newText = editInput.value.trim();

    if (newText !== '' && newText !== task.text) {
      task.text = newText;
    }

    saveTasks();
    renderTasks();
  }

  // Save on Enter key
  editInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') renderTasks(); // cancel edit
  });

  // Save on blur (clicking away)
  editInput.addEventListener('blur', saveEdit);
}

// Toggles the completed state of a task by its id
function toggleTask(id) {
  const task = tasks.find(function (t) { return t.id === id; });
  if (!task) return;

  task.completed = !task.completed;
  saveTasks();
  renderTasks();
}

// Removes a task from the array by its id and re-renders the list
function deleteTask(id) {
  tasks = tasks.filter(function (t) { return t.id !== id; });
  saveTasks();
  renderTasks();
}

// Wires up the Add button and Enter key for the task input
function initTodo() {
  const addBtn    = document.querySelector('#add-task-btn');
  const taskInput = document.querySelector('#task-input');

  addBtn.addEventListener('click', addTask);

  // Allow pressing Enter to add a task
  taskInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') addTask();
  });

  // Load saved tasks from Local Storage before first render
  tasks = loadTasks();
  renderTasks();
}


// =============================================
// QUICK LINKS
// =============================================

// In-memory links array — each link: { id, name, url }
let links = [];

// Ensures a URL starts with http:// or https://, prepending https:// if not
function normaliseUrl(url) {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return 'https://' + url;
}

// Builds and renders all link chips into #links-container
function renderLinks() {
  const container = document.querySelector('#links-container');
  container.innerHTML = '';

  if (links.length === 0) {
    const empty = document.createElement('p');
    empty.className   = 'empty-state';
    empty.textContent = 'No links saved yet. Add one above!';
    container.appendChild(empty);
    return;
  }

  links.forEach(function (link) {
    // --- Chip wrapper ---
    const chip = document.createElement('div');
    chip.className = 'link-chip';

    // --- Link name button — opens the URL in a new tab ---
    const nameBtn = document.createElement('button');
    nameBtn.className   = 'link-chip-name';
    nameBtn.textContent = link.name;
    nameBtn.setAttribute('aria-label', 'Open ' + link.name);
    nameBtn.addEventListener('click', function () {
      window.open(link.url, '_blank');
    });

    // --- Delete button ---
    const deleteBtn = document.createElement('button');
    deleteBtn.className   = 'link-chip-delete';
    deleteBtn.textContent = '✕';
    deleteBtn.setAttribute('aria-label', 'Delete ' + link.name);
    deleteBtn.addEventListener('click', function () {
      deleteLink(link.id);
    });

    chip.appendChild(nameBtn);
    chip.appendChild(deleteBtn);
    container.appendChild(chip);
  });
}

// Reads the name and URL inputs, validates them, and adds a new link
function addLink() {
  const nameInput = document.querySelector('#link-name');
  const urlInput  = document.querySelector('#link-url');

  const name = nameInput.value.trim();
  const url  = urlInput.value.trim();

  // Ignore empty or whitespace-only input in either field
  if (name === '' || url === '') return;

  const newLink = {
    id:   Date.now(),
    name: name,
    url:  normaliseUrl(url),
  };

  links.push(newLink);

  // Clear both inputs after a successful add
  nameInput.value = '';
  urlInput.value  = '';

  renderLinks();
}

// Removes a link from the array by its id and re-renders
function deleteLink(id) {
  links = links.filter(function (l) { return l.id !== id; });
  renderLinks();
}

// Wires up the Add button and Enter key on both link inputs
function initLinks() {
  const addBtn    = document.querySelector('#add-link-btn');
  const nameInput = document.querySelector('#link-name');
  const urlInput  = document.querySelector('#link-url');

  addBtn.addEventListener('click', addLink);

  // Allow pressing Enter from either input field to add the link
  nameInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') addLink();
  });

  urlInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') addLink();
  });

  // Render the initial empty state
  renderLinks();
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
  initTodo();
  initLinks();
}

document.addEventListener('DOMContentLoaded', init);
