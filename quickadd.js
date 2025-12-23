// Quick Add functionality for GHabit app

class QuickAdd {
  static isOpen = false;
  
  static init() {
    // Add global keyboard shortcut
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+A for quick add
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        this.open();
      }
    });
  }
  
  static open() {
    if (this.isOpen) return;
    
    this.createQuickAddModal();
    this.isOpen = true;
  }
  
  static close() {
    const modal = document.getElementById('quickAddModal');
    if (modal) {
      modal.remove();
    }
    this.isOpen = false;
  }
  
  static createQuickAddModal() {
    const modal = document.createElement('div');
    modal.id = 'quickAddModal';
    modal.className = 'quick-add-overlay';
    modal.innerHTML = `
      <div class="quick-add-modal">
        <div class="quick-add-header">
          <h3>Quick Add</h3>
          <button class="quick-add-close" onclick="QuickAdd.close()">×</button>
        </div>
        <div class="quick-add-body">
          <div class="quick-add-tabs">
            <button class="quick-add-tab active" data-tab="task">Task</button>
            <button class="quick-add-tab" data-tab="habit">Habit</button>
            <button class="quick-add-tab" data-tab="goal">Goal</button>
          </div>
          
          <div class="quick-add-content">
            <!-- Task Form -->
            <div class="quick-add-form active" data-form="task">
              <input type="text" id="quickTaskTitle" placeholder="Task title" class="quick-add-input">
              <textarea id="quickTaskNote" placeholder="Notes (optional)" class="quick-add-textarea"></textarea>
              <div class="quick-add-row">
                <select id="quickTaskPriority" class="quick-add-select">
                  <option value="NINU">No Priority</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
                <div class="quick-add-time">
                  <input type="number" id="quickTaskHours" placeholder="H" min="0" class="quick-add-time-input">
                  <input type="number" id="quickTaskMinutes" placeholder="M" min="0" max="59" class="quick-add-time-input">
                </div>
              </div>
              <button onclick="QuickAdd.addTask()" class="quick-add-submit">Add Task</button>
            </div>
            
            <!-- Habit Form -->
            <div class="quick-add-form" data-form="habit">
              <input type="text" id="quickHabitName" placeholder="Habit name" class="quick-add-input">
              <button onclick="QuickAdd.addHabit()" class="quick-add-submit">Add Habit</button>
            </div>
            
            <!-- Goal Form -->
            <div class="quick-add-form" data-form="goal">
              <input type="text" id="quickGoalTitle" placeholder="Goal title" class="quick-add-input">
              <textarea id="quickGoalDescription" placeholder="Description (optional)" class="quick-add-textarea"></textarea>
              <input type="date" id="quickGoalDate" class="quick-add-input">
              <button onclick="QuickAdd.addGoal()" class="quick-add-submit">Add Goal</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .quick-add-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 2rem;
      }
      
      .quick-add-modal {
        background: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(30px);
        border-radius: var(--radius-lg);
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        max-width: 500px;
        width: 100%;
        max-height: 80vh;
        overflow: hidden;
      }
      
      .quick-add-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .quick-add-header h3 {
        margin: 0;
        color: var(--text);
        font-size: 1.25rem;
      }
      
      .quick-add-close {
        background: transparent;
        border: none;
        color: var(--text-secondary);
        font-size: 1.5rem;
        cursor: pointer;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius);
      }
      
      .quick-add-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text);
      }
      
      .quick-add-body {
        padding: 1.5rem;
      }
      
      .quick-add-tabs {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
      }
      
      .quick-add-tab {
        flex: 1;
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: var(--radius);
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .quick-add-tab.active {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
      }
      
      .quick-add-form {
        display: none;
      }
      
      .quick-add-form.active {
        display: block;
      }
      
      .quick-add-input,
      .quick-add-textarea,
      .quick-add-select {
        width: 100%;
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: var(--radius);
        color: var(--text);
        margin-bottom: 1rem;
        font-family: inherit;
      }
      
      .quick-add-textarea {
        resize: vertical;
        min-height: 80px;
      }
      
      .quick-add-row {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
      }
      
      .quick-add-time {
        display: flex;
        gap: 0.5rem;
      }
      
      .quick-add-time-input {
        width: 60px;
        padding: 0.75rem 0.5rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: var(--radius);
        color: var(--text);
        text-align: center;
      }
      
      .quick-add-submit {
        width: 100%;
        padding: 0.75rem;
        background: var(--primary);
        border: none;
        border-radius: var(--radius);
        color: white;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .quick-add-submit:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(10, 132, 255, 0.4);
      }
    `;
    
    if (!document.getElementById('quickAddStyles')) {
      style.id = 'quickAddStyles';
      document.head.appendChild(style);
    }
    
    document.body.appendChild(modal);
    
    // Add tab switching
    modal.querySelectorAll('.quick-add-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        // Update active tab
        modal.querySelectorAll('.quick-add-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update active form
        modal.querySelectorAll('.quick-add-form').forEach(f => f.classList.remove('active'));
        modal.querySelector(`[data-form="${tabName}"]`).classList.add('active');
      });
    });
    
    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.close();
      }
    });
    
    // Focus first input
    setTimeout(() => {
      const firstInput = modal.querySelector('.quick-add-input');
      if (firstInput) firstInput.focus();
    }, 100);
  }
  
  static addTask() {
    const title = document.getElementById('quickTaskTitle').value.trim();
    if (!title) {
      alert('Please enter a task title');
      return;
    }
    
    const task = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      title,
      note: document.getElementById('quickTaskNote').value.trim(),
      priority: document.getElementById('quickTaskPriority').value,
      status: 'active',
      hours: parseInt(document.getElementById('quickTaskHours').value) || 0,
      minutes: parseInt(document.getElementById('quickTaskMinutes').value) || 0,
      estimatedMinutes: (parseInt(document.getElementById('quickTaskHours').value) || 0) * 60 + (parseInt(document.getElementById('quickTaskMinutes').value) || 0),
      dateKey: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    
    // Add to localStorage
    try {
      const tasks = JSON.parse(localStorage.getItem('focus_tasks_v1') || '[]');
      tasks.unshift(task);
      localStorage.setItem('focus_tasks_v1', JSON.stringify(tasks));
      
      this.close();
      alert('Task added successfully!');
      
      // Refresh current page if it's a task page
      const currentPage = window.location.pathname.split('/').pop();
      if (['todolist.html', 'todo.html', 'day-planner.html', 'index.html'].includes(currentPage) || currentPage === '') {
        window.location.reload();
      }
    } catch (error) {
      alert('Failed to add task. Please try again.');
    }
  }
  
  static addHabit() {
    const name = document.getElementById('quickHabitName').value.trim();
    if (!name) {
      alert('Please enter a habit name');
      return;
    }
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    try {
      const habits = JSON.parse(localStorage.getItem('habits_data') || '{}');
      if (!habits[currentMonth]) habits[currentMonth] = {};
      habits[currentMonth][name] = {};
      
      localStorage.setItem('habits_data', JSON.stringify(habits));
      
      this.close();
      alert('Habit added successfully!');
      
      // Refresh if on habit page
      if (window.location.pathname.includes('habit.html')) {
        window.location.reload();
      }
    } catch (error) {
      alert('Failed to add habit. Please try again.');
    }
  }
  
  static addGoal() {
    const title = document.getElementById('quickGoalTitle').value.trim();
    const targetDate = document.getElementById('quickGoalDate').value;
    
    if (!title) {
      alert('Please enter a goal title');
      return;
    }
    
    if (!targetDate) {
      alert('Please select a target date');
      return;
    }
    
    const goal = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      title,
      description: document.getElementById('quickGoalDescription').value.trim(),
      targetDate,
      createdAt: new Date().toISOString()
    };
    
    try {
      const goals = JSON.parse(localStorage.getItem('goals_data') || '[]');
      goals.push(goal);
      localStorage.setItem('goals_data', JSON.stringify(goals));
      
      this.close();
      alert('Goal added successfully!');
      
      // Refresh if on goal page
      if (window.location.pathname.includes('goal-countdown.html')) {
        window.location.reload();
      }
    } catch (error) {
      alert('Failed to add goal. Please try again.');
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  QuickAdd.init();
});

// Make globally available
window.QuickAdd = QuickAdd;