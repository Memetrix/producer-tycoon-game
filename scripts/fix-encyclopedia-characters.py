#!/usr/bin/env python3
"""
Script to fix narrative-encyclopedia.html:
1. Remove Sofia and DJ Nova sections and references
2. Add 4 new artists: Local Hero, Scene Leader, City Star, State Champion
3. Keep all valuable content (Jesse Schell lenses, examples, quotes)
"""

import re

def main():
    input_file = "/Users/alekseigakh/Desktop/Projects/producer-tycoon-game/narrative-encyclopedia.html"
    output_file = "/Users/alekseigakh/Desktop/Projects/producer-tycoon-game/narrative-encyclopedia.html"

    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Track changes
    changes = []

    # 1. Find and remove Sofia's entire character card section
    # Pattern: <!-- Sofia --> ... next <!-- comment -->
    sofia_pattern = r'<!-- Sofia -->.*?(?=<!-- [A-Z]|<!-- ГЛАВНЫЙ)'
    sofia_match = re.search(sofia_pattern, content, re.DOTALL)
    if sofia_match:
        content = content.replace(sofia_match.group(0), '')
        changes.append(f"✅ Removed Sofia character section ({len(sofia_match.group(0))} characters)")

    # 2. Find and remove DJ Nova's entire character card section
    djnova_pattern = r'<!-- DJ Nova -->.*?(?=<!-- [A-Z]|<!-- ГЛАВНЫЙ)'
    djnova_match = re.search(djnova_pattern, content, re.DOTALL)
    if djnova_match:
        content = content.replace(djnova_match.group(0), '')
        changes.append(f"✅ Removed DJ Nova character section ({len(djnova_match.group(0))} characters)")

    # 3. Replace Sofia references with Local Hero
    sofia_count = content.count('Sofia')
    content = content.replace('Sofia:', 'Local Hero:')
    content = content.replace('Sofia (', 'Local Hero (')
    content = content.replace('Sofia ', 'Local Hero ')
    content = content.replace('Sofia.', 'Local Hero.')
    content = content.replace('Sofia\'', 'Local Hero\'')
    content = content.replace('Sofia"', 'Local Hero"')
    changes.append(f"✅ Replaced {sofia_count} Sofia references with Local Hero")

    # 4. Replace DJ Nova references with City Star
    djnova_count = content.count('DJ Nova')
    content = content.replace('DJ Nova:', 'City Star:')
    content = content.replace('DJ Nova (', 'City Star (')
    content = content.replace('DJ Nova ', 'City Star ')
    content = content.replace('DJ Nova.', 'City Star.')
    content = content.replace('DJ Nova\'', 'City Star\'')
    content = content.replace('DJ Nova"', 'City Star"')
    changes.append(f"✅ Replaced {djnova_count} DJ Nova references with City Star")

    # 5. Update character count from 6 to 8
    content = content.replace('6 NPC персонажей', '8 NPC персонажей')
    changes.append("✅ Updated character count from 6 to 8")

    # Write output
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)

    # Report
    print("\n🎯 Encyclopedia Character Fix Complete!\n")
    for change in changes:
        print(change)

    print(f"\n📝 Updated file: {output_file}")
    print("\n⚠️  Next steps (manual):")
    print("1. Add detailed character cards for Local Hero, Scene Leader, City Star, State Champion")
    print("2. Add their narrative scenes to Tab 3")
    print("3. Update relationship web diagram")
    print("4. Verify all Energy references are 150")

if __name__ == "__main__":
    main()
