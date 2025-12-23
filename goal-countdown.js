// Global variables
let goals = [];
let editingGoalId = null;
let selectedGoalId = null;

// DOM elements
const goalsGrid = document.getElementById('goalsGrid');
const goalTitle = document.getElementById('goalTitle');
const goalDescription = document.getElementById('goalDescription');
const goalDeadline = document.getElementById('goalDeadline');
const goalCategory = document.getElementById('goalCategory');
const addGoalBtn = document.getElementById('addGoalBtn');
const emptyState = document.getElementById('emptyState');
const goalModal = document.getElementById('goalModal');

// Initialize Goal Countdown
class GoalCountdown {
    constructor() {
        this.goals = JSON.parse(localStorage.getItem('goals')) || [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderGoals();
        this.startCountdownUpdates();
        this.setMinDate();
    }

    setupEventListeners() {
        addGoalBtn?.addEventListener('click', () => this.addGoal());
        
        // Enter key to add goal
        [goalTitle, goalDescription, goalDeadline].forEach(input => {
            input?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addGoal();
            });
        });
    }

    setMinDate() {
        const today = new Date().toISOString().split('T')[0];
        if (goalDeadline) {
            goalDeadline.min = today;
        }
    }

    addGoal() {
        const title = goalTitle?.value.trim();
        const description = goalDescription?.value.trim();
        const deadline = goalDeadline?.value;
        const category = goalCategory?.value || 'personal';
        
        if (!title || !deadline) {
            alert('Please fill in the title and deadline');
            return;
        }
        
        if (editingGoalId) {
            // Update existing goal
            const goal = this.goals.find(g => g.id === editingGoalId);
            if (goal) {
                goal.title = title;
                goal.description = description;
                goal.deadline = deadline;
                goal.category = category;
                goal.updatedAt = new Date().toISOString();
            }
            editingGoalId = null;
            addGoalBtn.textContent = 'Add Goal';
        } else {
            // Create new goal
            const goal = {
                id: Date.now(),
                title,
                description,
                deadline,
                category,
                completed: false,
                createdAt: new Date().toISOString()
            };
            this.goals.push(goal);
        }
        
        this.saveGoals();
        this.renderGoals();
        this.clearForm();
    }

    clearForm() {
        if (goalTitle) goalTitle.value = '';
        if (goalDescription) goalDescription.value = '';
        if (goalDeadline) goalDeadline.value = '';
        if (goalCategory) goalCategory.value = '';
        
        // Reset editing state
        editingGoalId = null;
        if (addGoalBtn) addGoalBtn.textContent = 'Add Goal';
    }

    editGoal(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) return;
        
        if (goalTitle) goalTitle.value = goal.title;
        if (goalDescription) goalDescription.value = goal.description || '';
        if (goalDeadline) goalDeadline.value = goal.deadline;
        if (goalCategory) goalCategory.value = goal.category;
        
        editingGoalId = goalId;
        addGoalBtn.textContent = 'Update Goal';
        
        goalTitle?.focus();
    }

    deleteGoal(goalId) {
        if (confirm('Are you sure you want to delete this goal?')) {
            this.goals = this.goals.filter(g => g.id !== goalId);
            this.saveGoals();
            this.renderGoals();
            this.closeGoalModal();
        }
    }

    markGoalComplete(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            goal.completed = true;
            goal.completedAt = new Date().toISOString();
            this.saveGoals();
            this.renderGoals();
            this.closeGoalModal();
        }
    }

    openGoalModal(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) return;
        
        selectedGoalId = goalId;
        
        // Update modal content
        const modalTitle = document.getElementById('goalModalTitle');
        const modalInfo = document.getElementById('goalModalInfo');
        const modalProgress = document.getElementById('goalModalProgress');
        const modalProgressText = document.getElementById('goalModalProgressText');
        
        if (modalTitle) modalTitle.textContent = goal.title;
        
        if (modalInfo) {
            const timeRemaining = this.calculateTimeRemaining(goal.deadline);
            const progress = this.getProgressPercentage(goal.createdAt, goal.deadline);
            
            modalInfo.innerHTML = `
                <div class="goal-detail">
                    <strong>Description:</strong>
                    <p>${goal.description || 'No description provided'}</p>
                </div>
                <div class="goal-detail">
                    <strong>Category:</strong>
                    <p>${this.getCategoryIcon(goal.category)} ${goal.category}</p>
                </div>
                <div class="goal-detail">
                    <strong>Deadline:</strong>
                    <p>${this.formatDate(goal.deadline)}</p>
                </div>
                <div class="goal-detail">
                    <strong>Time Remaining:</strong>
                    <p class="${timeRemaining.expired ? 'expired' : ''}">${timeRemaining.text}</p>
                </div>
                <div class="goal-detail">
                    <strong>Status:</strong>
                    <p class="${goal.completed ? 'completed' : 'active'}">
                        ${goal.completed ? '✅ Completed' : '🎯 Active'}
                    </p>
                </div>
            `;
        }
        
        // Update progress ring
        if (modalProgressText) {
            const progress = this.getProgressPercentage(goal.createdAt, goal.deadline);
            modalProgressText.textContent = `${progress}%`;
        }
        
        goalModal?.classList.add('active');
    }

    closeGoalModal() {
        goalModal?.classList.remove('active');
        selectedGoalId = null;
    }

    renderGoals() {
        if (!goalsGrid) return;
        
        if (this.goals.length === 0) {
            goalsGrid.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        goalsGrid.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';
        
        // Sort goals by deadline
        const sortedGoals = [...this.goals].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        
        goalsGrid.innerHTML = sortedGoals.map(goal => {
            const timeRemaining = this.calculateTimeRemaining(goal.deadline);
            const progress = this.getProgressPercentage(goal.createdAt, goal.deadline);
            const isExpired = timeRemaining.expired;
            const isCompleted = goal.completed;
            
            return `
                <div class="goal-card ${isExpired ? 'expired' : ''} ${isCompleted ? 'completed' : ''}" 
                     onclick="goalCountdown.openGoalModal(${goal.id})">
                    <div class="goal-card-header">
                        <h3 class="goal-card-title">${goal.title}</h3>
                        <div class="goal-actions" onclick="event.stopPropagation()">
                            <button class="btn-icon" onclick="goalCountdown.editGoal(${goal.id})" title="Edit goal">✏️</button>
                            <button class="btn-icon" onclick="goalCountdown.deleteGoal(${goal.id})" title="Delete goal">🗑️</button>
                        </div>
                    </div>
                    
                    ${goal.description ? `<p class="goal-description">${goal.description}</p>` : ''}
                    
                    <div class="goal-category">
                        <span class="category-badge">${this.getCategoryIcon(goal.category)} ${goal.category}</span>
                    </div>
                    
                    <div class="goal-deadline">
                        <span class="deadline-label">Target Date:</span>
                        <span class="deadline-value">${this.formatDate(goal.deadline)}</span>
                    </div>
                    
                    <div class="countdown-display ${isExpired ? 'expired' : ''} ${isCompleted ? 'completed' : ''}">
                        <div class="countdown-icon">${isCompleted ? '🎉' : isExpired ? '⏰' : '⏳'}</div>
                        <div class="countdown-text">
                            ${isCompleted ? 'Completed!' : timeRemaining.text}
                        </div>
                    </div>
                    
                    <div class="goal-progress">
                        <div class="progress-bar">
                            <div class="progress-fill ${isExpired ? 'expired' : ''} ${isCompleted ? 'completed' : ''}" 
                                 style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-info">
                            <span class="progress-percentage">${progress}%</span>
                            <span class="progress-label">
                                ${isCompleted ? 'Completed' : isExpired ? 'Time expired' : 'Time elapsed'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="goal-meta">
                        <span class="created-date">Created: ${this.formatDate(goal.createdAt)}</span>
                        ${goal.completedAt ? `<span class="completed-date">Completed: ${this.formatDate(goal.completedAt)}</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    calculateTimeRemaining(deadline) {
        const now = new Date();
        const target = new Date(deadline);
        const diff = target - now;
        
        if (diff <= 0) {
            return { expired: true, text: 'Goal deadline has passed' };
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
            return { expired: false, text: `${days} days, ${hours} hours remaining` };
        } else if (hours > 0) {
            return { expired: false, text: `${hours} hours, ${minutes} minutes remaining` };
        } else {
            return { expired: false, text: `${minutes} minutes remaining` };
        }
    }

    getProgressPercentage(createdAt, deadline) {
        const created = new Date(createdAt);
        const target = new Date(deadline);
        const now = new Date();
        
        const totalTime = target - created;
        const elapsedTime = now - created;
        
        if (totalTime <= 0) return 100;
        
        const percentage = Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
        return Math.round(percentage);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    getCategoryIcon(category) {
        const icons = {
            personal: '🎯',
            work: '💼',
            health: '🏥',
            learning: '📚',
            finance: '💰',
            travel: '✈️'
        };
        return icons[category] || '🎯';
    }

    startCountdownUpdates() {
        // Update countdown every minute
        setInterval(() => {
            this.renderGoals();
        }, 60000);
    }

    saveGoals() {
        localStorage.setItem('goals', JSON.stringify(this.goals));
    }
}

// Global functions
function clearAll() {
    if (confirm('Are you sure you want to clear all goals? This cannot be undone.')) {
        localStorage.removeItem('goals');
        if (window.goalCountdown) {
            window.goalCountdown.goals = [];
            window.goalCountdown.renderGoals();
        }
    }
}

function closeGoalModal() {
    if (window.goalCountdown) {
        window.goalCountdown.closeGoalModal();
    }
}

function markGoalComplete() {
    if (window.goalCountdown && selectedGoalId) {
        window.goalCountdown.markGoalComplete(selectedGoalId);
    }
}

function deleteGoal() {
    if (window.goalCountdown && selectedGoalId) {
        window.goalCountdown.deleteGoal(selectedGoalId);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.goalCountdown = new GoalCountdown();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch(e.key) {
        case 'n':
        case 'N':
            e.preventDefault();
            goalTitle?.focus();
            break;
        case 'Escape':
            closeGoalModal();
            break;
    }
});