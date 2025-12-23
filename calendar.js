// Calendar View JavaScript
let currentCalendarDate = new Date();
let calendarTasks = [];

const CALENDAR_STORAGE_KEY = 'focuslist_calendar_tasks';

// Timer settings
const calendarTimerSettings = {
  work: 25,
  short: 5,
  long: 15,
  roundsUntilLong: 4,
  autoNext: false,
  soundOn: true
};

// Date utilities
function formatCalendarDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatCalendarDateDisplay(date) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Load and save tasks
function loadCalendarTasks() {
  try {
    const stored = localStorage.getItem(CALENDAR_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    calendarTasks = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to load calendar tasks:', e);
    calendarTasks = [];
  }
}

function saveCalendarTasks() {
  try {
    localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(calendarTasks));
  } catch (e) {
    console.warn('Failed to save calendar tasks:', e);
  }
}

// Get tasks for date range
function getCalendarTasksForDateRange(startDate, days = 7) {
  const tasksByDate = {};
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateKey = formatCalendarDate(date);
    tasksByDate[dateKey] = calendarTasks.filter(task => task.date === dateKey);
  }
  
  return tasksByDate;
}

// Toggle task status
function toggleCalendarTaskStatus(taskId) {
  const task = calendarTasks.find(t => t.id === taskId);
  if (!task) return;

  task.status = task.status === 'done' ? 'active' : 'done';
  saveCalendarTasks();
  renderCalendarGrid();
}

// Reset Pomodoro for task
function resetTaskPomodoro(taskId) {
  const task = calendarTasks.find(t => t.id === taskId);
  if (!task) return;

  task.pomoSessions = 0;
  saveCalendarTasks();
  renderCalendarGrid();
}

// Increment Pomodoro session
function incrementTaskPomodoro(taskId) {
  const task = calendarTasks.find(t => t.id === taskId);
  if (!task) return;

  if (task.pomoSessions < task.targetPomos) {
    task.pomoSessions++;
    saveCalendarTasks();
    renderCalendarGrid();
  }
}

// Delete task
function deleteCalendarTask(taskId) {
  if (confirm('Are you sure you want to delete this task?')) {
    calendarTasks = calendarTasks.filter(t => t.id !== taskId);
    saveCalendarTasks();
    renderCalendarGrid();
  }
}

// Render calendar grid
function renderCalendarGrid() {
  const container = document.getElementById('calendarGrid');
  if (!container) return;

  container.innerHTML = '';
  
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  
  // Update month display
  const monthDisplay = document.getElementById('currentMonthDisplay');
  if (monthDisplay) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    monthDisplay.textContent = `${monthNames[month]} ${year}`;
  }
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day empty';
    container.appendChild(emptyDay);
  }
  
  // Add days of the month
  const today = new Date();
  const todayStr = formatCalendarDate(today);
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = formatCalendarDate(date);
    const dayTasks = calendarTasks.filter(task => task.date === dateKey);
    
    const dayEl = document.createElement('div');
    dayEl.className = `calendar-day ${dateKey === todayStr ? 'today' : ''}`;
    dayEl.onclick = () => showDayDetails(dateKey);
    
    const completedTasks = dayTasks.filter(task => task.status === 'done').length;
    const totalTasks = dayTasks.length;
    
    dayEl.innerHTML = `
      <div class="day-number">${day}</div>
      ${totalTasks > 0 ? `
        <div class="day-tasks-indicator">
          <div class="tasks-count">${completedTasks}/${totalTasks}</div>
          <div class="tasks-progress-mini">
            <div class="progress-fill" style="width: ${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%"></div>
          </div>
        </div>
      ` : ''}
    `;
    
    if (totalTasks > 0) {
      dayEl.classList.add('has-tasks');
      if (completedTasks === totalTasks) {
        dayEl.classList.add('all-complete');
      }
    }
    
    container.appendChild(dayEl);
  }
}

// Render individual task
function renderCalendarTask(task) {
  const progressPercent = task.targetPomos > 0 ? Math.round((task.pomoSessions / task.targetPomos) * 100) : 0;
  
  return `
    <div class="calendar-task ${task.status}" draggable="true" data-task-id="${task.id}">
      <div class="task-header-row">
        <div class="task-name-row">
          <input type="checkbox" class="task-checkbox" ${task.status === 'done' ? 'checked' : ''} 
                 onchange="toggleCalendarTaskStatus('${task.id}')" onclick="event.stopPropagation()">
          <div class="task-name">
            <span class="task-title-text">${task.title}</span>
          </div>
        </div>
        <div class="task-pomo-controls">
          <button class="pomo-time" onclick="incrementTaskPomodoro('${task.id}')" 
                  ${task.pomoSessions >= task.targetPomos ? 'disabled' : ''}>
            ${task.pomoSessions}/${task.targetPomos}
          </button>
          <button class="pomo-reset-btn" onclick="resetTaskPomodoro('${task.id}')" 
                  ${task.pomoSessions === 0 ? 'disabled' : ''}>Reset</button>
          <button class="pomo-reset-btn delete-btn" onclick="deleteCalendarTask('${task.id}')">🗑</button>
        </div>
      </div>
      ${task.targetPomos > 0 ? `
        <div class="task-progress">
          <div class="task-progress-label">
            <span>Progress</span>
            <span>${progressPercent}%</span>
          </div>
          <div class="task-progress-bar-container">
            <div class="task-progress-bar ${progressPercent === 100 ? 'complete' : ''}" 
                 style="width: ${progressPercent}%"></div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// Add new task
function addCalendarTask(dateKey) {
  const title = prompt('Enter task title:');
  if (!title || !title.trim()) return;

  const task = {
    id: Date.now().toString(),
    title: title.trim(),
    status: 'active',
    date: dateKey,
    pomoSessions: 0,
    targetPomos: 4,
    createdAt: Date.now()
  };

  calendarTasks.push(task);
  saveCalendarTasks();
  renderCalendarGrid();
}

// Date navigation
function changeCalendarDate(delta) {
  if (delta > 0) {
    // Next month
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
  } else {
    // Previous month
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
  }
  renderCalendarGrid();
}

function goToCalendarToday() {
  currentCalendarDate = new Date();
  renderCalendarGrid();
}

// Load timer settings
function loadCalendarTimerSettings() {
  const saved = localStorage.getItem('calendar_timer_settings');
  if (saved) {
    Object.assign(calendarTimerSettings, JSON.parse(saved));
  }
  updateCalendarTimerInputs();
}

function saveCalendarTimerSettings() {
  localStorage.setItem('calendar_timer_settings', JSON.stringify(calendarTimerSettings));
}

function updateCalendarTimerInputs() {
  const durWork = document.getElementById('durWork');
  const durShort = document.getElementById('durShort');
  const durLong = document.getElementById('durLong');
  const roundsLong = document.getElementById('roundsLong');
  const autoNext = document.getElementById('autoNext');
  const soundOn = document.getElementById('soundOn');

  if (durWork) durWork.value = calendarTimerSettings.work;
  if (durShort) durShort.value = calendarTimerSettings.short;
  if (durLong) durLong.value = calendarTimerSettings.long;
  if (roundsLong) roundsLong.value = calendarTimerSettings.roundsUntilLong;
  if (autoNext) autoNext.checked = calendarTimerSettings.autoNext;
  if (soundOn) soundOn.checked = calendarTimerSettings.soundOn;
}

// Clear all tasks
function clearAll() {
  if (confirm('Are you sure you want to clear all calendar tasks?')) {
    calendarTasks = [];
    saveCalendarTasks();
    renderCalendarGrid();
  }
}

// Initialize calendar
function initCalendar() {
  loadCalendarTasks();
  loadCalendarTimerSettings();
  renderCalendarGrid();

  // Event listeners
  const prevBtn = document.getElementById('prevMonth');
  const todayBtn = document.getElementById('todayBtn');
  const nextBtn = document.getElementById('nextMonth');

  if (prevBtn) prevBtn.addEventListener('click', () => changeCalendarDate(-1));
  if (todayBtn) todayBtn.addEventListener('click', goToCalendarToday);
  if (nextBtn) nextBtn.addEventListener('click', () => changeCalendarDate(1));

  // Settings event listeners
  const durWork = document.getElementById('durWork');
  if (durWork) {
    durWork.addEventListener('change', () => {
      calendarTimerSettings.work = parseInt(durWork.value);
      saveCalendarTimerSettings();
    });
  }

  const durShort = document.getElementById('durShort');
  if (durShort) {
    durShort.addEventListener('change', () => {
      calendarTimerSettings.short = parseInt(durShort.value);
      saveCalendarTimerSettings();
    });
  }

  const durLong = document.getElementById('durLong');
  if (durLong) {
    durLong.addEventListener('change', () => {
      calendarTimerSettings.long = parseInt(durLong.value);
      saveCalendarTimerSettings();
    });
  }

  const roundsLong = document.getElementById('roundsLong');
  if (roundsLong) {
    roundsLong.addEventListener('change', () => {
      calendarTimerSettings.roundsUntilLong = parseInt(roundsLong.value);
      saveCalendarTimerSettings();
    });
  }

  const autoNext = document.getElementById('autoNext');
  if (autoNext) {
    autoNext.addEventListener('change', () => {
      calendarTimerSettings.autoNext = autoNext.checked;
      saveCalendarTimerSettings();
    });
  }

  const soundOn = document.getElementById('soundOn');
  if (soundOn) {
    soundOn.addEventListener('change', () => {
      calendarTimerSettings.soundOn = soundOn.checked;
      saveCalendarTimerSettings();
    });
  }
}

// Add task to specific day from modal
function addTaskToDay() {
  const titleInput = document.getElementById('newTaskTitle');
  const noteInput = document.getElementById('newTaskNote');
  
  const title = titleInput.value.trim();
  if (!title) {
    alert('Please enter a task title');
    return;
  }

  const selectedDate = document.getElementById('dayModal').dataset.selectedDate;
  if (!selectedDate) return;

  const task = {
    id: Date.now().toString(),
    title: title,
    note: noteInput.value.trim(),
    status: 'active',
    date: selectedDate,
    pomoSessions: 0,
    targetPomos: 4,
    createdAt: Date.now()
  };

  calendarTasks.push(task);
  saveCalendarTasks();
  
  // Clear form
  titleInput.value = '';
  noteInput.value = '';
  
  // Refresh calendar and modal
  renderCalendarGrid();
  showDayDetails(selectedDate);
}

// Show day details modal
function showDayDetails(dateKey) {
  const modal = document.getElementById('dayModal');
  const title = document.getElementById('dayModalTitle');
  const tasksContainer = document.getElementById('dayModalTasks');
  const habitsContainer = document.getElementById('dayModalHabits');
  
  modal.dataset.selectedDate = dateKey;
  
  const date = new Date(dateKey);
  title.textContent = formatCalendarDateDisplay(date);
  
  // Get tasks for this date
  const dayTasks = calendarTasks.filter(task => task.date === dateKey);
  
  if (dayTasks.length === 0) {
    tasksContainer.innerHTML = '<p class="empty-state">No tasks for this day</p>';
  } else {
    tasksContainer.innerHTML = dayTasks.map(task => `
      <div class="modal-task-item ${task.status}">
        <input type="checkbox" ${task.status === 'done' ? 'checked' : ''} 
               onchange="toggleCalendarTaskStatus('${task.id}'); showDayDetails('${dateKey}')">
        <span class="task-title">${task.title}</span>
        ${task.note ? `<span class="task-note">${task.note}</span>` : ''}
        <button class="btn-small ${task.status === 'done' ? 'btn-secondary' : 'btn-primary'}" 
                onclick="toggleCalendarTaskStatus('${task.id}'); showDayDetails('${dateKey}')">
          ${task.status === 'done' ? 'Mark Active' : 'Mark Done'}
        </button>
        <button class="delete-btn" onclick="deleteCalendarTask('${task.id}'); showDayDetails('${dateKey}')">🗑️</button>
      </div>
    `).join('');
  }
  
  // For now, show empty habits (can be extended later)
  habitsContainer.innerHTML = '<p class="empty-state">No habits for this day</p>';
  
  modal.style.display = 'flex';
}

// Close day modal
function closeDayModal() {
  const modal = document.getElementById('dayModal');
  modal.style.display = 'none';
}

// Go to specific day (can redirect to day planner)
function goToDay() {
  const selectedDate = document.getElementById('dayModal').dataset.selectedDate;
  if (selectedDate) {
    // For now, just close modal. Can be extended to redirect to day planner
    closeDayModal();
    alert(`Navigate to ${selectedDate} (feature can be extended)`);
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initCalendar);
// Make functions globally available
window.toggleCalendarTaskStatus = toggleCalendarTaskStatus;
window.resetTaskPomodoro = resetTaskPomodoro;
window.incrementTaskPomodoro = incrementTaskPomodoro;
window.deleteCalendarTask = deleteCalendarTask;
window.addCalendarTask = addCalendarTask;
window.addTaskToDay = addTaskToDay;
window.showDayDetails = showDayDetails;
window.closeDayModal = closeDayModal;
window.goToDay = goToDay;
window.clearAll = clearAll;