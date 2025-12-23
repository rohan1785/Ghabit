// Pomodoro Timer for GHabit app

class PomodoroTimer {
  constructor() {
    this.isRunning = false;
    this.isPaused = false;
    this.currentSession = 'work'; // 'work', 'shortBreak', 'longBreak'
    this.sessionCount = 0;
    this.timeLeft = 25 * 60; // 25 minutes in seconds
    this.interval = null;
    
    this.settings = {
      workDuration: 25 * 60,
      shortBreakDuration: 5 * 60,
      longBreakDuration: 15 * 60,
      sessionsUntilLongBreak: 4
    };
    
    this.loadSettings();
  }
  
  loadSettings() {
    const saved = localStorage.getItem('pomodoro_settings');
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
    }
  }
  
  saveSettings() {
    localStorage.setItem('pomodoro_settings', JSON.stringify(this.settings));
  }
  
  start() {
    if (this.isPaused) {
      this.isPaused = false;
    } else {
      this.reset();
    }
    
    this.isRunning = true;
    this.interval = setInterval(() => {
      this.tick();
    }, 1000);
    
    this.updateUI();
  }
  
  pause() {
    this.isRunning = false;
    this.isPaused = true;
    clearInterval(this.interval);
    this.updateUI();
  }
  
  stop() {
    this.isRunning = false;
    this.isPaused = false;
    clearInterval(this.interval);
    this.reset();
    this.updateUI();
  }
  
  reset() {
    this.timeLeft = this.getCurrentSessionDuration();
  }
  
  tick() {
    this.timeLeft--;
    
    if (this.timeLeft <= 0) {
      this.completeSession();
    }
    
    this.updateUI();
  }
  
  completeSession() {
    this.isRunning = false;
    clearInterval(this.interval);
    
    // Show notification
    if (Notification.permission === 'granted') {
      const message = this.currentSession === 'work' 
        ? 'Work session complete! Time for a break.' 
        : 'Break time over! Ready to work?';
      
      new Notification('Pomodoro Timer', {
        body: message,
        icon: '/favicon.ico'
      });
    }
    
    // Auto-advance to next session
    this.advanceSession();
    this.updateUI();
  }
  
  advanceSession() {
    if (this.currentSession === 'work') {
      this.sessionCount++;
      
      if (this.sessionCount % this.settings.sessionsUntilLongBreak === 0) {
        this.currentSession = 'longBreak';
      } else {
        this.currentSession = 'shortBreak';
      }
    } else {
      this.currentSession = 'work';
    }
    
    this.reset();
  }
  
  getCurrentSessionDuration() {
    switch (this.currentSession) {
      case 'work':
        return this.settings.workDuration;
      case 'shortBreak':
        return this.settings.shortBreakDuration;
      case 'longBreak':
        return this.settings.longBreakDuration;
      default:
        return this.settings.workDuration;
    }
  }
  
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  updateUI() {
    // Update timer display if element exists
    const timerDisplay = document.getElementById('pomodoroTimer');
    if (timerDisplay) {
      timerDisplay.textContent = this.formatTime(this.timeLeft);
    }
    
    // Update session indicator
    const sessionIndicator = document.getElementById('pomodoroSession');
    if (sessionIndicator) {
      const sessionNames = {
        work: 'Work',
        shortBreak: 'Short Break',
        longBreak: 'Long Break'
      };
      sessionIndicator.textContent = sessionNames[this.currentSession];
    }
    
    // Update control buttons
    const startBtn = document.getElementById('pomodoroStart');
    const pauseBtn = document.getElementById('pomodoroPause');
    const stopBtn = document.getElementById('pomodoroStop');
    
    if (startBtn) startBtn.style.display = this.isRunning ? 'none' : 'inline-block';
    if (pauseBtn) pauseBtn.style.display = this.isRunning ? 'inline-block' : 'none';
    if (stopBtn) stopBtn.disabled = !this.isRunning && !this.isPaused;
    
    // Update page title
    if (this.isRunning) {
      document.title = `${this.formatTime(this.timeLeft)} - ${this.currentSession === 'work' ? 'Work' : 'Break'} - GHabit`;
    } else {
      document.title = 'GHabit - Productivity Suite';
    }
  }
  
  createWidget() {
    const widget = document.createElement('div');
    widget.className = 'pomodoro-widget';
    widget.innerHTML = `
      <div class="pomodoro-header">
        <span id="pomodoroSession">Work</span>
        <button class="pomodoro-settings-btn" onclick="pomodoroTimer.openSettings()">⚙️</button>
      </div>
      <div class="pomodoro-timer" id="pomodoroTimer">${this.formatTime(this.timeLeft)}</div>
      <div class="pomodoro-controls">
        <button id="pomodoroStart" onclick="pomodoroTimer.start()">Start</button>
        <button id="pomodoroPause" onclick="pomodoroTimer.pause()" style="display:none">Pause</button>
        <button id="pomodoroStop" onclick="pomodoroTimer.stop()">Stop</button>
      </div>
      <div class="pomodoro-sessions">
        Session: ${this.sessionCount}
      </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .pomodoro-widget {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(20px);
        border-radius: var(--radius-lg);
        border: 1px solid rgba(255, 255, 255, 0.15);
        padding: 1rem;
        min-width: 200px;
        z-index: 100;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      }
      
      .pomodoro-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        color: var(--text-secondary);
      }
      
      .pomodoro-settings-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 1rem;
      }
      
      .pomodoro-timer {
        font-size: 2rem;
        font-weight: 700;
        text-align: center;
        color: var(--text);
        margin: 0.5rem 0;
        font-family: 'Courier New', monospace;
      }
      
      .pomodoro-controls {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }
      
      .pomodoro-controls button {
        flex: 1;
        padding: 0.5rem;
        border: none;
        border-radius: var(--radius);
        background: var(--primary);
        color: white;
        cursor: pointer;
        font-size: 0.85rem;
      }
      
      .pomodoro-controls button:hover {
        opacity: 0.8;
      }
      
      .pomodoro-controls button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .pomodoro-sessions {
        text-align: center;
        font-size: 0.8rem;
        color: var(--text-secondary);
      }
    `;
    
    if (!document.getElementById('pomodoroStyles')) {
      style.id = 'pomodoroStyles';
      document.head.appendChild(style);
    }
    
    return widget;
  }
  
  openSettings() {
    // Simple settings modal (can be enhanced)
    const workMins = prompt('Work duration (minutes):', this.settings.workDuration / 60);
    const shortBreakMins = prompt('Short break duration (minutes):', this.settings.shortBreakDuration / 60);
    const longBreakMins = prompt('Long break duration (minutes):', this.settings.longBreakDuration / 60);
    
    if (workMins) this.settings.workDuration = parseInt(workMins) * 60;
    if (shortBreakMins) this.settings.shortBreakDuration = parseInt(shortBreakMins) * 60;
    if (longBreakMins) this.settings.longBreakDuration = parseInt(longBreakMins) * 60;
    
    this.saveSettings();
    this.reset();
    this.updateUI();
  }
}

// Initialize global pomodoro timer
const pomodoroTimer = new PomodoroTimer();

// Add widget to pages that want it
document.addEventListener('DOMContentLoaded', () => {
  // Only add widget to main task pages
  const currentPage = window.location.pathname.split('/').pop();
  const pagesWithPomodoro = ['todolist.html', 'todo.html', 'day-planner.html', 'index.html'];
  
  if (pagesWithPomodoro.includes(currentPage) || currentPage === '') {
    const widget = pomodoroTimer.createWidget();
    document.body.appendChild(widget);
  }
});

// Make globally available
window.PomodoroTimer = PomodoroTimer;
window.pomodoroTimer = pomodoroTimer;