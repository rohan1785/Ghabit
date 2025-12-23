// Motivation View JavaScript
let motivationData = [];
let currentPlayingVideo = null;

// Sample motivation data with Instagram reels
const sampleMotivationData = [
  {
    id: 1,
    quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    videoUrl: "https://www.instagram.com/reel/C-KMJN7vitX/?igsh=MTVjdGF2MGg3NmNkNw==",
    tags: ["success", "courage", "persistence"]
  },
  {
    id: 2,
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    videoUrl: "https://www.instagram.com/reel/DFP6bRvPbcn/?igsh=OTNmOWp0MmE3dWZo",
    tags: ["passion", "work", "excellence"]
  },
  {
    id: 3,
    quote: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
    videoUrl: "https://www.instagram.com/reel/DPIzoyWkZJZ/?igsh=aDdrazc1OTBmY3J2",
    tags: ["persistence", "time", "action"]
  },
  {
    id: 4,
    quote: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    videoUrl: "https://www.instagram.com/reel/DLKb0orRs2o/?igsh=bnQyY243Zm94N3gw",
    tags: ["dreams", "future", "belief"]
  },
  {
    id: 5,
    quote: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle",
    videoUrl: "https://www.instagram.com/reel/DPf-t2CkvNp/?igsh=Zm41enhqc2diMmow",
    tags: ["hope", "focus", "strength"]
  },
  {
    id: 6,
    quote: "Whether you think you can or you think you can't, you're right.",
    author: "Henry Ford",
    videoUrl: "https://www.instagram.com/reel/DP32K5RE6M3/?igsh=aTFlcnlzNnN0MGsw",
    tags: ["mindset", "belief", "attitude"]
  },
  {
    id: 7,
    quote: "Success is walking from failure to failure with no loss of enthusiasm.",
    author: "Winston Churchill",
    videoUrl: "https://www.instagram.com/reel/DKcE-SGPDYU/?igsh=NmlzcGx6OW9uNGth",
    tags: ["resilience", "failure", "enthusiasm"]
  },
  {
    id: 8,
    quote: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
    videoUrl: "https://www.instagram.com/reel/DKmVB6-TTqM/?igsh=YjI2bzdiamRpc3dp",
    tags: ["journey", "beginning", "action"]
  },
  {
    id: 9,
    quote: "Your limitation—it's only your imagination.",
    author: "Unknown",
    videoUrl: "https://www.instagram.com/reel/DQtOqDCkRYh/?igsh=eWZuMGVheWx4NjVk",
    tags: ["imagination", "limits", "potential"]
  },
  {
    id: 10,
    quote: "Great things never come from comfort zones.",
    author: "Anonymous",
    videoUrl: "https://www.instagram.com/reel/DKKSuhrTCNk/?igsh=OTJkOWIyd2I2YWZ5",
    tags: ["comfort", "growth", "challenge"]
  },
  {
    id: 11,
    quote: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    videoUrl: "https://www.instagram.com/reel/DEM9vPZz4Eg/?igsh=MTl5c29pZmF2Nm1pZA==",
    tags: ["action", "start", "doing"]
  },
  {
    id: 12,
    quote: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs",
    videoUrl: "https://www.instagram.com/reel/DB3FRo_vZDy/?igsh=cDh1eDhjb2N6c3Z4",
    tags: ["innovation", "leadership", "creativity"]
  },
  {
    id: 13,
    quote: "Life is what happens to you while you're busy making other plans.",
    author: "John Lennon",
    videoUrl: "https://www.instagram.com/reel/C7t9rhItDGv/?igsh=bHdrdXhjNjBua2Vn",
    tags: ["life", "present", "mindfulness"]
  },
  {
    id: 14,
    quote: "The future depends on what you do today.",
    author: "Mahatma Gandhi",
    videoUrl: "https://www.instagram.com/reel/DOXzpBhjyo8/?igsh=MXdoeHB0dzFhcDJxYg==",
    tags: ["future", "today", "action"]
  },
  {
    id: 15,
    quote: "It is never too late to be what you might have been.",
    author: "George Eliot",
    videoUrl: "https://www.instagram.com/reel/DIHQob4o3zj/?igsh=MWYwOXBzdmYyZ25heA==",
    tags: ["potential", "change", "growth"]
  },
  {
    id: 16,
    quote: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson",
    videoUrl: "https://www.instagram.com/reel/DPL6yMhEh9i/?igsh=cjFxaTQybTZjdXp6",
    tags: ["destiny", "choice", "self"]
  },
  {
    id: 17,
    quote: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    videoUrl: "https://www.instagram.com/reel/C3FboT8vMCQ/?igsh=MWkxNm1nZHlnYnhzbQ==",
    tags: ["belief", "confidence", "success"]
  },
  {
    id: 18,
    quote: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb",
    videoUrl: "https://www.instagram.com/reel/DQvzbHQkQPs/?igsh=MWlzMHA1cTdoaWpkMg==",
    tags: ["timing", "action", "now"]
  },
  {
    id: 19,
    quote: "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs",
    videoUrl: "https://www.instagram.com/reel/DJMUEFktsPD/?igsh=dXkzOHJjaTJlNDBi",
    tags: ["time", "authenticity", "life"]
  },
  {
    id: 20,
    quote: "If you want to lift yourself up, lift up someone else.",
    author: "Booker T. Washington",
    videoUrl: "https://www.instagram.com/reel/C9pQMesPmSB/?igsh=NDc5czU4bnRyYXh6",
    tags: ["help", "kindness", "growth"]
  },
  {
    id: 21,
    quote: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    author: "Nelson Mandela",
    videoUrl: "https://www.instagram.com/reel/DAiorISv2kr/?igsh=MXVqbmlybWFhNG1kMA==",
    tags: ["resilience", "recovery", "strength"]
  },
  {
    id: 22,
    quote: "In the end, we will remember not the words of our enemies, but the silence of our friends.",
    author: "Martin Luther King Jr.",
    videoUrl: "https://www.instagram.com/reel/DQgaELxETWx/?igsh=bmVwMDlzNHVhMnhh",
    tags: ["friendship", "courage", "voice"]
  },
  {
    id: 23,
    quote: "The purpose of our lives is to be happy.",
    author: "Dalai Lama",
    videoUrl: "https://www.instagram.com/reel/DDHIRsIsfeq/?igsh=MTI4YTNjNTV5dW1icA==",
    tags: ["happiness", "purpose", "life"]
  },
  {
    id: 24,
    quote: "Life is really simple, but we insist on making it complicated.",
    author: "Confucius",
    videoUrl: "https://www.instagram.com/reel/DEAME9JSNK6/?igsh=ZnZ6bGwyZzB6aDNr",
    tags: ["simplicity", "life", "wisdom"]
  },
  {
    id: 25,
    quote: "The way I see it, if you want the rainbow, you gotta put up with the rain.",
    author: "Dolly Parton",
    videoUrl: "https://www.instagram.com/reel/DEjmjLEP-nT/?igsh=MTJkZW5rbGdnMWZ5aA==",
    tags: ["perseverance", "hope", "struggle"]
  },
  {
    id: 26,
    quote: "You are never too old to set another goal or to dream a new dream.",
    author: "C.S. Lewis",
    videoUrl: "https://www.instagram.com/reel/C3VFamwP7-z/?igsh=cG1mbW1qeDV0ZmJw",
    tags: ["age", "dreams", "goals"]
  },
  {
    id: 27,
    quote: "Success is not how high you have climbed, but how you make a positive difference to the world.",
    author: "Roy T. Bennett",
    videoUrl: "https://www.instagram.com/reel/DKmVB6-TTqM/?igsh=YjI2bzdiamRpc3dp",
    tags: ["success", "impact", "difference"]
  },
  {
    id: 28,
    quote: "Don't be afraid to give yourself everything you've ever wanted in life.",
    author: "Unknown",
    videoUrl: "https://www.instagram.com/reel/DAXz5YAP1ED/?igsh=MXhtN3hoOWVqaWF6ZQ==",
    tags: ["fear", "dreams", "self-love"]
  },
  {
    id: 29,
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    videoUrl: "https://www.instagram.com/reel/DKl1vZEvJmt/?igsh=MWJvNDlsajltZ2Jtag==",
    tags: ["passion", "work", "love"]
  },
  {
    id: 30,
    quote: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde",
    videoUrl: "https://www.instagram.com/reel/C-KMJN7vitX/?igsh=MTVjdGF2MGg3NmNkNw==",
    tags: ["authenticity", "self", "unique"]
  }
];

// Load motivation data
function loadMotivationData() {
  // In a real app, this would fetch from an API
  motivationData = sampleMotivationData;
  renderMotivationGrid();
}

// Render motivation grid
function renderMotivationGrid() {
  const container = document.getElementById('motivationGrid');
  if (!container) return;

  if (motivationData.length === 0) {
    container.innerHTML = `
      <div class="motivation-empty">
        <div class="motivation-empty-icon">🎬</div>
        <h3 class="motivation-empty-title">No Motivation Content</h3>
        <p class="motivation-empty-subtitle">Check back later for inspiring videos and quotes!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = motivationData.map(item => {
    const reelId = item.videoUrl.match(/reel\/([A-Za-z0-9_-]+)/)?.[1];
    return `
    <div class="motivation-card" data-id="${item.id}" onclick="openMotivationModal(${item.id})">
      <div class="motivation-video-container">
        ${reelId ? 
          `<iframe src="https://www.instagram.com/reel/${reelId}/embed" 
                   width="100%" height="100%" frameborder="0" scrolling="no" 
                   class="motivation-video-embed"></iframe>` :
          `<div class="motivation-placeholder">
             <div class="placeholder-icon">🎬</div>
             <div class="placeholder-text">Reel ${item.id}</div>
           </div>`
        }
        <div class="motivation-video-overlay">
          <button class="motivation-play-btn">▶</button>
        </div>
      </div>
      <div class="motivation-content">
        <p class="motivation-quote">"${item.quote}"</p>
        <p class="motivation-author">— ${item.author}</p>
        <div class="motivation-tags">
          ${item.tags.map(tag => `<span class="motivation-tag">${tag}</span>`).join('')}
        </div>
      </div>
    </div>
  `}).join('');
}

// Open motivation modal with Instagram embed
function openMotivationModal(id) {
  const item = motivationData.find(m => m.id === id);
  if (!item) return;

  const modal = document.getElementById('motivationModal');
  if (!modal) return;

  // Extract Instagram reel ID from URL
  const reelId = item.videoUrl.match(/reel\/([A-Za-z0-9_-]+)/)?.[1];
  
  modal.innerHTML = `
    <div class="motivation-modal-content">
      <button class="motivation-modal-close" onclick="closeMotivationModal()">×</button>
      <div class="motivation-modal-video">
        ${reelId ? 
          `<iframe src="https://www.instagram.com/reel/${reelId}/embed" 
                   width="100%" height="100%" frameborder="0" scrolling="no" allowtransparency="true">
           </iframe>` :
          `<div class="video-placeholder">
             <p>Video not available</p>
             <a href="${item.videoUrl}" target="_blank">View on Instagram</a>
           </div>`
        }
      </div>
      <div class="motivation-modal-info">
        <p class="motivation-modal-quote">"${item.quote}"</p>
        <p class="motivation-modal-author">— ${item.author}</p>
      </div>
    </div>
  `;

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

// Close motivation modal
function closeMotivationModal() {
  const modal = document.getElementById('motivationModal');
  if (!modal) return;

  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  
  // Stop any playing video
  const video = modal.querySelector('video');
  if (video) {
    video.pause();
  }
}

// Toggle play/pause
function togglePlay(id) {
  const card = document.querySelector(`[data-id="${id}"]`);
  if (!card) return;

  const btn = card.querySelector('.motivation-control-btn');
  if (btn) {
    btn.classList.toggle('active');
    // In a real implementation, this would control video playback
    console.log(`Toggle play for motivation ${id}`);
  }
}

// Toggle mute/unmute
function toggleMute(id) {
  const card = document.querySelector(`[data-id="${id}"]`);
  if (!card) return;

  const btn = card.querySelectorAll('.motivation-control-btn')[1];
  if (btn) {
    btn.classList.toggle('active');
    btn.textContent = btn.classList.contains('active') ? '🔇' : '🔊';
    console.log(`Toggle mute for motivation ${id}`);
  }
}

// Replay video
function replayVideo(id) {
  console.log(`Replay motivation ${id}`);
  // In a real implementation, this would restart the video
}

// Toggle favorite
function toggleFavorite(id) {
  const card = document.querySelector(`[data-id="${id}"]`);
  if (!card) return;

  const btn = card.querySelectorAll('.motivation-control-btn')[3];
  if (btn) {
    btn.classList.toggle('active');
    btn.textContent = btn.classList.contains('active') ? '💖' : '❤️';
    
    // Save to localStorage
    const favorites = JSON.parse(localStorage.getItem('motivation_favorites') || '[]');
    if (btn.classList.contains('active')) {
      if (!favorites.includes(id)) {
        favorites.push(id);
      }
    } else {
      const index = favorites.indexOf(id);
      if (index > -1) {
        favorites.splice(index, 1);
      }
    }
    localStorage.setItem('motivation_favorites', JSON.stringify(favorites));
    
    console.log(`Toggle favorite for motivation ${id}`);
  }
}

// Refresh motivation content
function refreshMotivation() {
  const container = document.getElementById('motivationGrid');
  if (!container) return;

  container.innerHTML = `
    <div class="motivation-loading">
      <div class="motivation-spinner"></div>
      <span>Loading fresh motivation...</span>
    </div>
  `;

  // Simulate loading delay
  setTimeout(() => {
    loadMotivationData();
  }, 1000);
}

// Load favorites on page load
function loadFavorites() {
  const favorites = JSON.parse(localStorage.getItem('motivation_favorites') || '[]');
  favorites.forEach(id => {
    const card = document.querySelector(`[data-id="${id}"]`);
    if (card) {
      const btn = card.querySelectorAll('.motivation-control-btn')[3];
      if (btn) {
        btn.classList.add('active');
        btn.textContent = '💖';
      }
    }
  });
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeMotivationModal();
  }
});

// Close modal on overlay click
document.addEventListener('click', (e) => {
  const modal = document.getElementById('motivationModal');
  if (modal && e.target === modal) {
    closeMotivationModal();
  }
});

// Initialize motivation page
function initMotivation() {
  loadMotivationData();
  
  // Load favorites after a short delay to ensure DOM is ready
  setTimeout(loadFavorites, 100);
}

// Make functions globally available
window.openMotivationModal = openMotivationModal;
window.closeMotivationModal = closeMotivationModal;
window.togglePlay = togglePlay;
window.toggleMute = toggleMute;
window.replayVideo = replayVideo;
window.toggleFavorite = toggleFavorite;
window.refreshMotivation = refreshMotivation;

// Initialize on load
document.addEventListener('DOMContentLoaded', initMotivation);