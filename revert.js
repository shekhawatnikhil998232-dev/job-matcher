const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const files = [
  'dashboard.html',
  'jobs.html',
  'chat.html',
  'tracker.html',
  'insights.html',
  'mentors.html',
  'leaderboard.html'
];

const basePath = '/Users/nitendrasingh/my-website/public';

function getNavbarHtml(activePage) {
  return `
  <nav class="navbar">
    <a href="index.html" class="navbar-brand">
      <div class="brand-icon">🎯</div>
      JobSkillMatcher
    </a>
    <div class="nav-links">
      <a href="index.html">Home</a>
      <a href="dashboard.html" class="${activePage === 'dashboard' ? 'active' : ''}">Dashboard</a>
      <a href="jobs.html" class="${activePage === 'jobs' ? 'active' : ''}">Jobs</a>
      <a href="tracker.html" class="${activePage === 'tracker' ? 'active' : ''}">Job Tracker</a>
      <a href="mentors.html" class="${activePage === 'mentors' ? 'active' : ''}">Mentors</a>
      <a href="insights.html" class="${activePage === 'insights' ? 'active' : ''}">Campus Insights</a>
      <a href="chat.html" class="${activePage === 'chat' ? 'active' : ''}">AI Chat</a>
      <a href="leaderboard.html" class="${activePage === 'leaderboard' ? 'active' : ''}">Leaderboard</a>
    </div>
    <div class="nav-user">
      <span id="nav-name"></span>
      <div class="nav-avatar" id="nav-avatar">?</div>
    </div>
  </nav>
  `;
}

files.forEach(file => {
  const fullPath = path.join(basePath, file);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const dom = new JSDOM(content);
  const document = dom.window.document;
  
  const pageName = file.split('.')[0];
  
  const appLayout = document.querySelector('.app-layout');
  
  if (appLayout) {
    const pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    pageDiv.innerHTML = getNavbarHtml(pageName);
    
    let mainContent;
    
    // For chat.html we have `.chat-layout` inside app-main
    // For dashboard.html we had `.dashboard-layout` that we stripped. I'll recreate it.
    // For others we have `<main>` directly inside app-main.
    const appMain = document.querySelector('.app-main');
    if (appMain) {
       // Re-insert standard `<main>` context if stripped, but we didn't strip `<main>` in refactor2.js! We just moved whatever `pageDiv` had.
       // So we just move appMain's children back.
       if (pageName === 'dashboard') {
         const dLayout = document.createElement('div');
         dLayout.className = 'dashboard-layout';
         
         const innerSidebar = document.createElement('aside');
         innerSidebar.className = 'sidebar';
         innerSidebar.innerHTML = `
      <div class="sidebar-section">
        <div class="sidebar-label">Core Platform</div>
        <a class="sidebar-item active" href="dashboard.html"><span style="font-size:16px;">📊</span> Career Roadmap</a>
        <a class="sidebar-item" href="jobs.html"><span style="font-size:16px;">💼</span> Jobs Matchmaker</a>
        <a class="sidebar-item" href="chat.html"><span style="font-size:16px;">🎙️</span> AI Mock Interviews</a>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-label">Advanced Tools</div>
        <a class="sidebar-item" href="tracker.html"><span style="font-size:16px;">📋</span> Job Tracker</a>
        <a class="sidebar-item" href="mentors.html"><span style="font-size:16px;">🤝</span> Mentors</a>
        <a class="sidebar-item" href="insights.html"><span style="font-size:16px;">📈</span> Market Analytics</a>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-label">Community</div>
        <a class="sidebar-item" href="leaderboard.html"><span style="font-size:16px;">🏆</span> Leaderboard</a>
      </div>
         `;
         dLayout.appendChild(innerSidebar);
         while(appMain.firstChild) dLayout.appendChild(appMain.firstChild);
         
         pageDiv.appendChild(dLayout);
       } else if (pageName === 'jobs') {
         const dLayout = document.createElement('div');
         dLayout.className = 'dashboard-layout';
         
         const innerSidebar = document.createElement('aside');
         innerSidebar.className = 'sidebar';
         innerSidebar.innerHTML = `
      <div class="sidebar-section">
        <div class="sidebar-label">Core Platform</div>
        <a class="sidebar-item" href="dashboard.html"><span style="font-size:16px;">📊</span> Career Roadmap</a>
        <a class="sidebar-item active" href="jobs.html"><span style="font-size:16px;">💼</span> Jobs Matchmaker</a>
        <a class="sidebar-item" href="chat.html"><span style="font-size:16px;">🎙️</span> AI Mock Interviews</a>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-label">Advanced Tools</div>
        <a class="sidebar-item" href="tracker.html"><span style="font-size:16px;">📋</span> Job Tracker</a>
        <a class="sidebar-item" href="mentors.html"><span style="font-size:16px;">🤝</span> Mentors</a>
        <a class="sidebar-item" href="insights.html"><span style="font-size:16px;">📈</span> Market Analytics</a>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-label">Community</div>
        <a class="sidebar-item" href="leaderboard.html"><span style="font-size:16px;">🏆</span> Leaderboard</a>
      </div>
         `;
         dLayout.appendChild(innerSidebar);
         while(appMain.firstChild) dLayout.appendChild(appMain.firstChild);
         pageDiv.appendChild(dLayout);
       } else {
         while(appMain.firstChild) pageDiv.appendChild(appMain.firstChild);
       }
    }
    
    appLayout.replaceWith(pageDiv);
    
    let finalHtml = dom.serialize();
    
    finalHtml = finalHtml.replace(/document\.getElementById\("nav-name-sidebar"\)/g, 'document.getElementById("nav-name")');
    finalHtml = finalHtml.replace(/document\.getElementById\("nav-avatar-sidebar"\)/g, 'document.getElementById("nav-avatar")');
    
    fs.writeFileSync(fullPath, finalHtml, 'utf8');
    console.log(`Successfully reverted HTML for ${file}`);
  }
});

// Now revert style.css
const stylePath = path.join(basePath, 'style.css');
if (fs.existsSync(stylePath)) {
  let styleContent = fs.readFileSync(stylePath, 'utf8');
  
  const originalNavCSS = `/* NAVBAR */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: var(--surface);
  border-bottom: 4px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 800;
  color: var(--text);
  text-decoration: none;
  font-family: var(--font-head);
  text-transform: uppercase;
  letter-spacing: -0.05em;
  z-index: 2;
}

.brand-icon {
  background: var(--surface-2);
  border: 3px solid var(--border);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 2px 2px 0px var(--border);
}

.nav-links {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 1;
}
.nav-links a {
  text-decoration: none;
  color: var(--text);
  font-weight: 700;
  padding: 8px 16px;
  transition: 0.1s;
  border: 3px solid transparent;
  background: transparent;
}
.nav-links a:hover, .nav-links a.active {
  border: 3px solid var(--border);
  background: var(--surface-2);
  box-shadow: 3px 3px 0 var(--border);
  transform: translate(-3px, -3px);
}

/* NAV USER PROFILE */
.nav-user {
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 2;
}
#nav-name {
  font-weight: 800;
  font-size: 16px;
  text-transform: uppercase;
  color: var(--text);
}
.nav-avatar {
  width: 42px;
  height: 42px;
  background: var(--accent-3);
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 20px;
  border: 3px solid var(--border);
  box-shadow: 3px 3px 0 var(--border);
  text-transform: uppercase;
}`;

  styleContent = styleContent.replace(/\/\* APP LAYOUT ARCHITECTURE \*\/[\s\S]*?\/\* SIDEBAR USER PROFILE \(BOTTOM\) \*\//, originalNavCSS);
  // It might leave the end of the sidebar profile, let's just make sure.
  styleContent = styleContent.replace(/\.sidebar-user \{[\s\S]*?text-transform: uppercase;\n\}/, '');
  
  fs.writeFileSync(stylePath, styleContent, 'utf8');
  console.log('Successfully reverted style.css');
}

