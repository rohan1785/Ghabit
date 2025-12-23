// Day Planner JavaScript
let currentViewDate = new Date();
let tasks = [];
let selectedBlock = null;
let selectedTaskIds = new Set();

const STORAGE_KEY = 'focuslist_tasks_v1';

// Date utilities
function formatDateAsYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateDisplay(date) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Load and save tasks
function loadTasks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    tasks = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to load tasks:', e);
    tasks = [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.warn('Failed to save tasks:', e);
  }
}

// Get tasks for current date
function getTasksForDate(date) {
  const dateKey = formatDateAsYYYYMMDD(date);
  return tasks.filter(task => {
    if (task.taskDate) {
      return task.taskDate === dateKey;
    } else if (task.dateValue) {
      const taskDate = new Date(task.dateValue);
      return formatDateAsYYYYMMDD(taskDate) === dateKey;
    }
    return false;
  });
}

// Get tasks for a specific time block
function getTasksForBlock(block) {
  const dateTasks = getTasksForDate(currentViewDate);
  return dateTasks.filter(task => task.timeBlock === block);
}

// Render all blocks
function renderAllBlocks() {
  const blocks = ['morning', 'afternoon', 'evening', 'night'];
  blocks.forEach(block => renderBlock(block));
  updateDailySummary();
  updateHeaderSummary();
}

// Render a single block
function renderBlock(block) {
  const blockTasks = getTasksForBlock(block);
  const container = document.getElementById(`${block}Tasks`);
  container.innerHTML = '';

  if (blockTasks.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;font-size:0.9rem;">No tasks scheduled</p>';
    updateBlockProgress(block, blockTasks);
    return;
  }

  blockTasks.forEach(task => {
    const taskEl = document.createElement('div');
    taskEl.className = `time-block-task ${task.status === 'done' ? 'done' : ''} ${task.status === 'cancelled' ? 'cancelled' : ''}`;
    taskEl.dataset.taskId = task.id;
    taskEl.innerHTML = `
      <div class="time-block-task-checkbox ${task.status === 'done' ? 'checked' : ''}" 
           onclick="toggleTaskStatus('${task.id}')"></div>
      <div class="time-block-task-content">
        <div class="time-block-task-title" 
             contenteditable="${task.status !== 'cancelled' ? 'true' : 'false'}"
             data-field="title"
             data-task-id="${task.id}">${task.title || 'Untitled Task'}</div>
        <div class="time-block-task-note" 
             contenteditable="${task.status !== 'cancelled' ? 'true' : 'false'}"
             data-field="note"
             data-task-id="${task.id}">${task.note || ''}</div>
        ${(task.estimatedHours > 0 || task.estimatedMinutes > 0) ? `
          <div class="time-block-task-time">
            ⏱ ${task.estimatedHours > 0 ? task.estimatedHours + 'h' : ''} ${task.estimatedMinutes > 0 ? task.estimatedMinutes + 'm' : ''}
          </div>
        ` : ''}
      </div>
      <div class="time-block-task-actions">
        ${task.status === 'cancelled'
          ? `<button class="time-block-task-action-btn" onclick="restoreTask('${task.id}')" title="Restore">↩️</button>`
          : `<button class="time-block-task-action-btn" onclick="cancelTask('${task.id}')" title="Cancel">✕</button>`
        }
        <button class="time-block-task-action-btn" onclick="openMoveBlockModal('${task.id}')" title="Move to another block">📅</button>
        <button class="time-block-task-action-btn delete" onclick="deleteTaskConfirm('${task.id}')" title="Delete">🗑</button>
      </div>
    `;
    container.appendChild(taskEl);
  });

  // Attach contenteditable listeners
  container.querySelectorAll('[contenteditable="true"]').forEach(el => {
    el.addEventListener('blur', function () {
      const taskId = this.dataset.taskId;
      const field = this.dataset.field;
      const value = this.textContent.trim();
      updateTaskField(taskId, field, value);
    });
    el.addEventListener('keydown', function (e) {
      const field = this.dataset.field;
      if (e.key === 'Enter' && field === 'title') {
        e.preventDefault();
        this.blur();
      }
    });
  });

  updateBlockProgress(block, blockTasks);
}

// Update block progress
function updateBlockProgress(block, blockTasks) {
  const doneCount = blockTasks.filter(t => t.status === 'done').length;
  const totalCount = blockTasks.length;
  const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const card = document.querySelector(`[data-block="${block}"]`);
  const progressFill = card.querySelector('.time-block-progress-fill');
  const stats = card.querySelector('.time-block-stats');

  progressFill.style.width = `${percent}%`;
  progressFill.setAttribute('data-progress', percent);

  // Calculate total estimated time
  let totalMinutes = 0;
  blockTasks.forEach(task => {
    if (task.estimatedHours) totalMinutes += task.estimatedHours * 60;
    if (task.estimatedMinutes) totalMinutes += task.estimatedMinutes;
  });
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  stats.textContent = `${doneCount} / ${totalCount} tasks done · ${timeStr} scheduled`;
}

// Update daily summary
function updateDailySummary() {
  const dateTasks = getTasksForDate(currentViewDate);
  const totalTasks = dateTasks.length;
  const completedTasks = dateTasks.filter(t => t.status === 'done').length;
  const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  let totalEstimatedMinutes = 0;
  let completedEstimatedMinutes = 0;

  dateTasks.forEach(task => {
    let taskMinutes = 0;
    if (task.estimatedHours) taskMinutes += task.estimatedHours * 60;
    if (task.estimatedMinutes) taskMinutes += task.estimatedMinutes;
    totalEstimatedMinutes += taskMinutes;
    if (task.status === 'done') {
      completedEstimatedMinutes += taskMinutes;
    }
  });

  const totalHours = Math.floor(totalEstimatedMinutes / 60);
  const totalMins = totalEstimatedMinutes % 60;
  const completedHours = Math.floor(completedEstimatedMinutes / 60);
  const completedMins = completedEstimatedMinutes % 60;

  // Only update elements that exist
  const dailyTotalTasks = document.getElementById('dailyTotalTasks');
  const dailyCompletedTasks = document.getElementById('dailyCompletedTasks');
  const dailyTotalEstimated = document.getElementById('dailyTotalEstimated');
  const dailyTimeCompleted = document.getElementById('dailyTimeCompleted');
  const dailyProgressPercent = document.getElementById('dailyProgressPercent');
  const dailyProgressFill = document.getElementById('dailyProgressFill');

  if (dailyTotalTasks) dailyTotalTasks.textContent = totalTasks;
  if (dailyCompletedTasks) dailyCompletedTasks.textContent = completedTasks;
  if (dailyTotalEstimated) dailyTotalEstimated.textContent = totalHours > 0 ? `${totalHours}h ${totalMins}m` : `${totalMins}m`;
  if (dailyTimeCompleted) dailyTimeCompleted.textContent = completedHours > 0 ? `${completedHours}h ${completedMins}m` : `${completedMins}m`;
  if (dailyProgressPercent) dailyProgressPercent.textContent = `${percent}%`;
  if (dailyProgressFill) dailyProgressFill.style.width = `${percent}%`;
}

// Update header summary
function updateHeaderSummary() {
  const dateTasks = getTasksForDate(currentViewDate);
  const totalTasksCount = document.getElementById('totalTasksCount');
  const totalEstimatedTime = document.getElementById('totalEstimatedTime');
  
  if (totalTasksCount) {
    totalTasksCount.textContent = dateTasks.length;
  }

  let totalMinutes = 0;
  dateTasks.forEach(task => {
    if (task.estimatedHours) totalMinutes += task.estimatedHours * 60;
    if (task.estimatedMinutes) totalMinutes += task.estimatedMinutes;
  });
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (totalEstimatedTime) {
    totalEstimatedTime.textContent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }
}

// Date navigation
function changeDate(delta) {
  currentViewDate.setDate(currentViewDate.getDate() + delta);
  currentViewDate.setHours(0, 0, 0, 0);
  updateDateDisplay();
  renderAllBlocks();
}

function goToToday() {
  currentViewDate = new Date();
  currentViewDate.setHours(0, 0, 0, 0);
  updateDateDisplay();
  renderAllBlocks();
}

function updateDateDisplay() {
  const currentDateDisplay = document.getElementById('currentDateDisplay');
  if (currentDateDisplay) {
    currentDateDisplay.textContent = formatDateDisplay(currentViewDate);
  }
}

// Task management
function toggleTaskStatus(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
  const checkbox = taskElement?.querySelector('.time-block-task-checkbox');
  
  if (task.status === 'done') {
    task.status = 'active';
    if (taskElement) {
      taskElement.classList.remove('done');
      taskElement.classList.remove('task-completing');
    }
  } else {
    task.status = 'done';
    if (taskElement) {
      // Add completing animation first
      taskElement.classList.add('task-completing');
      
      // After a short delay, add the done class and remove completing
      setTimeout(() => {
        taskElement.classList.remove('task-completing');
        taskElement.classList.add('done');
      }, 300);
    }
  }

  saveTasks();
  renderAllBlocks();
}

function addTaskToBlock(block) {
  const form = document.getElementById(`${block}Form`);
  const titleInput = form.querySelector('[data-field="title"]');
  const noteInput = form.querySelector('[data-field="note"]');
  const hoursInput = form.querySelector('[data-field="hours"]');
  const minutesInput = form.querySelector('[data-field="minutes"]');

  const title = titleInput.value.trim();
  if (!title) {
    alert('Please enter a task title');
    return;
  }

  const note = noteInput.value.trim();
  const hours = parseInt(hoursInput.value) || 0;
  const minutes = parseInt(minutesInput.value) || 0;
  const estimatedTimeMinutes = hours * 60 + minutes;

  const dateKey = formatDateAsYYYYMMDD(currentViewDate);
  const dateValue = currentViewDate.getTime();

  const task = {
    id: Date.now().toString(),
    title,
    note,
    category: 'IU',
    status: 'active',
    createdAt: Date.now(),
    taskDate: dateKey,
    dateValue: dateValue,
    date: currentViewDate.toDateString(),
    timeBlock: block,
    estimatedHours: hours,
    estimatedMinutes: minutes,
    estimatedTimeMinutes: estimatedTimeMinutes,
    pomoSessions: 0,
    targetPomos: estimatedTimeMinutes > 0 ? Math.max(1, Math.ceil(estimatedTimeMinutes / 25)) : 4
  };

  tasks.push(task);
  saveTasks();

  // Clear form
  titleInput.value = '';
  noteInput.value = '';
  hoursInput.value = '';
  minutesInput.value = '';
  cancelAddForm(block);

  renderAllBlocks();
}

function toggleAddForm(block) {
  console.log('toggleAddForm called for block:', block);
  const form = document.getElementById(`${block}Form`);
  console.log('Form element found:', form);
  if (form) {
    form.classList.toggle('active');
    console.log('Form classes after toggle:', form.className);
  } else {
    console.error('Form not found for block:', block);
  }
}

function cancelAddForm(block) {
  const form = document.getElementById(`${block}Form`);
  form.classList.remove('active');
  const inputs = form.querySelectorAll('input');
  inputs.forEach(input => input.value = '');
}

// Add from List Modal
function openAddFromListModal(block) {
  selectedBlock = block;
  selectedTaskIds.clear();

  const dateKey = formatDateAsYYYYMMDD(currentViewDate);
  const availableTasks = tasks.filter(task => {
    if (task.taskDate !== dateKey) {
      if (task.dateValue) {
        const taskDate = new Date(task.dateValue);
        if (formatDateAsYYYYMMDD(taskDate) !== dateKey) return false;
      } else {
        return false;
      }
    }
    return !task.timeBlock || task.timeBlock === '';
  });

  const modalList = document.getElementById('modalTaskList');
  modalList.innerHTML = '';

  if (availableTasks.length === 0) {
    modalList.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">No unassigned tasks for this date</p>';
  } else {
    availableTasks.forEach(task => {
      const taskEl = document.createElement('div');
      taskEl.className = 'day-planner-modal-task';
      taskEl.innerHTML = `
        <div class="day-planner-modal-task-checkbox" onclick="toggleTaskSelection('${task.id}', this)"></div>
        <div class="day-planner-modal-task-content">
          <div class="day-planner-modal-task-title">${task.title || 'Untitled Task'}</div>
          ${task.note ? `<div class="day-planner-modal-task-note">${task.note}</div>` : ''}
        </div>
      `;
      modalList.appendChild(taskEl);
    });
  }

  document.getElementById('addFromListModal').classList.add('active');
}

function closeAddFromListModal() {
  document.getElementById('addFromListModal').classList.remove('active');
  selectedBlock = null;
  selectedTaskIds.clear();
}

function toggleTaskSelection(taskId, checkboxEl) {
  if (selectedTaskIds.has(taskId)) {
    selectedTaskIds.delete(taskId);
    checkboxEl.classList.remove('checked');
  } else {
    selectedTaskIds.add(taskId);
    checkboxEl.classList.add('checked');
  }
}

function confirmAddFromList() {
  if (selectedTaskIds.size === 0) {
    alert('Please select at least one task');
    return;
  }

  selectedTaskIds.forEach(taskId => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.timeBlock = selectedBlock;
    }
  });

  saveTasks();
  closeAddFromListModal();
  renderAllBlocks();
}

// Task editing
function updateTaskField(taskId, field, value) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  if (field === 'title') {
    task.title = value || 'Untitled Task';
  } else if (field === 'note') {
    task.note = value;
  }

  saveTasks();
  updateDailySummary();
  updateHeaderSummary();
  const block = task.timeBlock;
  if (block) {
    const blockTasks = getTasksForBlock(block);
    updateBlockProgress(block, blockTasks);
  }
}

// Task deletion
function deleteTaskConfirm(taskId) {
  if (confirm('Are you sure you want to delete this task?')) {
    deleteTask(taskId);
  }
}

function deleteTask(taskId) {
  tasks = tasks.filter(t => t.id !== taskId);
  saveTasks();
  renderAllBlocks();
  updateDailySummary();
  updateHeaderSummary();
}

// Task cancellation/restoration
function cancelTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  task.status = 'cancelled';
  saveTasks();
  renderAllBlocks();
  updateDailySummary();
  updateHeaderSummary();
}

function restoreTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  task.status = 'active';
  saveTasks();
  renderAllBlocks();
  updateDailySummary();
  updateHeaderSummary();
}

// Move task between blocks
let moveTaskId = null;

function openMoveBlockModal(taskId) {
  moveTaskId = taskId;
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const currentBlock = task.timeBlock;
  const blocks = [
    { id: 'morning', name: 'Morning', time: '6:00 – 12:00' },
    { id: 'afternoon', name: 'Afternoon', time: '12:00 – 16:00' },
    { id: 'evening', name: 'Evening', time: '16:00 – 20:00' },
    { id: 'night', name: 'Night', time: '20:00 – 6:00' }
  ];

  const optionsContainer = document.getElementById('moveBlockOptions');
  optionsContainer.innerHTML = '';

  blocks.forEach(block => {
    if (block.id !== currentBlock) {
      const option = document.createElement('div');
      option.className = 'day-planner-move-block-option';
      option.innerHTML = `
        <div style="font-weight: 600;">${block.name}</div>
        <div style="font-size: 0.85rem; color: var(--text-secondary);">${block.time}</div>
      `;
      option.onclick = () => moveTaskToBlock(taskId, block.id);
      optionsContainer.appendChild(option);
    }
  });

  if (currentBlock) {
    const removeOption = document.createElement('div');
    removeOption.className = 'day-planner-move-block-option';
    removeOption.innerHTML = '<div style="font-weight: 600; color: var(--text-secondary);">Remove from Block</div>';
    removeOption.onclick = () => moveTaskToBlock(taskId, null);
    optionsContainer.appendChild(removeOption);
  }

  document.getElementById('moveBlockModal').classList.add('active');
}

function closeMoveBlockModal() {
  document.getElementById('moveBlockModal').classList.remove('active');
  moveTaskId = null;
}

function moveTaskToBlock(taskId, targetBlock) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  task.timeBlock = targetBlock;
  saveTasks();
  closeMoveBlockModal();
  renderAllBlocks();
  updateDailySummary();
  updateHeaderSummary();
}

// Initialize
function init() {
  loadTasks();
  updateDateDisplay();
  renderAllBlocks();

  // Event listeners
  document.getElementById('prevDay').addEventListener('click', () => changeDate(-1));
  document.getElementById('nextDay').addEventListener('click', () => changeDate(1));
  document.getElementById('todayBtn').addEventListener('click', goToToday);

  // Close modal on overlay click
  document.getElementById('addFromListModal').addEventListener('click', (e) => {
    if (e.target.id === 'addFromListModal') {
      closeAddFromListModal();
    }
  });

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAddFromListModal();
      closeMoveBlockModal();
    }
  });

  // Close move block modal on overlay click
  document.addEventListener('click', (e) => {
    const modal = document.getElementById('moveBlockModal');
    if (modal && modal.classList.contains('active')) {
      const modalContent = modal.querySelector('.day-planner-move-block-modal');
      if (modalContent && !modalContent.contains(e.target)) {
        closeMoveBlockModal();
      }
    }
  });

  // Listen for storage changes from other tabs
  window.addEventListener('storage', () => {
    loadTasks();
    renderAllBlocks();
  });
}

// Make functions globally available
window.toggleTaskStatus = toggleTaskStatus;
window.toggleAddForm = toggleAddForm;
window.cancelAddForm = cancelAddForm;
window.addTaskToBlock = addTaskToBlock;
window.openAddFromListModal = openAddFromListModal;
window.closeAddFromListModal = closeAddFromListModal;
window.toggleTaskSelection = toggleTaskSelection;
window.confirmAddFromList = confirmAddFromList;
window.updateTaskField = updateTaskField;
window.deleteTaskConfirm = deleteTaskConfirm;
window.deleteTask = deleteTask;
window.cancelTask = cancelTask;
window.restoreTask = restoreTask;
window.openMoveBlockModal = openMoveBlockModal;
window.closeMoveBlockModal = closeMoveBlockModal;
window.moveTaskToBlock = moveTaskToBlock;
window.clearAll = () => {
  if (confirm('Are you sure you want to clear all tasks?')) {
    tasks = [];
    saveTasks();
    renderAllBlocks();
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', init);