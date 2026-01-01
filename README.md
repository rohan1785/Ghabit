# 🎯 GHabit(Complete Productivity Suite)

A modern, feature-rich productivity application with habit tracking, task management, day planning, and motivation tools.

## Features

- **📝 Task Manager** - Organize your daily tasks
- **📅 Calendar View** - Visual planning interface  
- **⏰ Day Planner** - Time-based scheduling
- **🎯 Habit Tracker** - Build healthy habits
- **📊 Matrix View** - Priority management
- **💪 Motivation Hub** - Stay inspired
- **🏆 Goal Countdown** - Track your progress
- **📈 Analytics** - Performance insights

## Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone or download the project**
   ```bash
   git clone <your-repo-url>
   cd ghabit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   - Go to `http://localhost:3000`
   - Your GHabit app is now running! 🎉
   - Main entry point: Todo List with Pomodoro Timer

## 📁 Project Structure

```
ghabit/
├── data/                  # Data storage
│   ├── tasks.json         # Task data
│   ├── habits.json        # Habit data
│   ├── goals.json         # Goal data
│   └── profile.json       # Profile data
├── todolist.html          # Main todo list page
├── habit.html             # Habit tracker
├── todo.html              # Day planner
├── calendar.html          # Calendar view
├── matrix.html            # Matrix view
├── motivation.html        # Motivation hub
├── goal-countdown.html    # Goal countdown
├── style.css              # Main styles
├── theme.css              # Theme variables
├── *-styles.css           # Page-specific styles
├── *.js                   # JavaScript files
├── server.js              # Express server
├── package.json           # Project configuration
└── README.md              # This file
```

## 🎯 How to Use

### Habit Tracker
1. Navigate to the Habit Tracker page
2. Add new habits using the input field
3. Click checkboxes to mark habits as complete
4. Navigate between months using arrow buttons
5. View your progress and statistics

### Task Manager
1. Go to the Task Manager page
2. Add tasks with descriptions and time estimates
3. Mark tasks as complete when done
4. Organize tasks by priority

### Other Features
- **Calendar View**: Visual overview of your schedule
- **Day Planner**: Time-blocked planning
- **Analytics**: Track your productivity metrics

## 🛠️ Development

### Running in Development Mode
```bash
npm run dev
```

### File Structure
- **Frontend**: HTML, CSS, and vanilla JavaScript
- **Backend**: Express.js server for static file serving
- **Storage**: LocalStorage for data persistence

## 🎨 Customization

### Themes
The app supports dark and light themes. Toggle using the theme button in the header.

### Adding New Features
1. Create HTML page in root folder
2. Add corresponding JavaScript and CSS files
3. Update navigation in `todolist.html`

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🤝 Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Rohan Patil**
- Instagram: [@rohanpatil.09_](https://www.instagram.com/rohanpatil.09_)

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by productivity methodologies
- Designed for daily use and habit formation

---

**Happy Habit Building! 🎯**
