```
 _____  __   __  ____   _____  ____    ___    ____  _   _  _____
|_   _| \ \ / / |  _ \ | ____||  _ \  / _ \  / ___|| | | || ____|
  | |    \ V /  | |_) ||  _|  | |_) || | | || |  _ | | | ||  _|
  | |     | |   |  __/ | |___ |  _ < | |_| || |_| || |_| || |___
  |_|     |_|   |_|    |_____||_| \_\ \___/  \____| \___/ |_____|
```

A typing roguelike inspired by Slay the Spire, Vampire Survivors and memories of typing in a terminal growing up. Type words to deal damage. Survive three floors.

**v0.6** — [play on Vercel](https://typerogue.vercel.app) · [global leaderboard](https://trinacria.ddns.net/leaderboard)

## How to play

Open `index.html` in a browser, or play the hosted version linked above. No build step needed.

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
| `A` | Achievements (from title) |
| `G` | Global rankings (from title) |

## Classes

| Class | HP | Damage | Notes |
|-------|----|--------|-------|
| Warrior | 135 | 1.0× | Iron Skin passive — resilient |
| Rogue | 65 | 1.5× | Quick Draw — words come faster, wider combo window |
| Mage | 85 | 1.15× | Spell Amp — starts with Freeze, spells deal 50% more |

## Structure

Three floors, each with two branching paths leading to a boss. Once you enter a branch you're locked in.

- **Combat** — fight an enemy by typing words before they reach you
- **Elite** — tougher enemy, better loot
- **Event** — random encounter with a choice and consequence
- **Shop** — spend gold on upgrades
- **Rest** — heal 35% HP
- **Boss** — clear to advance to the next floor

## Upgrades

Passives, spells, and deck modifiers are offered after each combat room and sold in shops.

### Spells

Cast by pressing their number key (`1`–`3`). **Spells stack up to Lv3** — acquiring the same spell again increases its level, amplifying effect and duration (Lv2 = ×1.5, Lv3 = ×2.0).

| Spell | Effect | CD |
|-------|--------|----|
| Freeze | Stop all words for 3s | 12s |
| Shield | Absorb 30 damage | 15s |
| Nova | Destroy all words (15 dmg each) | 20s |
| Haste | Words slow 40% for 5s | 18s |
| Drain | Steal 20 HP from enemy | 16s |
| Blast | 80 flat damage | 22s |
| Echo | Repeat last word's damage for free | 10s |
| Slow | Words crawl at 20% speed for 4s | 8s |
| Reave | Next word deals 3× damage | 12s |
| Ward | Block all incoming attacks for 5s | 20s |
| Mark | Highlight one word — destroying it deals 5× damage | 10s |
| Leech | Heal 1 HP per letter typed for 10s | 18s |
| Volley | Instantly destroy the 3 shortest words | 16s |
| Chain | Next 5 words deal +50% damage | 20s |
| Smite | Deal 8 × current combo as flat damage | 14s |

Active spell effects are shown in a status bar during combat.

### Passives

Iron Skin, Quick Step, Sharp Mind, Regen Ring, Berserker, Vampiric, Longshot, Deathless.

### Deck modifiers

Purge (remove long words), Inject (add short power words), Chaos (2× speed, 2× damage).

## Combo system

Destroy words in quick succession to build a multiplier:

- **×1.25** at ×3 combo
- **×1.50** at ×6 combo
- **×2.00** at ×10 combo

Taking damage resets the combo. Rogue has a wider timing window.

## Leaderboard

After each run you can submit your score to the global leaderboard hosted at `trinacria.ddns.net`. Score is calculated as:

```
score = dmgDealt × difficultyMult × accuracy
```

Difficulty multipliers: Beginner 0.7 · Normal 1.0 · Hard 1.5

## Pickups

Random symbol strings (`!@#$%`) drift across the screen during combat. Type them to collect a bonus: +HP, +gold, +shield, or +damage multiplier.

## Enemies

| Enemy | Floor | Notes |
|-------|-------|-------|
| Goblin Scout | 1 | Fast, short words |
| Cave Troll | 1 | Slow, hard-hitting |
| Goblin Shaman | 1 | Medium speed |
| Dire Rat | 1 | Very fast, low HP |
| Cursed Tome | 1 | Elite |
| **Goblin King** | 1 | Boss — enrages at 50% HP |
| Shadow Archer | 2 | Fast words |
| Void Wraith | 2 | Words go invisible |
| Plague Knight | 2 | Heavy damage |
| Spectral Wolf | 2 | Fastest words on floor 2 |
| Bone Oracle | 2 | Elite, long words |
| **Lich Lord** | 2 | Boss — two phase transitions |
| Storm Knight | 3 | Heavy hitter |
| Dread Sorcerer | 3 | Scrambles word positions |
| Iron Golem | 3 | Tanky, slow words |
| Flame Wraith | 3 | Very fast words |
| **Tyrant Prime** | 3 | Final boss — two phase transitions |

## Files

- `index.html` — game logic and DOM rendering
- `rogue-data.js` — all static game data (enemies, upgrades, classes, events)
- `rogue-audio.js` — procedural dungeonsynth audio engine (three themes + SFX)
- `words.js` — word pool (4 tiers by difficulty)
- `leaderboard/` — Node.js/SQLite API running on lampPost
