const fs = require('fs');
const glob = require('glob'); // Note: we can just do fs.readdirSync
const dir = './public';

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const cssToAdd = `
.dropdown-content {
  display: none;
  position: absolute;
  right: 0;
  top: 100%;
  background-color: var(--surface-2);
  min-width: 150px;
  box-shadow: var(--shadow-glass-hover);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-glass);
  z-index: 1000;
  padding: 8px 0;
  margin-top: 10px;
  backdrop-filter: blur(16px);
}

.nav-user {
  position: relative;
  cursor: pointer;
}

.nav-user:hover .dropdown-content {
  display: block;
}

.dropdown-content a, .dropdown-content button {
  color: var(--text);
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  font-weight: 500;
  font-size: 14px;
  text-align: left;
  border: none;
  background: transparent;
  width: 100%;
  cursor: pointer;
  transition: 0.2s;
  box-sizing: border-box;
}

.dropdown-content a:hover, .dropdown-content button:hover {
  background-color: rgba(99, 102, 241, 0.1);
  color: var(--accent);
}
`;

const csspath = './public/style.css';
let cssFile = fs.readFileSync(csspath, 'utf8');
if (!cssFile.includes('.dropdown-content')) {
    cssFile += cssToAdd;
    fs.writeFileSync(csspath, cssFile);
}

const cleanUserRegex = /<div class="nav-user"[\s\S]*?(?:<\/div>\s*<\/div>\s*<\/div>|<\/div>\s*<\/div>)/g;
const simpleUserRegex = /<div class="nav-user">\s*<span id="nav-name"><\/span>\s*<div class="nav-avatar" id="nav-avatar">\?<\/div>\s*<\/div>/g;

const dropdownReplacement = `<div class="nav-user">
      <span id="nav-name"></span>
      <div class="nav-avatar" id="nav-avatar">?</div>
      <div class="dropdown-content">
        <a href="profile.html">👤 Profile</a>
        <button onclick="logout()" style="color: #ef4444;">🚪 Logout</button>
      </div>
    </div>`;

for (const file of files) {
    if (file === 'login.html') continue;
    let content = fs.readFileSync(dir + '/' + file, 'utf8');
    
    // Replace the complex inline ones we added previously
    content = content.replace(/<div class="nav-user" style="display: flex; gap: 20px; align-items: center;">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, dropdownReplacement);
    
    // Replace the simple old ones
    content = content.replace(simpleUserRegex, dropdownReplacement);

    fs.writeFileSync(dir + '/' + file, content);
}
console.log("Navbars updated!");
