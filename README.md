# TYPEROGUE

A typing roguelike. Type words to deal damage. Survive three floors.

## How to play

Open `index.html` in a browser. No build step, no server needed.

### Controls

| Key | Action |
|-----|--------|
| Type | Attack the targeted word |
| `Backspace` | Delete last typed character |
| `1` / `2` / `3` | Cast spell (if unlocked) |
| `← →` | Navigate map / class select |
| `Enter` | Confirm / advance |
| `Esc` | Pause / back |
| `M` | Mute music |
| `L` | Toggle dark / light mode |
| `I` | Instructions (from title) |

## Classes

| Class | HP | Damage | Notes |
|-------|----|--------|-------|
| Warrior | 135 | 1.0× | Iron Skin passive — resilient |
| Rogue | 65 | 1.5× | Quick Draw — words come faster |
| Mage | 85 | 1.15× | Spell Amp — starts with Freeze, spells deal 50% more |

## Structure

Three floors, each with two branching paths leading to a boss:

- **Combat** — fight an enemy by typing words before they reach you
- **Elite** — tougher enemy, better loot
- **Shop** — spend gold on upgrades
- **Rest** — heal 35% HP
- **Boss** — clear to advance to the next floor

## Upgrades

Passives, spells, and deck modifiers are offered after each combat room.

**Spells** are cast by pressing their number key.

| Spell | Effect | CD |
|-------|--------|----|
| Freeze | Stop all words for 3s | 12s |
| Shield | Absorb 30 damage | 15s |
| Nova | Destroy all words (15 dmg each) | 20s |
| Haste | Words slow 40% for 5s | 18s |
| Drain | Steal 20 HP from enemy | 16s |
| Blast | 80 flat damage | 22s |

## Pickups

Random symbol strings (`!@#$%`) drift across the screen during combat. Type them to collect a bonus: +HP, +gold, +shield, or +damage multiplier.

## Enemies

| Enemy | Floor | Notes |
|-------|-------|-------|
| Goblin Scout | 1 | Fast, short words |
| Cave Troll | 1 | Slow, hard-hitting |
| Cursed Tome | 1 | Elite |
| **Goblin King** | 1 | Boss — enrages at 50% HP |
| Shadow Archer | 2 | Fast words |
| Void Wraith | 2 | Words go invisible |
| Bone Oracle | 2 | Elite, long words |
| **Lich Lord** | 2 | Boss — two phase transitions |
| Storm Knight | 3 | Hard hitter |
| Dread Sorcerer | 3 | Scrambles word positions |
| **Tyrant Prime** | 3 | Final boss |

## Files

- `index.html` — game logic and DOM rendering
- `rogue-data.js` — all static game data (enemies, upgrades, classes)
- `rogue-audio.js` — procedural dungeonsynth audio engine (three themes + SFX)
- `words.js` — word pool (4 tiers by difficulty)
