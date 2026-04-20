import re

with open('public/style.css', 'r') as f:
    css = f.read()

# 1. Font Overhaul
css = re.sub(r"@import url\('.*?'\);", "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');", css)
css = css.replace('Space Grotesk', 'Inter').replace('Outfit', 'Inter')

# 2. Variables Overhaul
new_root = """:root {
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
}"""
css = re.sub(r":root \{[\s\S]*?\}", new_root, css, count=1)

# 3. Body Background
new_body = """body {
  background-color: var(--bg);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  -webkit-font-smoothing: antialiased;
  color: var(--text);
}"""
css = re.sub(r"body\s*\{[\s\S]*?\}", new_body, css, count=1)

# 4. Hide Parallax Geometry globally to maintain minimalism
css += "\n\n/* OVERRIDES FOR MINIMALISM */\n.parallax { display: none !important; opacity: 0 !important; }\n"

# 5. Navbar Override
new_navbar = """.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 3rem;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}"""
css = re.sub(r"\.navbar\s*\{[\s\S]*?\}", new_navbar, css, count=1)

# 6. Button Override
new_btn = """.btn {
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
.btn-primary {
  background: var(--accent);
  color: #fff;
  border: 1px solid transparent;
}
.btn-primary:hover {
  background: #333;
  color: #fff;
}"""
css = re.sub(r"\.btn\s*\{[\s\S]*?\}", new_btn, css, count=1)

# 7. Auth Card / Panels Cleanup
css = re.sub(r"background: rgba\(255,\s*255,\s*255,\s*0\.65\);.*?backdrop-filter: blur\(\d+px\);", "background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow-base);", css, flags=re.DOTALL)
css = re.sub(r"box-shadow: var\(--shadow-glass\)", "box-shadow: var(--shadow-base)", css)

with open('public/style.css', 'w') as f:
    f.write(css)

print("Minimalist Migration Applied.")
