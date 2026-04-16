const fs = require('fs');

const cssPath = '/Users/nitendrasingh/my-website/public/style.css';
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Font Overhaul
css = css.replace(/@import url\('.*?'\);/, "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');");
css = css.replace(/Space Grotesk/g, 'Inter');

// 2. Variables Overhaul
css = css.replace(/:root \{[\s\S]*?\}/, `:root {
  /* MINIMALIST PALETTE */
  --bg: #FAFAFA; 
  --surface: #FFFFFF; 
  --surface-2: #F4F4F5; 
  --accent: #000000; 
  --accent-2: #2563EB; 
  --accent-3: #10B981; 
  
  --text: #111827;
  --text-2: #4B5563;
  --text-3: #9CA3AF;
  
  --border: #E5E7EB; 
  --border-2: #D1D5DB; 

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  
  --font-body: 'Inter', sans-serif;
  --font-head: 'Inter', sans-serif;

  --shadow-base: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  --shadow-hover: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
}`);

// 3. Body Background
css = css.replace(/body \{[\s\S]*?\}/, `body {
  background-color: var(--bg);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  -webkit-font-smoothing: antialiased;
  color: var(--text);
}`);

// 4. Headers (Remove text-shadow and uppercase)
css = css.replace(/h1, h2, h3, h4, h5 \{[\s\S]*?\}/, `h1, h2, h3, h4, h5 {
  font-family: var(--font-head);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
}`);

// 5. Borders & Dropshadow Cleanup globally
// Many elements had backdrop-filter: blur(12px) from Cyberpunk mapping
css = css.replace(/border: 1px solid var\(--border\);\s*border-radius: var\(--radius-md\);\s*backdrop-filter: blur\(\d+px\);/g, 
  'border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface); box-shadow: var(--shadow-base);');

css = css.replace(/box-shadow:\s*var\(--shadow-brutal\);/g, 'box-shadow: var(--shadow-base);');
css = css.replace(/box-shadow:\s*var\(--shadow-brutal-hover\);/g, 'box-shadow: var(--shadow-hover);');

// 6. Navbar Cleanup
css = css.replace(/\.navbar \{[\s\S]*?\}/, `.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 3rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}`);

css = css.replace(/\.navbar-brand \{[\s\S]*?\}/, `.navbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  text-decoration: none;
  letter-spacing: -0.02em;
  z-index: 2;
}`);

css = css.replace(/\.nav-links a:hover, \.nav-links a\.active \{[\s\S]*?\}/, `.nav-links a:hover, .nav-links a.active {
  color: var(--accent);
  background: var(--surface-2);
  border-radius: var(--radius-sm);
}`);

css = css.replace(/\.brand-icon \{[\s\S]*?\}/, `.brand-icon {
  background: var(--text);
  color: #fff;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}`);

css = css.replace(/\.nav-avatar \{[\s\S]*?\}/, `.nav-avatar {
  width: 36px;
  height: 36px;
  background: var(--surface-2);
  color: var(--text);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  border: 1px solid var(--border);
}`);


// 7. Reverting Liquid Buttons
css = css.replace(/\/\* BUTTONS \*\/[\s\S]*?\/\* BRUTALIST INPUTS \*\//, `/* BUTTONS */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  font-weight: 500;
  font-size: 14px;
  border-radius: var(--radius-lg);
  cursor: pointer;
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  transition: all 0.2s ease;
  text-decoration: none;
}
.btn:hover {
  background: var(--surface-2);
  transform: translateY(-1px);
  box-shadow: var(--shadow-base);
}
.btn:active {
  transform: scale(0.98);
}
.btn-primary {
  background: var(--accent);
  color: #fff;
  border: 1px solid transparent;
}
.btn-primary:hover {
  background: #333;
  color: #fff;
}

/* BRUTALIST INPUTS */`);

// 8. Auth Cards
css = css.replace(/\.auth-card \{[\s\S]*?\}/, `.auth-card {
  width: 100%;
  max-width: 420px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 40px;
  box-shadow: var(--shadow-base);
}`);
css = css.replace(/\.auth-tabs \{[\s\S]*?\}/, `.auth-tabs {
  display: flex;
  margin-bottom: 24px;
  border-radius: var(--radius-md);
  background: var(--surface-2);
  padding: 4px;
}`);
css = css.replace(/\.auth-tab \{[\s\S]*?\}/, `.auth-tab {
  flex: 1;
  text-align: center;
  padding: 10px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  color: var(--text-2);
  transition: all 0.2s;
}`);
css = css.replace(/\.auth-tab\.active \{[\s\S]*?\}/, `.auth-tab.active {
  background: var(--surface);
  color: var(--text);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}`);

// 9. Input Cleanup
css = css.replace(/input, select, textarea \{[\s\S]*?\}/, `input, select, textarea {
  width: 100%;
  padding: 12px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text);
  font-size: 14px;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02) inset;
}`);
css = css.replace(/input:focus, textarea:focus \{[\s\S]*?\}/, `input:focus, textarea:focus {
  outline: none;
  border-color: var(--accent-2);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}`);
css = css.replace(/\.form-label \{[\s\S]*?\}/, `.form-label {
  display: block;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--text-2);
  font-size: 14px;
}`);

// 10. Cursor Removal (Return to default)
// Minimalist UI usually relies on native cursors for optimal UX
css = css.replace(/body \{\s*cursor: none !important;\s*\}/, '');
css = css.replace(/a, button, select, input, textarea, \.job-card, \.check-item, \.suggestion-btn \{\s*cursor: none !important;\s*\}/, '');
css = css.replace(/#brutal-cursor \{[\s\S]*?\}/, `#brutal-cursor { display: none; }`);
css = css.replace(/#brutal-cursor\.cursor-hover \{[\s\S]*?\}/, `#brutal-cursor.cursor-hover { display: none; }`);

// 11. Reveal Physics
css = css.replace(/\.brutal-reveal \{[\s\S]*?\}/, `.brutal-reveal {
  opacity: 0;
  transform: translateY(15px);
  transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}`);
css = css.replace(/\.brutal-reveal\.revealed \{[\s\S]*?\}/, `.brutal-reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}`);

// Clean up Job Cards overrides specifically
css = css.replace(/\.job-card:hover \{[\s\S]*?\}/, `.job-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
  border-color: var(--border-2);
}`);

// Remove border-bottom from auth-title
css = css.replace(/\.auth-title \{[\s\S]*?\}/, `.auth-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}`);
css = css.replace(/\.auth-subtitle \{[\s\S]*?\}/, `.auth-subtitle {
  color: var(--text-2);
  margin-bottom: 32px;
  font-size: 15px;
}`);


fs.writeFileSync(cssPath, css, 'utf8');
console.log('Successfully completed Minimalist Override');
