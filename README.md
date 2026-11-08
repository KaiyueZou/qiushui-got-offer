# Qiushui’s Little World

A gentle, playable 3D gift for Qiushui: explore a pastel garden, collect three tennis balls, and jump beneath the gift block to reveal her Google-offer celebration.

## Run locally

Use Node.js 22.12 or newer and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Start with **Let’s go, Qiushui**. Focus the game to use **A/D or left/right arrows** and **Space, W, or Up** to jump. Phone and tablet users have on-screen movement and jump controls; moving and jumping can be held together. **Escape** pauses or resumes. Leaving the browser pauses the game. There are no enemies, lives, or time limits.

Sound is muted initially. The speaker button enables short synthesized chimes. **Open your surprise** bypasses gameplay. Reduced-motion preferences disable decorative motion, camera easing, and confetti. A renderer error or lost graphics context reveals an accessible celebration instead.

## Check and build

```sh
npm test
npm run build
npm run preview
```

Tests use Node’s built-in test runner and cover collisions, jumps, pickups, pause/resume, restarting, and the entire level. Production files are written to `dist/`. Relative asset paths preserve GitHub Pages subdirectory compatibility. Publishing is a separate, explicit step; local development does not deploy anything.

## Project structure

- `src/game/engine.ts`: deterministic movement, collision, collectible, and celebration state. Platform positions, ball locations, and the gift location live here.
- `src/hooks/useAdventure.ts`: fixed-step loop, pause/visibility handling, sound, and UI snapshots.
- `src/scene/`: procedural Three.js garden, camera, character, racket, gift, and particles. No remote models, textures, or fonts are required.
- `src/App.tsx` and `src/index.css`: accessible HTML controls, personal message, responsive page design, and celebration card.

React 18 pairs with React Three Fiber 8. Three.js supplies the renderer. All artwork is procedural; the character has long black hair, a light pink outfit, and a tennis racket. Game physics operates in two dimensions while the scene is rendered in 3D.

## Browser checks

Verify keyboard and on-screen control playthroughs, rapid restart during the reveal, Escape pause/resume, focus loss, resizing mid-game, reduced motion, muted/unmuted sound, and the surprise shortcut. Check widths of 320, 390, 768, and 1440 CSS pixels. On a physical touch device, also verify simultaneous movement and jumping and interruption by an OS gesture.
