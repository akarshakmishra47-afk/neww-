import os, glob, re

nav_links_html = '''    <div class="top-navbar-links">
        <a href="dashboard.html" class="nav-item">Home</a>
        <a href="internships.html" class="nav-item">Explore</a>
        <a href="skill-engine.html" class="nav-item">Skills</a>
        <a href="projects.html" class="nav-item">Projects</a>
        <a href="career-roadmap.html" class="nav-item">Roadmap</a>
        <a href="applications.html" class="nav-item">Applications</a>
    </div>'''

for filepath in glob.glob('*.html'):
    if filepath in ['index.html', 'login.html', 'register.html']:
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    pattern = re.compile(r'<div class="top-navbar-links">.*?</div>', re.DOTALL)
    new_content = pattern.sub(nav_links_html, content)
    
    file_basename = os.path.basename(filepath)
    # Special cases: internships.html is Explore, skill-engine.html is Skills
    
    target_str = f'href="{file_basename}" class="nav-item"'
    replace_str = f'href="{file_basename}" class="nav-item active"'
    if target_str in new_content:
        new_content = new_content.replace(target_str, replace_str)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f'Updated {filepath}')
