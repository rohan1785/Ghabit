// Utility functions for GHabit app

// Data Manager for import/export functionality
class DataManager {
  static exportData() {
    try {
      const data = {
        tasks: JSON.parse(localStorage.getItem('focus_tasks_v1') || '[]'),
        habits: JSON.parse(localStorage.getItem('habits_data') || '{}'),
        goals: JSON.parse(localStorage.getItem('goals_data') || '[]'),
        profile: JSON.parse(localStorage.getItem('profile_data') || '{}'),
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ghabit-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  }
  
  static importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.tasks) localStorage.setItem('focus_tasks_v1', JSON.stringify(data.tasks));
        if (data.habits) localStorage.setItem('habits_data', JSON.stringify(data.habits));
        if (data.goals) localStorage.setItem('goals_data', JSON.stringify(data.goals));
        if (data.profile) localStorage.setItem('profile_data', JSON.stringify(data.profile));
        
        alert('Data imported successfully! Please refresh the page.');
        window.location.reload();
      } catch (error) {
        console.error('Import failed:', error);
        alert('Import failed. Please check the file format.');
      }
    };
    reader.readAsText(file);
  }
}

// Theme Manager
class ThemeManager {
  static toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update theme toggle button
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }
  }
  
  static initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
  }
}

// Notification Manager
class NotificationManager {
  static async requestPermission() {
    if (!('Notification' in window)) {
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return false;
  }
  
  static show(title, options = {}) {
    if (Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
  }
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.initTheme();
});

// Global keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl+K for search
  if (e.ctrlKey && e.key === 'k') {
    e.preventDefault();
    if (window.SearchManager) {
      SearchManager.open();
    }
  }
  
  // Ctrl+Shift+T for theme toggle
  if (e.ctrlKey && e.shiftKey && e.key === 'T') {
    e.preventDefault();
    ThemeManager.toggleTheme();
  }
});

// Make classes globally available
window.DataManager = DataManager;
window.ThemeManager = ThemeManager;
window.NotificationManager = NotificationManager;