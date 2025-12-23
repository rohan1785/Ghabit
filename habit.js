// State
let currentDate = new Date();
let habits = [];
let habitData = {}; // { habitId: { [dateKey]: true/false } }

// Initialize
function init() {
  // Set initial month/year display
  document.getElementById('currentMonth').textContent = getMonthAndYear(currentDate.getFullYear(), currentDate.getMonth());

  loadData();
  renderTable();
  updateSummary();
  renderDailyProgress();
  renderGraphs();

  // Event listeners
  document.getElementById('addHabitBtn').addEventListener('click', addHabit);
  document.getElementById('newHabitInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addHabit();
  });
  document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
  document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));
  document.getElementById('copyFromPrevBtn').addEventListener('click', openCopyModal);
  document.getElementById('viewStatsBtn').addEventListener('click', openStatsModal);
  document.getElementById('confirmCopyBtn').addEventListener('click', confirmCopyHabits);
}

// Date utilities
function getDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function getMonthName(month) {
  const names = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return names[month];
}

function getMonthAndYear(year, month) {
  return `${getMonthName(month)} ${year}`;
}

function getDayName(day) {
  const names = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  return names[day];
}

// Data persistence
function getStorageKey() {
  return `habits_${currentDate.getFullYear()}_${currentDate.getMonth()}`;
}

function saveData() {
  const data = {
    habits: habits,
    habitData: habitData
  };
  localStorage.setItem(getStorageKey(), JSON.stringify(data));
}

function loadData() {
  const stored = localStorage.getItem(getStorageKey());
  if (stored) {
    const data = JSON.parse(stored);
    habits = data.habits || [];
    habitData = data.habitData || {};

    // Initialize order for habits that don't have it
    habits.forEach((habit, index) => {
      if (habit.order === undefined) {
        habit.order = index;
      }
    });
  } else {
    // Start completely empty
    habits = [];
    habitData = {};
  }
}

// Month navigation
function changeMonth(delta) {
  currentDate.setMonth(currentDate.getMonth() + delta);
  loadData();
  renderTable();
  updateSummary();
  renderDailyProgress();
  renderGraphs();
  document.getElementById('currentMonth').textContent = getMonthAndYear(currentDate.getFullYear(), currentDate.getMonth());
}

// Habit management
function addHabit() {
  const input = document.getElementById('newHabitInput');
  const name = input.value.trim();
  if (!name) return;

  const habitId = Date.now().toString();
  // Set order to be at the end
  const maxOrder = habits.length > 0 ? Math.max(...habits.map(h => h.order || 0)) : -1;
  habits.push({ id: habitId, name: name, order: maxOrder + 1 });
  habitData[habitId] = {};

  input.value = '';
  saveData();
  renderTable();
  updateSummary();
  renderGraphs();
}

function deleteHabit(habitId) {
  if (!confirm('Delete this habit?')) return;

  habits = habits.filter(h => h.id !== habitId);
  delete habitData[habitId];
  saveData();
  renderTable();
  updateSummary();
  renderDailyProgress();
  renderGraphs();
}

function toggleHabit(habitId, dateKey) {
  if (!habitData[habitId]) habitData[habitId] = {};
  habitData[habitId][dateKey] = !habitData[habitId][dateKey];
  saveData();
  updateSummary();
  renderDailyProgress();
  renderGraphs();
}

// Table rendering
function renderTable() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Build header
  const thead = document.getElementById('tableHead');
  thead.innerHTML = '';

  // Habit name column header
  const nameHeader = document.createElement('th');
  nameHeader.className = 'habit-name-col';
  nameHeader.textContent = 'My Habits';
  thead.appendChild(nameHeader);

  // Group days by weeks
  const weeks = [];
  let currentWeek = [];
  let dayNum = 1;

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    currentWeek.push(null);
  }

  while (dayNum <= daysInMonth) {
    const date = new Date(year, month, dayNum);
    currentWeek.push({ day: dayNum, date: date, dayOfWeek: date.getDay() });

    if (currentWeek.length === 7 || dayNum === daysInMonth) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
    dayNum++;
  }

  // Render week headers and day headers
  weeks.forEach((week, weekIndex) => {
    const weekHeader = document.createElement('th');
    weekHeader.className = 'week-header';
    weekHeader.colSpan = week.length;
    weekHeader.textContent = `Week ${weekIndex + 1}`;
    thead.appendChild(weekHeader);
  });

  const dayRow = document.createElement('tr');
  dayRow.appendChild(document.createElement('th')); // Empty cell for habit names

  weeks.forEach(week => {
    week.forEach(day => {
      if (day) {
        const dayHeader = document.createElement('th');
        dayHeader.className = 'day-header';
        dayHeader.innerHTML = `
          <div>${getDayName(day.dayOfWeek)}</div>
          <div class="day-number">${day.day}</div>
        `;
        dayRow.appendChild(dayHeader);
      }
    });
  });

  thead.appendChild(dayRow);

  // Build body - sort habits by order
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';

  // Sort habits by order (if exists), otherwise maintain current order
  const sortedHabits = [...habits].sort((a, b) => {
    const orderA = a.order !== undefined ? a.order : Infinity;
    const orderB = b.order !== undefined ? b.order : Infinity;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    // Fallback to creation order
    return (a.id || '').localeCompare(b.id || '');
  });

  sortedHabits.forEach((habit, index) => {
    const row = document.createElement('tr');
    row.draggable = true;
    row.dataset.habitId = habit.id;
    row.dataset.habitOrder = habit.order !== undefined ? habit.order : index;

    // Habit name cell
    const nameCell = document.createElement('td');
    nameCell.className = 'habit-name-cell';
    nameCell.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="cursor: move; user-select: none; color: var(--text-secondary); font-size: 1.2rem; margin-right: 0.25rem;" title="Drag to reorder">☰</span>
        <button class="habit-delete-btn" onclick="deleteHabit('${habit.id}')" aria-label="Delete habit">×</button>
        <span>${habit.name}</span>
      </div>
    `;
    row.appendChild(nameCell);

    // Checkbox cells
    weeks.forEach(week => {
      week.forEach(day => {
        if (day) {
          const cell = document.createElement('td');
          const dateKey = getDateKey(day.date);
          const checked = habitData[habit.id] && habitData[habit.id][dateKey];
          
          // Check if this is today's date
          const today = new Date();
          const isToday = day.date.getDate() === today.getDate() &&
                         day.date.getMonth() === today.getMonth() &&
                         day.date.getFullYear() === today.getFullYear();

          const checkbox = document.createElement('div');
          checkbox.className = `habit-checkbox ${checked ? 'checked' : ''} ${isToday ? 'today' : ''}`;
          checkbox.onclick = () => {
            toggleHabit(habit.id, dateKey);
            checkbox.classList.toggle('checked');
          };

          cell.appendChild(checkbox);
          row.appendChild(cell);
        }
      });
    });

    tbody.appendChild(row);
  });

  // Initialize drag and drop after rendering
  initHabitDragAndDrop();
}

// Drag and drop functionality for reordering habits
let draggedHabitRow = null;
let draggedOverHabitRow = null;

function initHabitDragAndDrop() {
  const habitRows = document.querySelectorAll('#tableBody tr[draggable="true"]');

  habitRows.forEach(row => {
    row.addEventListener('dragstart', handleHabitDragStart);
    row.addEventListener('dragover', handleHabitDragOver);
    row.addEventListener('dragenter', handleHabitDragEnter);
    row.addEventListener('dragleave', handleHabitDragLeave);
    row.addEventListener('drop', handleHabitDrop);
    row.addEventListener('dragend', handleHabitDragEnd);

    // Prevent drag on delete button
    const deleteBtn = row.querySelector('.habit-delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('mousedown', (e) => {
        e.stopPropagation();
      });
      deleteBtn.draggable = false;
    }
  });
}

function handleHabitDragStart(e) {
  draggedHabitRow = e.target.closest('tr');
  if (!draggedHabitRow) return;
  draggedHabitRow.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', draggedHabitRow.outerHTML);
}

function handleHabitDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleHabitDragEnter(e) {
  const target = e.target.closest('tr');
  if (target && target !== draggedHabitRow && target.draggable) {
    draggedOverHabitRow = target;
    target.classList.add('drag-over');
  }
}

function handleHabitDragLeave(e) {
  const target = e.target.closest('tr');
  if (target) {
    target.classList.remove('drag-over');
  }
}

function handleHabitDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  const target = e.target.closest('tr');
  if (!target || !draggedHabitRow || target === draggedHabitRow) {
    return false;
  }

  const tbody = document.getElementById('tableBody');
  const allRows = Array.from(tbody.querySelectorAll('tr[draggable="true"]'));
  const draggedIndex = allRows.indexOf(draggedHabitRow);
  const targetIndex = allRows.indexOf(target);

  if (draggedIndex === -1 || targetIndex === -1) {
    return false;
  }

  // Reorder in DOM
  if (draggedIndex < targetIndex) {
    tbody.insertBefore(draggedHabitRow, target.nextSibling);
  } else {
    tbody.insertBefore(draggedHabitRow, target);
  }

  // Update order in habit data
  const reorderedRows = Array.from(tbody.querySelectorAll('tr[draggable="true"]'));
  reorderedRows.forEach((row, index) => {
    const habitId = row.dataset.habitId;
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      habit.order = index;
    }
  });

  saveData();
  // Reload to ensure consistency
  const stored = localStorage.getItem(getStorageKey());
  if (stored) {
    const data = JSON.parse(stored);
    habits = data.habits || habits;
  }

  return false;
}

function handleHabitDragEnd(e) {
  const row = e.target.closest('tr');
  if (row) {
    row.classList.remove('dragging');
  }

  // Remove drag-over class from all rows
  document.querySelectorAll('#tableBody tr').forEach(el => {
    el.classList.remove('drag-over');
  });

  draggedHabitRow = null;
  draggedOverHabitRow = null;
}

// Summary updates
function updateSummary() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const totalPossible = habits.length * daysInMonth;
  let completed = 0;

  habits.forEach(habit => {
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = getDateKey(date);
      if (habitData[habit.id] && habitData[habit.id][dateKey]) {
        completed++;
      }
    }
  });

  document.getElementById('habitCount').textContent = habits.length;
  document.getElementById('completedCount').textContent = completed;

  const percent = totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0;
  document.getElementById('progressFill').style.width = `${percent}%`;
  document.getElementById('progressText').textContent = `${percent}%`;
}

// Daily progress
function renderDailyProgress() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const container = document.getElementById('dailyProgress');
  container.innerHTML = '';

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = getDateKey(date);
    let done = 0;
    let total = habits.length;

    habits.forEach(habit => {
      if (habitData[habit.id] && habitData[habit.id][dateKey]) {
        done++;
      }
    });

    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    const notDone = total - done;

    const item = document.createElement('div');
    item.className = 'habit-daily-item';
    item.innerHTML = `
      <div class="habit-daily-date">${getDayName(date.getDay())} ${day}</div>
      <div class="habit-daily-percent">${percent}%</div>
      <div class="habit-daily-stats">Done: ${done} / Not: ${notDone}</div>
    `;
    container.appendChild(item);
  }
}

// Graphs
function renderGraphs() {
  renderAreaChart();
  renderAnalysis();
  renderDonutChart();
  renderTopHabits();
  renderWeeklyProgress();
}

function renderAreaChart() {
  const canvas = document.getElementById('areaChart');
  const ctx = canvas.getContext('2d');
  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;
  canvas.width = width;
  canvas.height = height;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);

  // Calculate daily percentages
  const data = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = getDateKey(date);
    let done = 0;
    const total = habits.length;

    habits.forEach(habit => {
      if (habitData[habit.id] && habitData[habit.id][dateKey]) {
        done++;
      }
    });

    const percent = total > 0 ? (done / total) * 100 : 0;
    data.push(percent);
  }

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  if (data.length === 0) return;

  // Draw grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = (height / 4) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Draw labels
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('100%', width - 10, 15);
  ctx.fillText('75%', width - 10, height / 4 + 15);
  ctx.fillText('50%', width - 10, height / 2 + 15);
  ctx.fillText('25%', width - 10, (height * 3) / 4 + 15);
  ctx.fillText('0%', width - 10, height - 5);

  // Draw area chart
  if (data.length > 0) {
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const stepX = chartWidth / (data.length - 1 || 1);

    // Create gradient
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, 'rgba(52, 199, 89, 0.3)');
    gradient.addColorStop(1, 'rgba(52, 199, 89, 0.05)');

    // Draw area
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);

    data.forEach((value, index) => {
      const x = padding + index * stepX;
      const y = height - padding - (value / 100) * chartHeight;
      ctx.lineTo(x, y);
    });

    ctx.lineTo(padding + (data.length - 1) * stepX, height - padding);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    ctx.moveTo(padding, height - padding - (data[0] / 100) * chartHeight);
    data.forEach((value, index) => {
      if (index > 0) {
        const x = padding + index * stepX;
        const y = height - padding - (value / 100) * chartHeight;
        ctx.lineTo(x, y);
      }
    });
    ctx.strokeStyle = '#34c759';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Draw data points
    data.forEach((value, index) => {
      const x = padding + index * stepX;
      const y = height - padding - (value / 100) * chartHeight;
      
      // Outer circle (glow effect)
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(52, 199, 89, 0.3)';
      ctx.fill();
      
      // Inner circle
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#34c759';
      ctx.fill();
      
      // Center dot
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });
  }
}

function renderAnalysis() {
  const container = document.getElementById('analysisList');
  container.innerHTML = '';

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const goal = daysInMonth;

  habits.forEach(habit => {
    let actual = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = getDateKey(date);
      if (habitData[habit.id] && habitData[habit.id][dateKey]) {
        actual++;
      }
    }

    const percent = goal > 0 ? Math.round((actual / goal) * 100) : 0;

    const item = document.createElement('div');
    item.className = 'habit-analysis-item';
    item.innerHTML = `
      <div class="habit-analysis-header">
        <span class="habit-analysis-name">${habit.name}</span>
        <div class="habit-analysis-numbers">
          <span>Goal: ${goal}</span>
          <span>Actual: ${actual}</span>
        </div>
      </div>
      <div class="habit-analysis-bar-container">
        <div class="habit-analysis-bar" style="width: ${percent}%"></div>
      </div>
    `;
    container.appendChild(item);
  });
}

// Donut Chart
function renderDonutChart() {
  const canvas = document.getElementById('donutChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;
  canvas.width = width;
  canvas.height = height;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const totalPossible = habits.length * daysInMonth;
  let completed = 0;

  habits.forEach(habit => {
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = getDateKey(date);
      if (habitData[habit.id] && habitData[habit.id][dateKey]) {
        completed++;
      }
    }
  });

  const left = totalPossible - completed;
  const completedPercent = totalPossible > 0 ? (completed / totalPossible) * 100 : 0;
  const leftPercent = totalPossible > 0 ? (left / totalPossible) * 100 : 0;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 10;
  const innerRadius = radius * 0.6;

  // Draw completed (green)
  if (completedPercent > 0) {
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (completedPercent / 100) * 2 * Math.PI;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = '#34c759';
    ctx.fill();
  }

  // Draw left (yellow/orange)
  if (leftPercent > 0) {
    const startAngle = -Math.PI / 2 + (completedPercent / 100) * 2 * Math.PI;
    const endAngle = startAngle + (leftPercent / 100) * 2 * Math.PI;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = '#ff9500';
    ctx.fill();
  }

  // Update center text
  const centerDiv = document.getElementById('donutCenter');
  if (centerDiv) {
    centerDiv.innerHTML = `
      <div class="habit-donut-label">COMPLETED</div>
      <div class="habit-donut-value">${completedPercent.toFixed(1)}%</div>
    `;
  }

  // Update legend
  const legend = document.getElementById('donutLegend');
  if (legend) {
    legend.innerHTML = `
      <div class="habit-donut-legend-item">
        <div class="habit-donut-legend-color" style="background: #ff9500;"></div>
        <div class="habit-donut-legend-text">LEFT ${leftPercent.toFixed(1)}%</div>
      </div>
      <div class="habit-donut-legend-item">
        <div class="habit-donut-legend-color" style="background: #34c759;"></div>
        <div class="habit-donut-legend-text">COMPLETED ${completedPercent.toFixed(1)}%</div>
      </div>
    `;
  }
}

// Top 10 Habits
function renderTopHabits() {
  const container = document.getElementById('topHabitsList');
  if (!container) return;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const goal = daysInMonth;

  // Calculate completion percentage for each habit
  const habitStats = habits.map(habit => {
    let actual = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = getDateKey(date);
      if (habitData[habit.id] && habitData[habit.id][dateKey]) {
        actual++;
      }
    }
    const percent = goal > 0 ? Math.round((actual / goal) * 100) : 0;
    return { habit, percent, actual };
  });

  // Sort by percentage (descending) and take top 10
  habitStats.sort((a, b) => b.percent - a.percent);
  const topHabits = habitStats.slice(0, 10);

  container.innerHTML = '';

  if (topHabits.length === 0) {
    container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 2rem;">No habits tracked yet</div>';
    return;
  }

  topHabits.forEach((item, index) => {
    const habitItem = document.createElement('div');
    habitItem.className = 'habit-top-habit-item';
    habitItem.innerHTML = `
      <div class="habit-top-habit-number">${index + 1}.</div>
      <div class="habit-top-habit-name">${item.habit.name}</div>
      <div class="habit-top-habit-percent">${item.percent}%</div>
    `;
    container.appendChild(habitItem);
  });
}

// Weekly Progress Bars
function renderWeeklyProgress() {
  const container = document.getElementById('weeklyProgress');
  if (!container) return;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Group days by weeks
  const weeks = [];
  let currentWeek = [];
  let dayNum = 1;

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    currentWeek.push(null);
  }

  while (dayNum <= daysInMonth) {
    const date = new Date(year, month, dayNum);
    currentWeek.push({ day: dayNum, date: date, dayOfWeek: date.getDay() });

    if (currentWeek.length === 7 || dayNum === daysInMonth) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
    dayNum++;
  }

  container.innerHTML = '';

  weeks.forEach((week, weekIndex) => {
    // Calculate stats for this week
    let weekCompleted = 0;
    let weekTotal = 0;
    const weekDays = week.filter(d => d !== null);
    const weekDates = weekDays.map(d => d.date);
    const maxBarHeight = 100;

    weekDays.forEach(day => {
      const dateKey = getDateKey(day.date);
      habits.forEach(habit => {
        weekTotal++;
        if (habitData[habit.id] && habitData[habit.id][dateKey]) {
          weekCompleted++;
        }
      });
    });

    const weekPercent = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;
    const goal = habits.length * weekDays.length;

    // Get first and last dates
    const firstDate = weekDays[0];
    const lastDate = weekDays[weekDays.length - 1];
    const dateRange = `${firstDate.day}${getDayName(firstDate.dayOfWeek).substring(0, 1)} - ${lastDate.day}${getDayName(lastDate.dayOfWeek).substring(0, 1)}`;

    // Calculate daily values for bars
    const dailyValues = weekDays.map(day => {
      const dateKey = getDateKey(day.date);
      let done = 0;
      habits.forEach(habit => {
        if (habitData[habit.id] && habitData[habit.id][dateKey]) {
          done++;
        }
      });
      return { value: done, max: habits.length, percent: habits.length > 0 ? (done / habits.length) * 100 : 0 };
    });

    const weekCard = document.createElement('div');
    weekCard.className = 'habit-week-card';
    weekCard.innerHTML = `
      <div class="habit-week-header">
        <div class="habit-week-title">WEEK ${weekIndex + 1}</div>
        <div class="habit-week-dates">${dateRange}</div>
      </div>
      <div class="habit-week-days">
        ${weekDays.map(day => `<div class="habit-week-day">${getDayName(day.dayOfWeek)} ${day.day}</div>`).join('')}
      </div>
      <div class="habit-week-bars">
        ${dailyValues.map((day, idx) => `
          <div class="habit-week-bar" style="height: ${(day.percent / 100) * maxBarHeight}px;">
            <div class="habit-week-bar-value">${day.value}</div>
          </div>
        `).join('')}
      </div>
      <div class="habit-week-stats">
        <div class="habit-week-completed">${weekCompleted}/${goal}</div>
        <div class="habit-week-percent">${weekPercent}%</div>
      </div>
    `;
    container.appendChild(weekCard);
  });
}

// Copy from Previous Month
function getPreviousMonthKey() {
  const prevDate = new Date(currentDate);
  prevDate.setMonth(prevDate.getMonth() - 1);
  return `habits_${prevDate.getFullYear()}_${prevDate.getMonth()}`;
}

function openCopyModal() {
  const prevKey = getPreviousMonthKey();
  const stored = localStorage.getItem(prevKey);

  if (!stored) {
    alert('No habits found in the previous month.');
    return;
  }

  const prevData = JSON.parse(stored);
  const prevHabits = prevData.habits || [];
  const prevDate = new Date(currentDate);
  prevDate.setMonth(prevDate.getMonth() - 1);

  if (prevHabits.length === 0) {
    alert('No habits found in the previous month.');
    return;
  }

  document.getElementById('copyMonthInfo').textContent =
    `Select habits to copy from ${getMonthName(prevDate.getMonth())} ${prevDate.getFullYear()}`;

  const list = document.getElementById('copyHabitsList');
  list.innerHTML = '';
  list.dataset.prevHabits = JSON.stringify(prevHabits);

  prevHabits.forEach(habit => {
    const item = document.createElement('div');
    item.className = 'habit-copy-item';
    item.innerHTML = `
      <div class="habit-copy-checkbox checked" data-habit-id="${habit.id}"></div>
      <div class="habit-copy-name">${habit.name}</div>
    `;
    item.querySelector('.habit-copy-checkbox').addEventListener('click', function () {
      this.classList.toggle('checked');
    });
    list.appendChild(item);
  });

  document.getElementById('copyModal').style.display = 'flex';
}

function closeCopyModal() {
  document.getElementById('copyModal').style.display = 'none';
}

function confirmCopyHabits() {
  const list = document.getElementById('copyHabitsList');
  const checkedBoxes = list.querySelectorAll('.habit-copy-checkbox.checked');

  if (checkedBoxes.length === 0) {
    alert('Please select at least one habit to copy.');
    return;
  }

  const prevHabits = JSON.parse(list.dataset.prevHabits);
  const checkedIds = Array.from(checkedBoxes).map(box => box.dataset.habitId);
  const habitsToCopy = prevHabits.filter(h => checkedIds.includes(h.id));

  let copiedCount = 0;

  // Add habits that don't already exist
  habitsToCopy.forEach(prevHabit => {
    const exists = habits.some(h => h.name === prevHabit.name);
    if (!exists) {
      const newHabitId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      habits.push({ id: newHabitId, name: prevHabit.name });
      habitData[newHabitId] = {};
      copiedCount++;
    }
  });

  if (copiedCount === 0) {
    alert('All selected habits already exist in this month.');
  } else {
    saveData();
    renderTable();
    updateSummary();
    renderGraphs();
    alert(`Successfully copied ${copiedCount} habit(s)!`);
  }

  closeCopyModal();
}

// Monthly Statistics
function openStatsModal() {
  renderMonthlyStats();
  document.getElementById('statsModal').style.display = 'flex';
}

function closeStatsModal() {
  document.getElementById('statsModal').style.display = 'none';
}

function renderMonthlyStats() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const totalPossible = habits.length * daysInMonth;

  let completed = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  let bestDay = 0;
  let bestDayDate = '';
  const dailyStats = {};

  // Calculate statistics
  habits.forEach(habit => {
    let habitLongestStreak = 0;
    let tempStreak = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = getDateKey(date);
      const isDone = habitData[habit.id] && habitData[habit.id][dateKey];

      if (isDone) {
        completed++;
        tempStreak++;
        habitLongestStreak = Math.max(habitLongestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }

      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = { done: 0, total: 0 };
      }
      dailyStats[dateKey].total++;
      if (isDone) dailyStats[dateKey].done++;
    }

    longestStreak = Math.max(longestStreak, habitLongestStreak);
  });

  // Find best day
  Object.keys(dailyStats).forEach(dateKey => {
    const percent = (dailyStats[dateKey].done / dailyStats[dateKey].total) * 100;
    if (percent > bestDay) {
      bestDay = percent;
      bestDayDate = dateKey;
    }
  });

  const percent = totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0;

  // Calculate current streak (days from end of month going backwards)
  let streakDays = 0;
  for (let day = daysInMonth; day >= 1; day--) {
    const date = new Date(year, month, day);
    const dateKey = getDateKey(date);
    let allDone = true;

    habits.forEach(habit => {
      if (!habitData[habit.id] || !habitData[habit.id][dateKey]) {
        allDone = false;
      }
    });

    if (allDone && habits.length > 0) {
      streakDays++;
    } else {
      break;
    }
  }
  currentStreak = streakDays;

  // Render stats grid
  const grid = document.getElementById('statsGrid');
  grid.innerHTML = `
    <div class="habit-stat-card">
      <div class="habit-stat-label">Completion Rate</div>
      <div class="habit-stat-value">${percent}%</div>
    </div>
    <div class="habit-stat-card">
      <div class="habit-stat-label">Total Completed</div>
      <div class="habit-stat-value">${completed}</div>
    </div>
    <div class="habit-stat-card">
      <div class="habit-stat-label">Current Streak</div>
      <div class="habit-stat-value">${currentStreak} days</div>
    </div>
    <div class="habit-stat-card">
      <div class="habit-stat-label">Longest Streak</div>
      <div class="habit-stat-value">${longestStreak} days</div>
    </div>
    <div class="habit-stat-card">
      <div class="habit-stat-label">Best Day</div>
      <div class="habit-stat-value">${bestDay.toFixed(0)}%</div>
    </div>
    <div class="habit-stat-card">
      <div class="habit-stat-label">Habits Tracked</div>
      <div class="habit-stat-value">${habits.length}</div>
    </div>
  `;

  // Render year overview
  renderYearOverview();
}

function renderYearOverview() {
  const year = currentDate.getFullYear();
  const container = document.getElementById('yearOverview');
  container.innerHTML = `
    <h4 class="habit-year-title">${year} Overview</h4>
    <div class="habit-year-grid" id="yearGrid"></div>
  `;

  const grid = document.getElementById('yearGrid');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let m = 0; m < 12; m++) {
    const monthKey = `habits_${year}_${m}`;
    const stored = localStorage.getItem(monthKey);
    let percent = 0;

    if (stored) {
      const data = JSON.parse(stored);
      const monthHabits = data.habits || [];
      const monthHabitData = data.habitData || {};
      const daysInMonth = getDaysInMonth(year, m);
      let completed = 0;
      const totalPossible = monthHabits.length * daysInMonth;

      monthHabits.forEach(habit => {
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, m, day);
          const dateKey = getDateKey(date);
          if (monthHabitData[habit.id] && monthHabitData[habit.id][dateKey]) {
            completed++;
          }
        }
      });

      percent = totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0;
    }

    const monthEl = document.createElement('div');
    monthEl.className = `habit-year-month ${m === currentDate.getMonth() ? 'active' : ''}`;
    monthEl.innerHTML = `
      <div class="habit-year-month-name">${monthNames[m]}</div>
      <div class="habit-year-month-value">${percent}%</div>
    `;
    monthEl.addEventListener('click', () => {
      currentDate.setMonth(m);
      loadData();
      renderTable();
      updateSummary();
      renderDailyProgress();
      renderGraphs();
      document.getElementById('currentMonth').textContent = getMonthAndYear(year, m);
      closeStatsModal();
    });
    grid.appendChild(monthEl);
  }
}

// Global functions
function clearAll() {
  if (confirm('Are you sure you want to clear all habits? This cannot be undone.')) {
    localStorage.removeItem(getStorageKey());
    habits = [];
    habitData = {};
    renderTable();
    updateSummary();
    renderDailyProgress();
    renderGraphs();
  }
}

function deleteAllHabits() {
  habits = [];
  habitData = {};
  saveData();
  renderTable();
  updateSummary();
  renderDailyProgress();
  renderGraphs();
}

// Make functions available globally
window.deleteHabit = deleteHabit;
window.deleteAllHabits = deleteAllHabits;
window.closeCopyModal = closeCopyModal;
window.closeStatsModal = closeStatsModal;
window.clearAll = clearAll;

// Handle window resize for graphs
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    renderGraphs();
  }, 250);
});

// Close modals on overlay click (but not when clicking inside modal)
document.getElementById('copyModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'copyModal' || e.target.classList.contains('habit-modal-overlay')) {
    closeCopyModal();
  }
});

document.getElementById('statsModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'statsModal' || e.target.classList.contains('habit-modal-overlay')) {
    closeStatsModal();
  }
});

// Close modals with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (document.getElementById('copyModal').style.display !== 'none') {
      closeCopyModal();
    }
    if (document.getElementById('statsModal').style.display !== 'none') {
      closeStatsModal();
    }
  }
});

// Initialize on load
document.addEventListener('DOMContentLoaded', init);