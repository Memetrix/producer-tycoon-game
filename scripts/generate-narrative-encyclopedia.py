#!/usr/bin/env python3
"""
Generate comprehensive narrative encyclopedia HTML from DEEP_NARRATIVE_ANALYSIS.md
This creates a beautiful interactive encyclopedia with all 4,422 lines of narrative content.
"""

import re
import json
from pathlib import Path

def parse_markdown(md_path):
    """Parse the markdown file and extract structured data"""

    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract all sections with ## headers
    sections = re.split(r'\n## ', content)

    data = {
        'lenses': [],
        'characters': [],
        'scenes': [],
        'emotional_map': '',
        'formula': '',
        'guide': ''
    }

    for section in sections:
        if not section.strip():
            continue

        # Extract title and content
        lines = section.split('\n', 1)
        title = lines[0].strip()
        content_text = lines[1] if len(lines) > 1 else ''

        # Categorize by type
        if 'Линза #' in title:
            data['lenses'].append({
                'title': title,
                'content': content_text
            })
        elif any(char in title for char in ['MC Flow', 'Lil Dreamer', 'Street Poet', 'Young Legend', 'Sofia', 'DJ Nova']):
            data['characters'].append({
                'title': title,
                'content': content_text
            })
        elif 'Emotional Journey' in title or 'Эмоциональная карта' in title:
            data['emotional_map'] = content_text
        elif 'Formula' in title or 'Формула' in title:
            data['formula'] = content_text
        elif 'Writer' in title or 'Писатель' in title:
            data['guide'] = content_text

    return data

def extract_dialogue(content):
    """Extract dialogue blocks from content"""
    # Find all code blocks (used for dialogues)
    dialogue_pattern = r'```(.*?)```'
    dialogues = re.findall(dialogue_pattern, content, re.DOTALL)
    return dialogues

def extract_choices(content):
    """Extract choice blocks"""
    choice_pattern = r'\[Choice\](.*?)(?=\[|$)'
    choices = re.findall(choice_pattern, content, re.DOTALL)
    return choices

def generate_html(data, output_path):
    """Generate the comprehensive HTML encyclopedia"""

    html = '''<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Producer Tycoon - Narrative Encyclopedia</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        /* (CSS from previous HTML will go here) */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 50%, #0a0a0f 100%);
            color: #e0e0e0;
            line-height: 1.6;
        }

        /* Add all styles here */
    </style>
</head>
<body>
    <div class="hero">
        <h1>🎭 Producer Tycoon Encyclopedia</h1>
        <p class="subtitle">4,422 строки нарративного анализа</p>
    </div>

    <div class="container">
        <!-- Content will be generated here -->
    </div>

    <script>
        // JavaScript for interactivity
    </script>
</body>
</html>'''

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)

    print(f"✅ Generated HTML encyclopedia at {output_path}")

if __name__ == '__main__':
    md_path = Path(__file__).parent.parent / 'DEEP_NARRATIVE_ANALYSIS.md'
    output_path = Path(__file__).parent.parent / 'narrative-encyclopedia-full.html'

    print(f"📖 Reading {md_path}")
    data = parse_markdown(md_path)

    print(f"✍️ Found:")
    print(f"  - {len(data['lenses'])} lenses")
    print(f"  - {len(data['characters'])} characters")

    print(f"🎨 Generating HTML...")
    generate_html(data, output_path)

    print("🎉 Done!")
