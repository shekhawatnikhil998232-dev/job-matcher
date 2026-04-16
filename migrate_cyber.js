const fs = require('fs');
const path = require('path');

const cssPath = '/Users/nitendrasingh/my-website/public/style.css';
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Root Variables Replacement
css = css.replace(/:root \{[\s\S]*?\}/, `:root {
  /* CYBERPUNK PALETTE */
  --bg: #0B0B14; 
  --surface: rgba(20, 20, 35, 0.6); 
  --surface-2: rgba(0, 240, 255, 0.1); 
  --accent: #ff0055; 
  --accent-2: #00f0ff; 
  --accent-3: #bb00ff; 
  
  --text: #e0e0f0;
  --text-2: #a0a0c0;
  --text-3: #707090;
  
  --border: rgba(0, 240, 255, 0.3); 
  --border-2: rgba(255, 0, 85, 0.3); 

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  
  --font-body: 'Space Grotesk', sans-serif;
  --font-head: 'Space Grotesk', sans-serif;

  --shadow-brutal: 0 0 15px rgba(0, 240, 255, 0.15), inset 0 0 10px rgba(0, 240, 255, 0.05);
  --shadow-brutal-hover: 0 0 25px rgba(0, 240, 255, 0.4), inset 0 0 15px rgba(0, 240, 255, 0.1);
}`);

// 2. Body Background Replacement
css = css.replace(/body \{[\s\S]*?\}/, `body {
  background-color: var(--bg);
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(255, 0, 85, 0.08), transparent 30%),
    radial-gradient(circle at 90% 80%, rgba(0, 240, 255, 0.08), transparent 30%);
  background-size: cover;
  background-attachment: fixed;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}`);

// 3. Typography Overhaul (Glowing Headers)
css = css.replace(/h1, h2, h3, h4, h5 \{[\s\S]*?\}/, `h1, h2, h3, h4, h5 {
  font-family: var(--font-head);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}`);

// 4. Transform Blocky Borders to Neon Borders (Globally)
css = css.replace(/border:\s*[2345]px solid var\(--border\);/g, 'border: 1px solid var(--border); border-radius: var(--radius-md); backdrop-filter: blur(12px);');

// 5. Button Enhancements
css = css.replace(/\.btn:hover \{[\s\S]*?\}/, `.btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-brutal-hover);
  text-shadow: 0 0 8px rgba(255,255,255,0.7);
}`);
css = css.replace(/\.btn-primary \{[\s\S]*?\}/, `.btn-primary {
  background: linear-gradient(45deg, var(--accent), #ff00a0);
  color: #fff;
  border-color: transparent;
}`);

// 6. Job Cards & Generic Cards Enhancements
css = css.replace(/\.job-card:hover \{[\s\S]*?\}/, `.job-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-brutal-hover);
  background: rgba(20, 20, 35, 0.9);
  border-color: var(--accent-2);
}`);

// 7. Navbar 
css = css.replace(/\.navbar \{[\s\S]*?\}/, `.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(11, 11, 18, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}`);

// 8. Navbar Links 
css = css.replace(/\.nav-links a:hover, \.nav-links a\.active \{[\s\S]*?\}/, `.nav-links a:hover, .nav-links a.active {
  border: 1px solid var(--accent-2);
  background: rgba(0, 240, 255, 0.1);
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
  border-radius: var(--radius-md);
  color: #fff;
}`);

// 9. Auth card specific
css = css.replace(/\.auth-card \{[\s\S]*?\}/, `.auth-card {
  width: 100%;
  max-width: 450px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(16px);
  padding: 40px;
  box-shadow: 0 0 30px rgba(255, 0, 85, 0.2);
}`);
css = css.replace(/\.auth-tabs \{[\s\S]*?\}/, `.auth-tabs {
  display: flex;
  margin-bottom: 24px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: rgba(0,0,0,0.3);
}`);
css = css.replace(/\.auth-tab \{[\s\S]*?\}/, `.auth-tab {
  flex: 1;
  text-align: center;
  padding: 14px;
  font-weight: 800;
  text-transform: uppercase;
  cursor: pointer;
  border-right: 1px solid var(--border);
  transition: 0.1s;
}`);
css = css.replace(/\.auth-tab\.active \{[\s\S]*?\}/, `.auth-tab.active {
  background: rgba(0, 240, 255, 0.2);
  color: #fff;
  text-shadow: 0 0 8px var(--accent-2);
}`);

// 10. Update Cursor Aesthetics
css = css.replace(/#brutal-cursor \{[\s\S]*?\}/, `#brutal-cursor {
  width: 20px;
  height: 20px;
  background: transparent;
  border: 2px solid var(--accent-2);
  border-radius: 50%;
  box-shadow: 0 0 15px var(--accent-2), inset 0 0 10px var(--accent-2);
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 9999;
  transform-origin: center center;
  transition: width 0.15s ease, height 0.15s ease, border-color 0.15s, box-shadow 0.15s;
}`);
css = css.replace(/#brutal-cursor\.cursor-hover \{[\s\S]*?\}/, `#brutal-cursor.cursor-hover {
  width: 40px;
  height: 40px;
  border-color: var(--accent);
  box-shadow: 0 0 20px var(--accent), inset 0 0 15px var(--accent);
  background: transparent;
  border-radius: 50%;
}`);

// 11. Reveal Physics
css = css.replace(/\.brutal-reveal \{[\s\S]*?\}/, `.brutal-reveal {
  opacity: 0;
  transform: scale(0.95) translateY(20px);
  filter: blur(4px);
  transition: opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.2, 0.9, 0.3, 1), filter 0.6s ease-out;
}`);
css = css.replace(/\.brutal-reveal\.revealed \{[\s\S]*?\}/, `.brutal-reveal.revealed {
  opacity: 1;
  transform: scale(1) translateY(0);
  filter: blur(0px);
}`);

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Successfully completed Cyberpunk Override');
