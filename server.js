const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Data storage paths
const DATA_DIR = path.join(__dirname, 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const HABITS_FILE = path.join(DATA_DIR, 'habits.json');
const GOALS_FILE = path.join(DATA_DIR, 'goals.json');
const PROFILE_FILE = path.join(DATA_DIR, 'profile.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Initialize data files
async function initializeDataFiles() {
  await ensureDataDir();
  
  const files = [
    { path: TASKS_FILE, data: {} },
    { path: HABITS_FILE, data: {} },
    { path: GOALS_FILE, data: [] },
    { path: PROFILE_FILE, data: { name: 'User', stats: {} } }
  ];

  for (const file of files) {
    try {
      await fs.access(file.path);
    } catch {
      await fs.writeFile(file.path, JSON.stringify(file.data, null, 2));
    }
  }
}

// Generic file operations
async function readDataFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function writeDataFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Routes

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'todolist.html'));
});

// Tasks API
app.get('/api/tasks/:date?', async (req, res) => {
  try {
    const tasks = await readDataFile(TASKS_FILE) || {};
    const date = req.params.date || new Date().toISOString().split('T')[0];
    res.json(tasks[date] || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read tasks' });
  }
});

app.post('/api/tasks/:date', async (req, res) => {
  try {
    const tasks = await readDataFile(TASKS_FILE) || {};
    const date = req.params.date;
    
    if (!tasks[date]) tasks[date] = [];
    
    const newTask = {
      id: Date.now().toString(),
      title: req.body.title,
      note: req.body.note || '',
      priority: req.body.priority || 'NINU',
      status: 'active',
      estimatedTime: req.body.estimatedTime || { hours: 0, minutes: 0 },
      createdAt: new Date().toISOString(),
      ...req.body
    };
    
    tasks[date].push(newTask);
    await writeDataFile(TASKS_FILE, tasks);
    res.json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/api/tasks/:date/:id', async (req, res) => {
  try {
    const tasks = await readDataFile(TASKS_FILE) || {};
    const { date, id } = req.params;
    
    if (tasks[date]) {
      const taskIndex = tasks[date].findIndex(t => t.id === id);
      if (taskIndex !== -1) {
        tasks[date][taskIndex] = { ...tasks[date][taskIndex], ...req.body };
        await writeDataFile(TASKS_FILE, tasks);
        res.json(tasks[date][taskIndex]);
      } else {
        res.status(404).json({ error: 'Task not found' });
      }
    } else {
      res.status(404).json({ error: 'Date not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/tasks/:date/:id', async (req, res) => {
  try {
    const tasks = await readDataFile(TASKS_FILE) || {};
    const { date, id } = req.params;
    
    if (tasks[date]) {
      tasks[date] = tasks[date].filter(t => t.id !== id);
      await writeDataFile(TASKS_FILE, tasks);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Date not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Habits API
app.get('/api/habits/:month?', async (req, res) => {
  try {
    const habits = await readDataFile(HABITS_FILE) || {};
    const month = req.params.month || new Date().toISOString().slice(0, 7);
    res.json(habits[month] || {});
  } catch (error) {
    res.status(500).json({ error: 'Failed to read habits' });
  }
});

app.post('/api/habits/:month', async (req, res) => {
  try {
    const habits = await readDataFile(HABITS_FILE) || {};
    const month = req.params.month;
    
    if (!habits[month]) habits[month] = {};
    
    const habitName = req.body.name;
    if (!habits[month][habitName]) {
      habits[month][habitName] = {};
    }
    
    await writeDataFile(HABITS_FILE, habits);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create habit' });
  }
});

app.put('/api/habits/:month/:habit/:date', async (req, res) => {
  try {
    const habits = await readDataFile(HABITS_FILE) || {};
    const { month, habit, date } = req.params;
    
    if (!habits[month]) habits[month] = {};
    if (!habits[month][habit]) habits[month][habit] = {};
    
    habits[month][habit][date] = req.body.completed;
    await writeDataFile(HABITS_FILE, habits);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update habit' });
  }
});

// Goals API
app.get('/api/goals', async (req, res) => {
  try {
    const goals = await readDataFile(GOALS_FILE) || [];
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read goals' });
  }
});

app.post('/api/goals', async (req, res) => {
  try {
    const goals = await readDataFile(GOALS_FILE) || [];
    
    const newGoal = {
      id: Date.now().toString(),
      title: req.body.title,
      targetDate: req.body.targetDate,
      description: req.body.description || '',
      createdAt: new Date().toISOString(),
      ...req.body
    };
    
    goals.push(newGoal);
    await writeDataFile(GOALS_FILE, goals);
    res.json(newGoal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

app.put('/api/goals/:id', async (req, res) => {
  try {
    const goals = await readDataFile(GOALS_FILE) || [];
    const goalIndex = goals.findIndex(g => g.id === req.params.id);
    
    if (goalIndex !== -1) {
      goals[goalIndex] = { ...goals[goalIndex], ...req.body };
      await writeDataFile(GOALS_FILE, goals);
      res.json(goals[goalIndex]);
    } else {
      res.status(404).json({ error: 'Goal not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

app.delete('/api/goals/:id', async (req, res) => {
  try {
    const goals = await readDataFile(GOALS_FILE) || [];
    const filteredGoals = goals.filter(g => g.id !== req.params.id);
    await writeDataFile(GOALS_FILE, filteredGoals);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

// Profile API
app.get('/api/profile', async (req, res) => {
  try {
    const profile = await readDataFile(PROFILE_FILE) || { name: 'User', stats: {} };
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read profile' });
  }
});

app.put('/api/profile', async (req, res) => {
  try {
    const profile = await readDataFile(PROFILE_FILE) || { name: 'User', stats: {} };
    const updatedProfile = { ...profile, ...req.body };
    await writeDataFile(PROFILE_FILE, updatedProfile);
    res.json(updatedProfile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Clear all data
app.delete('/api/clear-all', async (req, res) => {
  try {
    await writeDataFile(TASKS_FILE, {});
    await writeDataFile(HABITS_FILE, {});
    await writeDataFile(GOALS_FILE, []);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear data' });
  }
});

// Initialize and start server
async function startServer() {
  await initializeDataFiles();
  
  app.listen(PORT, () => {
    console.log(`🎯 GHabit server running on http://localhost:${PORT}`);
    console.log('📝 All features working:');
    console.log('  - Task Manager with data persistence');
    console.log('  - Habit Tracker with monthly data');
    console.log('  - Goal Countdown with progress tracking');
    console.log('  - Profile Management');
    console.log('  - Day Planner');
    console.log('  - Calendar View');
    console.log('  - Matrix View');
    console.log('  - Motivation Hub');
    console.log('📁 Data stored in: ./data/');
  });
}

startServer().catch(console.error);