import re

with open('public/style.css', 'r') as f:
    css = f.read()

# 1. Very Soft Light Monochrome Palette
new_root = """:root {
  /* ULTRA LIGHT MINIMALIST PALETTE */
  --bg: #FFFFFF; 
  --surface: #FCFCFC; 
  --surface-2: #F5F5F5; 
  
  --text: #333333;
  --text-2: #666666;
  --text-3: #999999;
  
  --accent: #EBEBEB; 
  --accent-2: #F1F1F1; 
  --accent-light: #FAFAFA;
  
  --border: #EEEEEE; 
  --border-2: #E5E5E5; 

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  
  --font-body: 'Inter', sans-serif;
  --font-head: 'Inter', sans-serif;

  --shadow-base: none;
  --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.03);
}"""
css = re.sub(r":root \{[\s\S]*?\}", new_root, css, count=1)

# 2. Modify Button Accents so they are legible against light backgrounds
# Replace ".btn-primary {...}" block
new_btn_primary1 = """.btn-primary {
  background: var(--surface-2);
  color: var(--text);
  border: 1px solid var(--border-2);
}
.btn-primary:hover {
  background: var(--border);
  color: var(--text);
}"""
css = re.sub(r"\.btn-primary\s*\{\s*background:\s*var\(--accent\);\s*color:\s*#fff;[\s\S]*?\}", new_btn_primary1, css)

# 3. Nuke Linear Gradients exactly
css = re.sub(r"linear-gradient\(.*?\)", "var(--surface)", css)

# 4. Brand Icon overrides (since no gradients)
new_brand_icon = """.brand-icon {
  background: var(--surface-2);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius-round);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: none;
}"""
css = re.sub(r"\.brand-icon\s*\{[\s\S]*?\}", new_brand_icon, css)

# 5. Fix overlapping btn-primary declarations from earlier
css = re.sub(r"\.btn-primary\s*\{\s*background:\s*var\(--surface\);\s*border:\s*none;\s*color:\s*#fff;\s*box-shadow:[\s\S]*?\}", "", css)
css = re.sub(r"\.btn-primary:hover\s*\{\s*background:\s*var\(--surface\);\s*box-shadow:[\s\S]*?color:\s*#fff;\s*\}", "", css)

# Fix .nav-links a.active
new_active = """.nav-links a.active {
  color: var(--text);
  background: var(--surface-2);
  border: 1px solid var(--border);
}"""
css = re.sub(r"\.nav-links a\.active\s*\{[\s\S]*?\}", new_active, css)

# Write it out
with open('public/style.css', 'w') as f:
    f.write(css)

print("Light Palette applied successfully.")
