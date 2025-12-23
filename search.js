// Search Manager for GHabit app

class SearchManager {
  static isOpen = false;
  
  static open() {
    if (this.isOpen) return;
    
    this.createSearchModal();
    this.isOpen = true;
  }
  
  static close() {
    const modal = document.getElementById('searchModal');
    if (modal) {
      modal.remove();
    }
    this.isOpen = false;
  }
  
  static createSearchModal() {
    const modal = document.createElement('div');
    modal.id = 'searchModal';
    modal.className = 'search-modal-overlay';
    modal.innerHTML = `
      <div class="search-modal">
        <div class="search-modal-header">
          <input type="text" id="searchInput" class="search-input" placeholder="Search tasks, habits, goals..." autofocus>
          <button class="search-close" onclick="SearchManager.close()">×</button>
        </div>
        <div class="search-results" id="searchResults">
          <div class="search-empty">Start typing to search...</div>
        </div>
      </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .search-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: flex-start;
        justify-content: center;
        z-index: 1000;
        padding: 10vh 2rem 2rem;
      }
      
      .search-modal {
        background: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(30px);
        border-radius: var(--radius-lg);
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        max-width: 600px;
        width: 100%;
        max-height: 70vh;
        overflow: hidden;
      }
      
      .search-modal-header {
        display: flex;
        align-items: center;
        padding: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .search-input {
        flex: 1;
        background: transparent;
        border: none;
        color: var(--text);
        font-size: 1.1rem;
        outline: none;
      }
      
      .search-input::placeholder {
        color: var(--text-secondary);
      }
      
      .search-close {
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
      
      .search-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text);
      }
      
      .search-results {
        max-height: 50vh;
        overflow-y: auto;
        padding: 0.5rem;
      }
      
      .search-empty {
        padding: 2rem;
        text-align: center;
        color: var(--text-secondary);
      }
      
      .search-result {
        padding: 0.75rem;
        border-radius: var(--radius);
        cursor: pointer;
        transition: background 0.2s;
        border: 1px solid transparent;
      }
      
      .search-result:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.1);
      }
      
      .search-result-title {
        font-weight: 600;
        color: var(--text);
        margin-bottom: 0.25rem;
      }
      
      .search-result-meta {
        font-size: 0.85rem;
        color: var(--text-secondary);
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    // Add event listeners
    const input = document.getElementById('searchInput');
    input.addEventListener('input', (e) => this.performSearch(e.target.value));
    
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
  }
  
  static performSearch(query) {
    const resultsContainer = document.getElementById('searchResults');
    
    if (!query.trim()) {
      resultsContainer.innerHTML = '<div class="search-empty">Start typing to search...</div>';
      return;
    }
    
    const results = [];
    
    // Search tasks
    try {
      const tasks = JSON.parse(localStorage.getItem('focus_tasks_v1') || '[]');
      tasks.forEach(task => {
        if (task.title.toLowerCase().includes(query.toLowerCase()) ||
            (task.note && task.note.toLowerCase().includes(query.toLowerCase()))) {
          results.push({
            type: 'task',
            title: task.title,
            meta: `Task • ${task.status}`,
            data: task
          });
        }
      });
    } catch (e) {}
    
    // Search habits
    try {
      const habits = JSON.parse(localStorage.getItem('habits_data') || '{}');
      Object.keys(habits).forEach(month => {
        Object.keys(habits[month]).forEach(habitName => {
          if (habitName.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              type: 'habit',
              title: habitName,
              meta: `Habit • ${month}`,
              data: { name: habitName, month }
            });
          }
        });
      });
    } catch (e) {}
    
    // Search goals
    try {
      const goals = JSON.parse(localStorage.getItem('goals_data') || '[]');
      goals.forEach(goal => {
        if (goal.title.toLowerCase().includes(query.toLowerCase()) ||
            (goal.description && goal.description.toLowerCase().includes(query.toLowerCase()))) {
          results.push({
            type: 'goal',
            title: goal.title,
            meta: `Goal • ${goal.targetDate}`,
            data: goal
          });
        }
      });
    } catch (e) {}
    
    // Render results
    if (results.length === 0) {
      resultsContainer.innerHTML = '<div class="search-empty">No results found</div>';
    } else {
      resultsContainer.innerHTML = results.map(result => `
        <div class="search-result" onclick="SearchManager.openResult('${result.type}', ${JSON.stringify(result.data).replace(/"/g, '&quot;')})">
          <div class="search-result-title">${result.title}</div>
          <div class="search-result-meta">${result.meta}</div>
        </div>
      `).join('');
    }
  }
  
  static openResult(type, data) {
    this.close();
    
    // Navigate based on type
    switch (type) {
      case 'task':
        window.location.href = 'todo.html';
        break;
      case 'habit':
        window.location.href = 'habit.html';
        break;
      case 'goal':
        window.location.href = 'goal-countdown.html';
        break;
    }
  }
}

// Make globally available
window.SearchManager = SearchManager;