import re

with open('public/style.css', 'r') as f:
    css = f.read()

# 1. New Deep Dark Root
new_root = """:root {
  /* Premium Dark Glassmorphism Palette */
  --bg: #0f172a; 
  --surface: rgba(30, 41, 59, 0.65);
  --surface-2: rgba(30, 41, 59, 0.9);
  --text: #f8fafc;
  --text-2: #cbd5e1;
  --text-3: #94a3b8;
  
  --accent: #818cf8;       /* Lighter Indigo */
  --accent-light: #a5b4fc;
  --accent-2: #38bdf8;     /* Bright Sky */
  --accent-3: #34d399;     /* Bright Emerald */
  
  --border-glass: rgba(255, 255, 255, 0.1);
  --border-glass-hover: rgba(255, 255, 255, 0.2);

  --shadow-glass: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  --shadow-glass-hover: 0 12px 40px 0 rgba(0, 0, 0, 0.5);
  
  --shadow-in: inset 0 0 0 1px var(--border-glass), 0 2px 8px rgba(0,0,0,0.2);
  --shadow-out: 0 4px 24px -4px rgba(0, 0, 0, 0.3);
  --shadow-out-hover: 0 12px 32px -4px rgba(0, 0, 0, 0.5);

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-xl: 28px;
  --radius-pill: 9999px;
  --radius-round: 50%;
  
  --font-body: 'Outfit', sans-serif;
  --font-head: 'Outfit', sans-serif;
}"""
css = re.sub(r":root \{[\s\S]*?\}", new_root, css, count=1)

# 2. Fix the Body Gradient (Make it darker)
new_body_gradient = """body {
  background-color: var(--bg);
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.05), transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(14, 165, 233, 0.05), transparent 40%);"""
css = re.sub(r"body\s*\{\s*background-color:\s*var\(--bg\);\s*background-image:[\s\S]*?transparent 40%\);", new_body_gradient, css)

# 3. Nuke hardcoded white backgrounds (used in hover states)
css = css.replace("background: #fff;", "background: rgba(15, 23, 42, 0.8);")

# 4. Navbar fixing for dark mode
css = css.replace("background: rgba(248, 250, 252, 0.7);", "background: rgba(15, 23, 42, 0.7);")

# 5. Fix text colors referencing old vars or #fff manually
css = css.replace("color: #0f172a;", "color: #f8fafc;")

# Specifically fix btn-primary hover so text stays visible
# Wait, let's keep color: #fff for btn-primary texts since it's dark text on dark button.
# The user's code has:
# .btn-primary { ... color: #fff; } (Line 238) which is fine for dark buttons!

# Write it back
with open('public/style.css', 'w') as f:
    f.write(css)

print("Dark theme generated.")
