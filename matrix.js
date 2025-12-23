// Matrix View JavaScript
let currentMatrixDate = new Date();
let matrixTasks = [];

const MATRIX_STORAGE_KEY = 'focuslist_matrix_tasks';

// Date utilities
function formatMatrixDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatMatrixDateDisplay(date) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Load and save tasks
function loadMatrixTasks() {
  try {
    const stored = localStorage.getItem(MATRIX_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    matrixTasks = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to load matrix tasks:', e);
    matrixTasks = [];
  }
}

function saveMatrixTasks() {
  try {
    localStorage.setItem(MATRIX_STORAGE_KEY, JSON.stringify(matrixTasks));
  } catch (e) {
    console.warn('Failed to save matrix tasks:', e);
  }
}

// Get tasks for current date and category
function getMatrixTasksForDate(date, category = null) {
  const dateKey = formatMatrixDate(date);
  let filtered = matrixTasks.filter(task => task.date === dateKey);
  if (category) {
    filtered = filtered.filter(task => task.category === category);
  }
  return filtered;
}

// Add new task
function addMatrixTask(category, title, note) {
  if (!title.trim()) return false;

  const task = {
    id: Date.now().toString(),
    title: title.trim(),
    note: note.trim(),
    category: category,
    status: 'active',
    date: formatMatrixDate(currentMatrixDate),
    createdAt: Date.now()
  };

  matrixTasks.push(task);
  saveMatrixTasks();
  return true;
}

// Delete task
function deleteMatrixTask(taskId) {
  matrixTasks = matrixTasks.filter(t => t.id !== taskId);
  saveMatrixTasks();
}

// Toggle task status
function toggleMatrixTaskStatus(taskId) {
  const task = matrixTasks.find(t => t.id === taskId);
  if (!task) return;

  task.status = task.status === 'done' ? 'active' : 'done';
  saveMatrixTasks();
  renderAllMatrixCategories();
}

// Add task from HTML form (called by onclick)
function addTaskToMatrix(category) {
  const titleInput = document.querySelector(`input[data-quadrant="${category}"][data-field="title"]`);
  const noteInput = document.querySelector(`textarea[data-quadrant="${category}"][data-field="note"]`);
  
  if (!titleInput) return;

  const title = titleInput.value.trim();
  const note = noteInput ? noteInput.value.trim() : '';

  if (addMatrixTask(category, title, note)) {
    titleInput.value = '';
    if (noteInput) noteInput.value = '';
    renderMatrixCategory(category);
  }
}

// Render tasks for a category
function renderMatrixCategory(category) {
  const tasks = getMatrixTasksForDate(currentMatrixDate, category);
  const container = document.getElementById(`list${category}`);
  const countEl = document.getElementById(`count${category}`);
  
  if (!container || !countEl) return;

  // Update count
  countEl.textContent = tasks.length;

  // Clear container
  container.innerHTML = '';

  if (tasks.length === 0) {
    container.innerHTML = '<div class="matrix-empty">No tasks in this quadrant</div>';
    return;
  }

  // Render tasks
  tasks.forEach(task => {
    const taskEl = document.createElement('div');
    taskEl.className = `matrix-task-card ${task.status === 'done' ? 'status-done' : ''}`;
    taskEl.innerHTML = `
      <div class="matrix-task-header">
        <h4>${task.title}</h4>
        <span class="matrix-status ${task.status === 'done' ? 'matrix-status-done' : ''}">${task.status}</span>
      </div>
      ${task.note ? `<div class="matrix-note">${task.note}</div>` : ''}
      <div class="matrix-meta">
        <button class="matrix-action" onclick="toggleMatrixTaskStatus('${task.id}')">
          ${task.status === 'done' ? 'Mark Active' : 'Mark Done'}
        </button>
        <button class="matrix-action danger" onclick="deleteMatrixTaskConfirm('${task.id}')">Delete</button>
      </div>
    `;
    container.appendChild(taskEl);
  });
}

// Render all categories
function renderAllMatrixCategories() {
  const categories = ['IU', 'IBNU', 'NIBU', 'NINU'];
  categories.forEach(category => renderMatrixCategory(category));
}

// Date navigation
function changeMatrixDate(delta) {
  currentMatrixDate.setDate(currentMatrixDate.getDate() + delta);
  updateMatrixDateDisplay();
  renderAllMatrixCategories();
}

function goToMatrixToday() {
  currentMatrixDate = new Date();
  updateMatrixDateDisplay();
  renderAllMatrixCategories();
}

function updateMatrixDateDisplay() {
  const displayEl = document.getElementById('currentDateDisplay');
  if (displayEl) {
    displayEl.textContent = formatMatrixDateDisplay(currentMatrixDate);
  }
}

// Form handling
function handleMatrixFormSubmit(category, form) {
  const titleInput = form.querySelector(`[data-add-title="${category}"]`);
  const noteInput = form.querySelector(`[data-add-note="${category}"]`);
  
  if (!titleInput) return false;

  const title = titleInput.value.trim();
  const note = noteInput ? noteInput.value.trim() : '';

  if (addMatrixTask(category, title, note)) {
    titleInput.value = '';
    if (noteInput) noteInput.value = '';
    renderMatrixCategory(category);
    return true;
  }
  return false;
}

// Delete confirmation
function deleteMatrixTaskConfirm(taskId) {
  if (confirm('Are you sure you want to delete this task?')) {
    deleteMatrixTask(taskId);
    renderAllMatrixCategories();
  }
}

// Clear all tasks
function clearAllMatrixTasks() {
  if (confirm('Are you sure you want to clear all matrix tasks?')) {
    matrixTasks = [];
    saveMatrixTasks();
    renderAllMatrixCategories();
  }
}

// Initialize
function initMatrix() {
  loadMatrixTasks();
  updateMatrixDateDisplay();
  renderAllMatrixCategories();

  // Date navigation event listeners
  const prevBtn = document.getElementById('prevDay');
  const todayBtn = document.getElementById('todayBtn');
  const nextBtn = document.getElementById('nextDay');

  if (prevBtn) prevBtn.addEventListener('click', () => changeMatrixDate(-1));
  if (todayBtn) todayBtn.addEventListener('click', goToMatrixToday);
  if (nextBtn) nextBtn.addEventListener('click', () => changeMatrixDate(1));

  // Form event listeners
  const categories = ['IU', 'IBNU', 'NIBU', 'NINU'];
  categories.forEach(category => {
    const form = document.querySelector(`[data-add-form="${category}"]`);
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleMatrixFormSubmit(category, form);
      });
    }
  });

  // Listen for storage changes
  window.addEventListener('storage', () => {
    loadMatrixTasks();
    renderAllMatrixCategories();
  });
}

// Make functions globally available
window.addTaskToMatrix = addTaskToMatrix;
window.toggleMatrixTaskStatus = toggleMatrixTaskStatus;
window.deleteMatrixTaskConfirm = deleteMatrixTaskConfirm;
window.clearAll = clearAllMatrixTasks;

// Initialize on load
document.addEventListener('DOMContentLoaded', initMatrix);