# Pokémon Dice Battle — JS Structure (V2.9.0 Refactor)

This refactor intentionally changes no game logic. V2.8.3 `game.js` was split line-for-line.

Load order:
1. data.js — Pokémon data and image map
2. state.js — global game state and dice-state helpers
3. audio.js — BGM, SFX, Web Audio, sound toggle
4. setup.js — mode/difficulty/team selection, AI team construction, Pokémon picking
5. ui.js — battle start, rendering, banners, Pokédex, hit effects, dice UI helpers
6. dice.js — dice roll animation, keep interaction, roll button handling
7. battle.js — skill validation, damage, victory/faint/turn progression
8. ai.js — AI rolling, keeping, move/switch decisions and AI turn
9. app.js — switch modal and final global event binding

Important:
- These are classic scripts, not ES modules.
- Preserve the script order in index.html.
- Do not rename/remove globals casually; files intentionally share the same global lexical environment.
- For future work, edit the owning file rather than rebuilding a monolithic game.js.
