## Why

Build a playable web game simulating the VEX IQ "Level Up" 2026-2027 robotics competition. The repo is empty and needs a complete from-scratch implementation. This is a single-player game where the blue team player drives a robot to pick up bean bags and throw them into tiered goals for points within a 60-second match.

## What Changes

- Scaffold a new React + Vite project with DOM-based rendering (absolutely positioned divs, no canvas)
- Implement an 800x600 landscape field with VEX IQ tile grid, two pyramid goals, two L4 goals, two floor goals, two yellow bar barriers, and 20 pre-placed bean bags
- Implement robot movement with arrow keys, constrained by field bounds and yellow bar barriers
- Implement bean bag pickup via proximity detection and Enter key
- Implement a 3-phase aim+power+throw mechanic with projectile physics (friction, wall bounce)
- Implement scoring with color matching rules: bags must match goal color or be yellow, L4 is yellow-only
- Implement game flow: start screen, 60-second match with countdown, game over with score breakdown and replay

## Capabilities

### New Capabilities
- `field-rendering`: Static field layout with all game elements — pyramids, floor goals, L4 goals, yellow bars, bean bags, loading zones — rendered as absolutely positioned divs
- `robot-movement`: Arrow key robot movement with diagonal normalization, wall clamping, and yellow bar collision blocking
- `bag-pickup`: Proximity-based bean bag pickup with Enter key, carry-one-at-a-time constraint, and HUD carry indicator
- `aim-throw`: 3-press Space aim+power+throw mechanic with rotating direction arrow, oscillating power bar, and projectile physics (friction deceleration, wall bounce, bags fly over yellow bars)
- `scoring`: Score detection when bags stop moving, with color matching rules (match goal color or yellow), L4 yellow-only, boundary-means-lower-tier rule, floor-goal-fully-inside rule, wrong-color-stays-and-can-be-repicked
- `game-flow`: Screen state machine (start -> playing -> game-over), 60-second countdown timer, game over screen with score breakdown and replay

### Modified Capabilities

None — this is a greenfield project.

## Impact

- **New project**: Entire codebase created from scratch
- **Dependencies**: React, Vite (dev tooling only, no runtime game libraries)
- **File structure**: `src/components/`, `src/game/`, `src/hooks/` with ~15 new files
- **No external APIs or databases** — fully client-side
