import os

for file in os.listdir("public"):
    if file.endswith(".html"):
        with open(f"public/{file}", 'r') as f:
            content = f.read()
        content = content.replace('href="style.css?v=3"', 'href="style.css?v=4"')
        with open(f"public/{file}", 'w') as f:
            f.write(content)

print("Cache busted to v4.")
