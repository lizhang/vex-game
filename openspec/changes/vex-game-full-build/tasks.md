## 0. Project Init

- [x] 0.1 Scaffold Vite+React project (`npm create vite@latest . -- --template react`)
- [x] 0.2 Clean out Vite boilerplate (default App content, unnecessary assets)
- [x] 0.3 Create directory structure (`src/components/`, `src/game/`, `src/hooks/`)
- [x] 0.4 Commit: "Phase 0: Project scaffolding"

## 1. Static Field Rendering

- [x] 1.1 Create `src/constants.js` with all game dimensions, speeds, colors, radii
- [x] 1.2 Create `src/game/fieldLayout.js` with positions of all goals, bars, bags, robot start
- [x] 1.3 Build `Field.jsx/.css` — 800x600 container with position:relative, grid lines, field background
- [x] 1.4 Build `PyramidGoal.jsx/.css` — nested corner-aligned squares (L1/L2/L3) with color prop
- [x] 1.5 Build `L4Goal.jsx/.css` — 50x50 purple/special square at center-field positions
- [x] 1.6 Build `YellowBar.jsx/.css` — thin vertical yellow line segments
- [x] 1.7 Build `FloorGoal.jsx/.css` — 50x300 colored rectangles on field edges
- [x] 1.8 Build `BeanBag.jsx/.css` — small colored element with position prop
- [x] 1.9 Build `Robot.jsx/.css` — 40x40 square with direction indicator
- [x] 1.10 Build `HUD.jsx/.css` — timer, score, carry indicator (placeholder values)
- [x] 1.11 Build `StartScreen.jsx/.css` — title + "Press Enter to Start"
- [x] 1.12 Build `GameScreen.jsx` — container that wires field and all game objects
- [x] 1.13 Build `App.jsx` screen state machine (start -> playing -> game-over) with placeholder transitions
- [x] 1.14 Verify: `npm run dev` shows visually complete field with all elements
- [x] 1.15 Commit: "Phase 1: Static field rendering"

## 2. Robot Movement + Timer

- [x] 2.1 Build `src/hooks/useKeyboard.js` — key tracking via ref-based Set, just-pressed detection, scroll prevention
- [x] 2.2 Build `src/hooks/useGameLoop.js` — requestAnimationFrame loop with delta time (capped at 0.1s)
- [x] 2.3 Build `src/hooks/useGameState.js` — initialize mutable game state ref, render snapshot via useState
- [x] 2.4 Implement robot movement in `src/game/physics.js` — 4-dir movement, diagonal normalization, speed from constants
- [x] 2.5 Implement field boundary clamping in `src/game/collision.js` — keep 40x40 robot within (0,0)-(800,600)
- [x] 2.6 Implement yellow bar collision in `collision.js` — robot blocked by line segments, can pass around endpoints
- [x] 2.7 Implement timer countdown in game loop — 60s countdown using delta time
- [x] 2.8 Wire game phases in App: Enter on start screen -> playing, timer 0 -> game over
- [x] 2.9 Wire hooks into GameScreen: keyboard input -> physics -> collision -> render snapshot
- [x] 2.10 Verify: robot moves smoothly, blocked by bars, timer counts down, game ends at 0
- [x] 2.11 Commit: "Phase 2: Robot movement and timer"

## 3. Bean Bag Pickup

- [x] 3.1 Implement proximity-based pickup detection in `collision.js` — check distance from robot to each field bag
- [x] 3.2 Implement Enter-to-pickup with just-pressed detection — single press only, carry-one-at-a-time
- [x] 3.3 Update bag state: picked up bag disappears from field, attaches to robot
- [x] 3.4 Update Robot component to show carried bag color
- [x] 3.5 Update HUD carry indicator to show current bag color or empty
- [x] 3.6 Verify: pick up bags near robot, can't pick up second, bag shows on robot and HUD
- [x] 3.7 Commit: "Phase 3: Bean bag pickup"

## 4. Aim + Throw System

- [x] 4.1 Build `AimIndicator.jsx/.css` — direction arrow + oscillating power bar
- [x] 4.2 Implement aim state machine in game state — idle -> aiming (direction) -> power (oscillating) -> launching
- [x] 4.3 Implement aim direction rotation via LEFT/RIGHT arrow keys during aim phase
- [x] 4.4 Implement power bar oscillation (0-100-0, ~1.25s cycle) with Space to capture
- [x] 4.5 Implement Escape to cancel aim mode at any phase
- [x] 4.6 Implement projectile launch in `physics.js` — velocity from angle + power, friction deceleration (300px/s^2)
- [x] 4.7 Implement wall bounce in `physics.js` — reflect velocity on wall hit, 50% energy loss
- [x] 4.8 Implement bag-stops detection — speed reaches 0, bag becomes stationary
- [x] 4.9 Ensure bags fly over yellow bars (no bar collision for projectiles)
- [x] 4.10 Verify: full aim+throw cycle works, bags decelerate, bounce off walls, stop on field
- [x] 4.11 Commit: "Phase 4: Aim and throw system"

## 5. Scoring + Game Over

- [x] 5.1 Implement pyramid tier scoring in `src/game/scoring.js` — check L3 then L2 then L1, boundary = lower tier
- [x] 5.2 Implement L4 scoring — yellow bags only, 16 points
- [x] 5.3 Implement floor goal scoring — fully-inside check (bag center + radius within goal bounds), 1 point
- [x] 5.4 Implement color matching — pyramid color match or yellow, floor goal color match or yellow, L4 yellow only
- [x] 5.5 Implement wrong-color handling — 0 points, bag stays at position, eligible for re-pickup
- [x] 5.6 Implement scored bag state — visual distinction, not eligible for pickup
- [x] 5.7 Update HUD with live score total and breakdown by goal type
- [x] 5.8 Implement score flash animation — "+N" floating up from bag position on score
- [x] 5.9 Implement timer warning — visual change (red/pulsing) when under 10 seconds
- [x] 5.10 Build `GameOverScreen.jsx/.css` — final score, breakdown by goal type, "Press Enter to Replay"
- [x] 5.11 Implement game reset on replay — timer, score, bags, robot all return to initial state
- [x] 5.12 Verify: complete playable game — scoring works, color matching enforced, game over shows breakdown, replay works
- [x] 5.13 Commit: "Phase 5: Scoring and game over"

## 6. Polish

- [x] 6.1 Tune constants — robot speed, throw speed, friction, oscillation cycle, pickup range
- [x] 6.2 Add React.memo to BeanBag and other static components for render performance
- [x] 6.3 Center game on screen, prevent body scrolling
- [x] 6.4 Add controls guide panel (overlay or sidebar showing key bindings)
- [x] 6.5 Handle edge cases — all bags used up, bags landing exactly on boundaries
- [x] 6.6 Score popup animation polish — fade out, float distance
- [x] 6.7 Final verification against all 15 verification criteria in PLAN.md
- [x] 6.8 Commit: "Phase 6: Polish and tuning"
