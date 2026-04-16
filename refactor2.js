const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const files = [
  'chat.html',
  'tracker.html',
  'insights.html',
  'mentors.html',
  'leaderboard.html'
];

const basePath = path.join(__dirname, 'public');

function getSidebarHtml(activePage) {
  return `
  <aside class="app-sidebar">
    <a href="index.html" class="sidebar-brand">
      <div class="brand-icon">🎯</div>
      JobSkillMatch
    </a>
    
    <div class="sidebar-section">Core Platform</div>
    <a href="dashboard.html" class="sidebar-link ${activePage === 'dashboard' ? 'active' : ''}">📊 Career Roadmap</a>
    <a href="jobs.html" class="sidebar-link ${activePage === 'jobs' ? 'active' : ''}">💼 Jobs Matchmaker</a>
    <a href="chat.html" class="sidebar-link ${activePage === 'chat' ? 'active' : ''}">🎙️ AI Mock Interviews</a>
    <a href="tracker.html" class="sidebar-link ${activePage === 'tracker' ? 'active' : ''}">�� Job Tracker</a>

    <div class="sidebar-section">Advanced Tools</div>
    <a href="insights.html" class="sidebar-link ${activePage === 'insights' ? 'active' : ''}">📈 Market Analytics</a>
    <a href="mentors.html" class="sidebar-link ${activePage === 'mentors' ? 'active' : ''}">🤝 Mentors</a>
    <a href="leaderboard.html" class="sidebar-link ${activePage === 'leaderboard' ? 'active' : ''}">🏆 Leaderboard</a>

    <div class="sidebar-user">
      <div class="nav-avatar" id="nav-avatar-sidebar">?</div>
      <span id="nav-name-sidebar"></span>
    </div>
  </aside>
  <div class="app-main"></div>
  `;
}

files.forEach(file => {
  const fullPath = path.join(basePath, file);
  if (!fs.existsSync(fullPath)) return;
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const dom = new JSDOM(content);
  const document = dom.window.document;
  
  const pageName = file.split('.')[0];
  
  const pageDiv = document.querySelector('.page');
  const oldNav = document.querySelector('.navbar');
  
  if (pageDiv && oldNav) {
    oldNav.remove(); // Remove top navbar

    const appLayout = document.createElement('div');
    appLayout.className = 'app-layout';
    appLayout.innerHTML = getSidebarHtml(pageName);
    
    const appMain = appLayout.querySelector('.app-main');
    
    // Transfer everything remaining inside pageDiv to appMain
    while(pageDiv.firstChild) {
       appMain.appendChild(pageDiv.firstChild);
    }
    
    // Replace pageDiv with appLayout
    pageDiv.replaceWith(appLayout);
    
    let finalHtml = dom.serialize();
    
    finalHtml = finalHtml.replace(/document\.getElementById\("nav-name"\)/g, 'document.getElementById("nav-name-sidebar")');
    finalHtml = finalHtml.replace(/document\.getElementById\("nav-avatar"\)/g, 'document.getElementById("nav-avatar-sidebar")');
    
    fs.writeFileSync(fullPath, finalHtml, 'utf8');
    console.log(`Successfully migrated ${file}`);
  } else {
    console.log(`Skipped ${file}`);
  }
});
