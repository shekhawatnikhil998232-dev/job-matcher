const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const files = [
  'index.html',
  'login.html',
  'dashboard.html',
  'jobs.html',
  'chat.html',
  'tracker.html',
  'insights.html',
  'mentors.html',
  'leaderboard.html'
];

const basePath = '/Users/nitendrasingh/my-website/public';

const vanillaTiltScript = 'https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.0/vanilla-tilt.min.js';

files.forEach(file => {
  const fullPath = path.join(basePath, file);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const dom = new JSDOM(content);
  const document = dom.window.document;

  // 1. Inject vanilla-tilt in head if not there
  let hasTilt = false;
  document.querySelectorAll('script').forEach(sc => {
      if(sc.src.includes('vanilla-tilt')) hasTilt = true;
  });
  if (!hasTilt && document.head) {
      const scriptNode = document.createElement('script');
      scriptNode.src = vanillaTiltScript;
      document.head.appendChild(scriptNode);
  }

  // 2. Inject animations.js at end of body
  let hasAnim = false;
  document.querySelectorAll('script').forEach(sc => {
      if(sc.src.includes('animations.js')) hasAnim = true;
  });
  if (!hasAnim && document.body) {
      const scriptNode = document.createElement('script');
      scriptNode.src = 'animations.js';
      document.body.appendChild(scriptNode);
  }

  // 3. Add classes and data attributes
  // Define what elements should be "revealed" and "tilted"
  const tiltElements = document.querySelectorAll('.job-card, .stat-card, .mentor-card, .feature-card, .check-item, .auth-card');
  tiltElements.forEach(el => {
      el.classList.add('brutal-reveal');
      el.setAttribute('data-tilt', '');
      el.setAttribute('data-tilt-max', '4');
      el.setAttribute('data-tilt-speed', '400');
      el.setAttribute('data-tilt-glare', 'true');
      el.setAttribute('data-tilt-max-glare', '0.1');
  });

  // Also reveal page titles and containers
  const revealElements = document.querySelectorAll('.page-title, .page-sub, .dashboard-layout, .jobs-grid, .chat-window, .app-layout, .mentors-grid, .board-columns');
  revealElements.forEach(el => {
      el.classList.add('brutal-reveal');
  });

  fs.writeFileSync(fullPath, dom.serialize(), 'utf8');
  console.log('Applied animations to ' + file);
});
