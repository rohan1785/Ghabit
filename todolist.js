// Global variables
let tasks = [];
let currentDate = new Date().toISOString().split('T')[0];
let currentFilter = 'all';
let selectedTaskId = null;

// DOM elements
const taskList = document.getElementById('taskList');
const taskTitle = document.getElementById('taskTitle');
const taskNote = document.getElementById('taskNote');
const taskHours = document.getElementById('taskHours');
const taskMinutes = document.getElementById('taskMinutes');
const addTaskBtn = document.getElementById('addTaskBtn');
const progressBar = document.getElementById('progressBar');
const progressLabel = document.getElementById('progressLabel');
const currentDateDisplay = document.getElementById('currentDateDisplay');

// API functions
async function loadTasks(date = currentDate) {
  try {
    const stored = localStorage.getItem(`tasks_${date}`);
    tasks = stored ? JSON.parse(stored) : [];
    renderTasks();
    updateStats();
  } catch (error) {
    console.error('Failed to load tasks:', error);
    tasks = [];
    renderTasks();
    updateStats();
  }
}

async function saveTask(task) {
  try {
    const response = await fetch(`/api/tasks/${currentDate}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    
    if (response.ok) {
      const savedTask = await response.json();
      tasks.push(savedTask);
      renderTasks();
      updateStats();
      return savedTask;
    }
  } catch (error) {
    console.error('Failed to save task:', error);
    // Fallback to localStorage
    const newTask = {
      id: Date.now().toString(),
      ...task,
      createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    localStorage.setItem(`tasks_${currentDate}`, JSON.stringify(tasks));
    renderTasks();
    updateStats();
    return newTask;
  }
}

async function updateTask(taskId, updates) {
  try {
    const response = await fetch(`/api/tasks/${currentDate}/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    
    if (response.ok) {
      const updatedTask = await response.json();
      const index = tasks.findIndex(t => t.id === taskId);
      if (index !== -1) {
        tasks[index] = updatedTask;
        renderTasks();
        updateStats();
      }
    }
  } catch (error) {
    console.error('Failed to update task:', error);
    // Fallback to localStorage
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      localStorage.setItem(`tasks_${currentDate}`, JSON.stringify(tasks));
      renderTasks();
      updateStats();
    }
  }
}

async function deleteTask(taskId) {
  try {
    const response = await fetch(`/api/tasks/${currentDate}/${taskId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      tasks = tasks.filter(t => t.id !== taskId);
      renderTasks();
      updateStats();
    }
  } catch (error) {
    console.error('Failed to delete task:', error);
    // Fallback to localStorage
    tasks = tasks.filter(t => t.id !== taskId);
    localStorage.setItem(`tasks_${currentDate}`, JSON.stringify(tasks));
    renderTasks();
    updateStats();
  }
}

// Task management functions
function addTask() {
  const title = taskTitle.value.trim();
  if (!title) return;

  const task = {
    id: Date.now().toString(),
    title,
    note: taskNote.value.trim(),
    priority: 'NINU',
    status: 'active',
    estimatedTime: {
      hours: parseInt(taskHours.value) || 0,
      minutes: parseInt(taskMinutes.value) || 0
    },
    createdAt: new Date().toISOString()
  };

  tasks.push(task);
  localStorage.setItem(`tasks_${currentDate}`, JSON.stringify(tasks));
  renderTasks();
  updateStats();
  clearForm();
}

function clearForm() {
  taskTitle.value = '';
  taskNote.value = '';
  taskHours.value = '0';
  taskMinutes.value = '0';
}

function toggleTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    const newStatus = task.status === 'done' ? 'active' : 'done';
    task.status = newStatus;
    localStorage.setItem(`tasks_${currentDate}`, JSON.stringify(tasks));
    renderTasks();
    updateStats();
  }
}

function cancelTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.status = 'cancelled';
    localStorage.setItem(`tasks_${currentDate}`, JSON.stringify(tasks));
    renderTasks();
    updateStats();
  }
}

function deleteTask(taskId) {
  tasks = tasks.filter(t => t.id !== taskId);
  localStorage.setItem(`tasks_${currentDate}`, JSON.stringify(tasks));
  renderTasks();
  updateStats();
}

function selectTask(taskId) {
  selectedTaskId = selectedTaskId === taskId ? null : taskId;
  renderTasks();
  updateAttachButton();
}

function setPriority(taskId, priority) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.priority = priority;
    localStorage.setItem(`tasks_${currentDate}`, JSON.stringify(tasks));
    renderTasks();
    updateStats();
  }
}

function updateTaskTitle(taskId, title) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.title = title;
    localStorage.setItem(`tasks_${currentDate}`, JSON.stringify(tasks));
  }
}

function updateTaskNote(taskId, note) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.note = note;
    localStorage.setItem(`tasks_${currentDate}`, JSON.stringify(tasks));
  }
}

// Rendering functions
function renderTasks() {
  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'all') return true;
    return task.status === currentFilter;
  });

  taskList.innerHTML = filteredTasks.map(task => `
    <div class="task-item ${task.status} ${selectedTaskId === task.id ? 'selected' : ''}" data-id="${task.id}">
      <span class="drag-handle">⋮⋮</span>
      <input type="checkbox" class="task-checkbox" ${task.status === 'done' ? 'checked' : ''} 
             onchange="toggleTask('${task.id}')">
      <div class="task-content">
        <div class="task-title" contenteditable="true" 
             onblur="updateTaskTitle('${task.id}', this.textContent)">${task.title}</div>
        <div class="task-note" contenteditable="true" 
             onblur="updateTaskNote('${task.id}', this.textContent)">${task.note}</div>
        ${task.estimatedTime && (task.estimatedTime.hours > 0 || task.estimatedTime.minutes > 0) ? 
          `<div class="task-estimated-time">
            <span class="time-icon">⏱</span>
            <span>${task.estimatedTime.hours}h ${task.estimatedTime.minutes}m</span>
          </div>` : ''}
      </div>
      <div class="task-actions">
        <button class="btn-icon" onclick="selectTask('${task.id}')" title="Select for Pomodoro">📌</button>
        <button class="btn-icon" onclick="cancelTask('${task.id}')" title="Cancel Task">❌</button>
        <button class="btn-icon" onclick="deleteTask('${task.id}')" title="Delete Task">🗑️</button>
      </div>
    </div>
  `).join('');
}

function cyclePriority(taskId) {
  const priorities = ['IU', 'IBNU', 'NIBU', 'NINU'];
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    const currentIndex = priorities.indexOf(task.priority);
    const nextIndex = (currentIndex + 1) % priorities.length;
    setPriority(taskId, priorities[nextIndex]);
  }
}

function selectTask(taskId) {
  selectedTaskId = selectedTaskId === taskId ? null : taskId;
  renderTasks();
  updateAttachButton();
}

function updateAttachButton() {
  const attachBtn = document.getElementById('attachTaskBtn');
  if (attachBtn) {
    attachBtn.disabled = !selectedTaskId;
    attachBtn.textContent = selectedTaskId ? 'Attach Selected Task' : 'Select a Task First';
  }
}

// Statistics and progress
function updateStats() {
  const total = tasks.length;
  const active = tasks.filter(t => t.status === 'active').length;
  const done = tasks.filter(t => t.status === 'done').length;
  const cancelled = tasks.filter(t => t.status === 'cancelled').length;

  document.getElementById('countTotal').textContent = total;
  document.getElementById('countActive').textContent = active;
  document.getElementById('countDone').textContent = done;
  document.getElementById('countCancelled').textContent = cancelled;

  // Update progress
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  progressBar.style.width = `${progress}%`;
  progressLabel.textContent = `${progress}%`;
  
  if (progress === 100 && total > 0) {
    progressBar.classList.add('complete');
    document.querySelector('.todo-panel').classList.add('day-completed');
  } else {
    progressBar.classList.remove('complete');
    document.querySelector('.todo-panel').classList.remove('day-completed');
  }

  // Update estimated time
  updateEstimatedTime();
}

function updateEstimatedTime() {
  const activeTasks = tasks.filter(t => t.status === 'active');
  let totalMinutes = 0;
  
  activeTasks.forEach(task => {
    if (task.estimatedTime) {
      totalMinutes += (task.estimatedTime.hours * 60) + task.estimatedTime.minutes;
    }
  });

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  document.getElementById('totalEstimatedTime').textContent = `${hours}h ${minutes}m`;
  
  // Calculate remaining time
  const availableHours = parseFloat(document.getElementById('totalAvailableHours').value) || 0;
  const availableMinutes = availableHours * 60;
  const remainingMinutes = availableMinutes - totalMinutes;
  
  if (remainingMinutes >= 0) {
    const remHours = Math.floor(remainingMinutes / 60);
    const remMins = remainingMinutes % 60;
    document.getElementById('remainingTime').textContent = `${remHours}h ${remMins}m`;
  } else {
    const overMinutes = Math.abs(remainingMinutes);
    const overHours = Math.floor(overMinutes / 60);
    const overMins = overMinutes % 60;
    document.getElementById('remainingTime').textContent = `-${overHours}h ${overMins}m`;
  }
}

// Date navigation
function changeDate(days) {
  const date = new Date(currentDate);
  date.setDate(date.getDate() + days);
  currentDate = date.toISOString().split('T')[0];
  updateDateDisplay();
  loadTasks();
}

function goToToday() {
  currentDate = new Date().toISOString().split('T')[0];
  updateDateDisplay();
  loadTasks();
}

function updateDateDisplay() {
  const date = new Date(currentDate);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  currentDateDisplay.textContent = date.toLocaleDateString('en-US', options);
}

// Filter functions
function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.filter === filter);
  });
  renderTasks();
}

// Clear all tasks
async function clearAll() {
  if (confirm('Are you sure you want to clear all tasks? This cannot be undone.')) {
    tasks = [];
    localStorage.removeItem(`tasks_${currentDate}`);
    renderTasks();
    updateStats();
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  updateDateDisplay();
  loadTasks();
  updateTimerDisplay();
  
  addTaskBtn.addEventListener('click', addTask);
  
  // Timer controls
  document.getElementById('startPauseBtn').addEventListener('click', startPauseTimer);
  document.getElementById('resetBtn').addEventListener('click', resetTimer);
  
  // Mode pills
  document.querySelectorAll('.mode-pill').forEach(pill => {
    pill.addEventListener('click', () => switchMode(pill.dataset.mode));
  });
  
  // Settings inputs
  document.getElementById('durWork').addEventListener('change', (e) => {
    timerModes.work = parseInt(e.target.value) * 60;
    if (currentMode === 'work') resetTimer();
  });
  
  document.getElementById('durShort').addEventListener('change', (e) => {
    timerModes.short = parseInt(e.target.value) * 60;
    if (currentMode === 'short') resetTimer();
  });
  
  document.getElementById('durLong').addEventListener('change', (e) => {
    timerModes.long = parseInt(e.target.value) * 60;
    if (currentMode === 'long') resetTimer();
  });
  
  // Enter key to add task
  [taskTitle, taskNote, taskHours, taskMinutes].forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addTask();
    });
  });
  
  // Date navigation
  document.getElementById('datePrevBtn').addEventListener('click', () => changeDate(-1));
  document.getElementById('dateNextBtn').addEventListener('click', () => changeDate(1));
  document.getElementById('dateTodayBtn').addEventListener('click', goToToday);
  
  // Filter buttons
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => setFilter(chip.dataset.filter));
  });
  
  // Available hours input
  document.getElementById('totalAvailableHours').addEventListener('input', updateEstimatedTime);
});

// Pomodoro Timer
let timerInterval = null;
let currentTime = 25 * 60; // 25 minutes in seconds
let isRunning = false;
let currentMode = 'work';
let rounds = 0;

const timerModes = {
  work: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
  deepwork: 90 * 60
};

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
  document.getElementById('timerDisplay').textContent = formatTime(currentTime);
}

function startPauseTimer() {
  const btn = document.getElementById('startPauseBtn');
  
  if (isRunning) {
    clearInterval(timerInterval);
    isRunning = false;
    btn.textContent = 'Start';
  } else {
    timerInterval = setInterval(() => {
      currentTime--;
      updateTimerDisplay();
      
      if (currentTime <= 0) {
        clearInterval(timerInterval);
        isRunning = false;
        btn.textContent = 'Start';
        
        // Play completion sound if enabled
        if (document.getElementById('soundOn').checked) {
          playCompletionSound();
        }
        
        // Auto-switch to break if enabled
        if (document.getElementById('autoNext').checked) {
          if (currentMode === 'work') {
            rounds++;
            document.getElementById('roundsCount').textContent = rounds;
            const nextMode = rounds % 4 === 0 ? 'long' : 'short';
            switchMode(nextMode);
          } else {
            switchMode('work');
          }
        }
      }
    }, 1000);
    
    isRunning = true;
    btn.textContent = 'Pause';
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  currentTime = timerModes[currentMode];
  updateTimerDisplay();
  document.getElementById('startPauseBtn').textContent = 'Start';
}

function switchMode(mode) {
  currentMode = mode;
  currentTime = timerModes[mode];
  updateTimerDisplay();
  
  // Update active pill
  document.querySelectorAll('.mode-pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.mode === mode);
  });
  
  resetTimer();
}

function playCompletionSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    console.log('Audio not supported');
  }
}
// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.contentEditable === 'true') return;
  
  switch(e.key) {
    case ' ':
      e.preventDefault();
      startPauseTimer();
      break;
    case 'r':
    case 'R':
      e.preventDefault();
      resetTimer();
      break;
    case '1':
      e.preventDefault();
      switchMode('work');
      break;
    case '2':
      e.preventDefault();
      switchMode('short');
      break;
    case '3':
      e.preventDefault();
      switchMode('long');
      break;
    case '4':
      e.preventDefault();
      switchMode('deepwork');
      break;
    case 'Enter':
      e.preventDefault();
      addTask();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      changeDate(-1);
      break;
    case 'ArrowRight':
      e.preventDefault();
      changeDate(1);
      break;
    case 't':
    case 'T':
      e.preventDefault();
      goToToday();
      break;
  }
});