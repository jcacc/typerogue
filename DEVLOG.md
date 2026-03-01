# TYPEROGUE DEVLOG

## 2026-03-01

### DOM rewrite — killed the canvas
Switched from HTML5 Canvas to pure DOM rendering. The canvas text was blurry on Retina displays due to anti-aliasing. Now the game renders in a `#screen` div with `white-space:pre`, and moving words live in a `#word-layer` div as absolutely-positioned spans. Native browser text rendering = crisp on all displays.

Removed everything graphical in the process: no ASCII sprites, no dungeon room borders, no torches, no particles. Pure text on black.

### Symbol pickups
Random symbol strings (`!@#`, `$&*`, etc.) spawn every 14–22 seconds during combat. They drift slowly and can be typed to collect a reward: +hp, +gold, +shield, or +dmg multiplier. They blink to stand out from combat words. If you miss one it just drifts off — no penalty.

### Dark/light mode toggle
Press `L` on the title screen or while paused. Dark mode is the default (black bg, grey text). Light mode uses an off-white background with dark text. Toggle label shown on title screen and pause menu.

### Bug fixes
- Enemy HP bar was displaying the color hex code (`#b2bec3`) as the label text. Fixed by removing the erroneous argument.
- Leaving the shop via ESC didn't mark the node as cleared or unlock the next nodes, making the boss unreachable. Fixed by applying the same clear/unlock logic used by rest rooms.

### QoL
- Players start with ¢30 gold so the first shop is immediately useful.
- All title screen text is properly centered.
- Added "by joe accardi" byline to title screen.
