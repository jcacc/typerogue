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

### Difficulty levels
Three difficulty modes selectable before each run: Beginner, Normal, Hard. Selected on a dedicated screen after class select (ESC goes back). Each mode applies multipliers to enemy HP, word speed, word spawn interval, attack interval, attack damage, and player starting HP and gold. Beginner gives kids and new players a fighting chance; Hard removes the safety net. Difficulty is recorded in the best run display.

### Claude Code terminal theme
Switched to a VS Code-inspired color palette (dark and light variants) and a system monospace font stack (Menlo / Monaco / Cascadia Code / Consolas) so the game looks like a native terminal session rather than a web game.

### Dungeonsynth music
Replaced the techno step sequencer with a slow atmospheric score: detuned sine/triangle pads, bass drones, a sparse organ melody, and a feedback-delay cave reverb. Three modes — dungeon (55 BPM, A Aeolian), combat (68 BPM, A Phrygian), boss (78 BPM, A+E♭ tritone drone).

### GitHub link + light mode default
Added a link to the repo on the title screen. Light mode is now the default.

### Bug fix — GitHub link not clickable
The link was embedded inside a `white-space:pre` innerHTML string, which made it unclickable. Moved it to a standalone `<a id="gh-link">` DOM element positioned absolutely in `#game`, shown only on the title screen and hidden on all other screens via `clear()`.

### Title screen centering
Replaced the manual `c()` space-padding function with a `.centered` CSS class (`text-align:center`) applied to `#screen` only during the title render. Ensures the GitHub link and all title text share the same center point.
