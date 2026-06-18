# VEX IQ Level Up 2026-2027 Web Game

## Context

Build a web game simulating the VEX IQ "Level Up" 2026-2027 robotics competition. The player drives a robot on a top-down 2D field, picks up bean bags, and throws them into tiered goals for points using the real game's scoring rules. The repo is empty - this is a from-scratch build.

## Tech Stack
- React + Vite (scaffold with `npm create vite@latest . -- --template react`)
- Simple CSS (no frameworks, no game libraries)
- DOM-based rendering (absolutely positioned divs, not canvas)

## Game Rules (VEX IQ Level Up)
- **Field**: 8' x 6' rectangular landscape (rendered at 800x600px, 100px/ft)
- **Match**: 60-second countdown timer
- **Bean bags**: 20 pre-placed on field (8 blue, 8 red, 4 yellow). Robot carries **only one** bag at a time.
- **Scoring** (color matching required):
  - Floor Goals (sides): **1 point** — bag must be fully inside, must match goal color or be yellow
  - Pyramid Goal Level 1 (outer ring): **3 points** — must match pyramid color or be yellow
  - Pyramid Goal Level 2 (middle ring): **6 points** — must match pyramid color or be yellow
  - Pyramid Goal Level 3 (inner corner): **12 points** — must match pyramid color or be yellow
  - L4 Goals (center field): **16 points** — yellow bags only
  - Wrong color = 0 points, bag sits in goal, can be picked back up
  - Bag on boundary of two tiers = scores the lower tier
- **Single player** (blue team) for now. Field split doesn't matter yet.

## Controls
| Key | Action |
|-----|--------|
| Arrow keys | Move robot (or rotate aim direction in aim mode) |
| Enter | Pick up a nearby bean bag |
| Space | Enter aim mode -> lock direction -> throw (3 presses) |
| Escape | Cancel aim mode |

## Architecture

### Game Loop (hybrid React pattern)
- Game state lives in a `useRef` (mutable, synchronous updates each frame)
- `requestAnimationFrame` loop runs physics/collisions/input each frame
- A render snapshot is pushed into `useState` once per frame to trigger React re-renders
- Keyboard input tracked via `keydown`/`keyup` in a ref-based `Set` (no React state)
- "Just pressed" detection via a separate set cleared each tick (prevents Enter/Space repeating)

### Project Structure
```
src/
  main.jsx                 # Entry point
  App.jsx / App.css        # Screen state machine (start -> playing -> game-over)
  constants.js             # All dimensions, speeds, colors, radii
  components/
    GameScreen.jsx/.css    # Main game container, wires hooks, renders children
    Field.jsx/.css         # 800x600 field with position:relative, contains all game objects
    Robot.jsx/.css          # 40x40px square with direction indicator
    BeanBag.jsx/.css       # 16px colored circle, state-dependent styling
    PyramidGoal.jsx/.css   # Nested squares aligned to corner (L1=150px, L2=100px, L3=50px)
    FloorGoal.jsx/.css     # Side goal rectangles (50x300)
    L4Goal.jsx/.css        # Center field goals (50x50, yellow only)
    YellowBar.jsx/.css     # Thin vertical barrier lines
    AimIndicator.jsx/.css  # Direction arrow + oscillating power bar
    HUD.jsx/.css           # Timer, score, carry indicator, breakdown
    StartScreen.jsx/.css   # Title + "Press Enter to Start"
    GameOverScreen.jsx/.css # Final score + breakdown + replay
  game/
    physics.js             # Robot movement, projectile trajectory, friction
    collision.js           # Wall bounds, bar collision, pickup proximity, goal hit detection
    scoring.js             # Score calculation based on bag position + color matching
    fieldLayout.js         # Positions of all goals, bars, initial bags
  hooks/
    useGameLoop.js         # Custom hook wrapping rAF
    useKeyboard.js         # Key tracking hook (ref-based, no state)
    useGameState.js        # Initializes and manages mutable game state ref
```

### Field Layout

The field uses VEX IQ tile structure: full tiles (100x100) in the interior, half tiles (50px) on edges, quarter tiles (50x50) at corners.

**Grid intersection coordinates:**
- X: 0, 50, 150, 250, 350, 450, 550, 650, 750, 800
- Y: 0, 50, 150, 250, 350, 450, 550, 600

```
      0       100     200     300     400     500     600     700     800
      +------------------------------X--------------------------------------+
   0  |[L3]                          |                              [  LZ  ]|
      |[  L2  ]                      |                              [      ]|
  50  |[    L1     ]   .b5           |              .r7      .r4    [      ]|
      |                              |                              +-------+
 150  +--+                           |                          .r3 |       |
      |  |                           |                              |       |
 200  |  |.b1                        |                              |       |
      |  |                 .y1 .b8 .y2   [L4]               .r6    |       |
 250  |FG|                           |   [  ]                       |  FG   |
      |RE|.b2     .b6               |                    .r6  .r2  | BLUE  |
 300  |D |                           |                              |       |
      |  |              [L4].y3 .r8 .y4                             |       |
 350  |  |              [  ]         |                              |       |
      |  |.b3                        |                          .r1 |       |
 400  |  |                           |                              |       |
      +--+                           |                              +-------+
 450  |                              |                              [  L1  ]|
      |                              |              .r5             [L2    ]|
 550  |     .b4  .b7                 |                              [ [L3] ]|
      | R  LZ                        |                              [      ]|
 600  +------------------------------X--------------------------------------+

  X = Yellow bar (thin vertical line, robot barrier, bags fly over)
  Top bar: (300, 0) to (300, 350)    Bottom bar: (500, 600) to (500, 250)
```

**Left side (x=0-50) top to bottom:**
- (0,0)-(150,150): Pyramid RED (L1/L2/L3)
- (0,150)-(50,450): Floor Goal RED (50x300)
- (0,450)-(50,600): Loading Zone / Blue player start

**Right side (x=750-800) top to bottom:**
- (750,0)-(800,150): Loading Zone (future P2)
- (750,150)-(800,450): Floor Goal BLUE (50x300)
- (650,450)-(800,600): Pyramid BLUE (L1/L2/L3)

### Element Positions

#### Pyramids (nested squares, aligned to wall corner)
| Element | Color | Coordinates | Points |
|---------|-------|-------------|--------|
| Top-left L3 | RED | (0,0) -> (50,50) | 12 |
| Top-left L2 | RED | (0,0) -> (100,100) | 6 |
| Top-left L1 | RED | (0,0) -> (150,150) | 3 |
| Bot-right L3 | BLUE | (750,550) -> (800,600) | 12 |
| Bot-right L2 | BLUE | (700,500) -> (800,600) | 6 |
| Bot-right L1 | BLUE | (650,450) -> (800,600) | 3 |

#### L4 Goals (50x50, yellow bags only, 16pts)
| Goal | Center | Coordinates |
|------|--------|-------------|
| Top L4 | (300, 350) | (275,325) -> (325,375) |
| Bottom L4 | (500, 250) | (475,225) -> (525,275) |

#### Yellow Bars (thin vertical lines, robot blocked, bags fly over)
| Bar | From | To |
|-----|------|----|
| Top bar | (300, 0) | (300, 350) |
| Bottom bar | (500, 600) | (500, 250) |

#### Floor Goals (1pt, bag must be fully inside, color match or yellow)
| Goal | Color | Coordinates | Size |
|------|-------|-------------|------|
| Left | RED | (0,150) -> (50,450) | 50x300 |
| Right | BLUE | (750,150) -> (800,450) | 50x300 |

#### Loading Zones (start areas, no loading mechanic)
| Zone | Coordinates | Size |
|------|-------------|------|
| Bot-left (robot start) | (0,450) -> (50,600) | 50x150 |
| Top-right (future P2) | (750,0) -> (800,150) | 50x150 |

#### Bean Bags (20 total)

**Blue (8):**
| # | Position |
|---|----------|
| b1 | (100, 200) |
| b2 | (100, 300) |
| b3 | (100, 400) |
| b4 | (150, 550) |
| b5 | (250, 50) |
| b6 | (250, 300) |
| b7 | (250, 550) |
| b8 | (400, 250) |

**Red (8, 180 degree rotation of blue around center 400,300):**
| # | Position | Mirrored from |
|---|----------|---------------|
| r1 | (700, 400) | b1 |
| r2 | (700, 300) | b2 |
| r3 | (700, 200) | b3 |
| r4 | (650, 50) | b4 |
| r5 | (550, 550) | b5 |
| r6 | (550, 300) | b6 |
| r7 | (550, 50) | b7 |
| r8 | (400, 350) | b8 |

**Yellow (4):**
| # | Position |
|---|----------|
| y1 | (350, 250) |
| y2 | (450, 250) |
| y3 | (350, 350) |
| y4 | (450, 350) |

#### Robot
| Element | Position |
|---------|----------|
| Start | (25, 550) in bottom-left loading zone |

### Aim + Power Throw Mechanic (3-press Space)
1. **Press Space** -> Enter aim mode (robot freezes). Direction arrow appears at robot's facing angle.
2. **LEFT/RIGHT** rotates the arrow. **Press Space again** -> direction locks, power bar starts oscillating (0->100%->0, ~1.25s cycle).
3. **Press Space again** -> bag launches at locked angle with captured power. Bag decelerates via linear friction (300px/s^2), bounces off walls, and stops. Scoring is checked when bag stops moving.

### Projectile Physics
- Max throw speed: 500px/s (at 100% power), min: 100px/s
- Linear friction: 300px/s^2 deceleration
- Max-power throw travels ~415px (~4 feet) before stopping
- Wall bounces at 50% energy loss
- Bags fly OVER yellow bars (bars do not block projectiles)
- Delta time capped at 0.1s to prevent physics explosions on tab switch

### Scoring Detection
When a bag stops, check position against goals (innermost first):
- L4 center (50x50) -> 16 points (yellow only)
- L3 corner (50x50) -> 12 points (match color or yellow)
- L2 middle (100x100) -> 6 points (match color or yellow)
- L1 outer (150x150) -> 3 points (match color or yellow)
- Floor goal rectangle (50x300) -> 1 point (fully inside + match color or yellow)
- Wrong color -> 0 points, bag stays, can be picked up again
- Miss -> bag stays on field, can be picked up again
- Bag on boundary of two tiers -> scores the lower tier

### Collision Rules
- Robot cannot cross yellow bars (top bar at x=300, bottom bar at x=500)
- Robot must navigate around bar endpoints to cross the field
- Robot cannot exit field bounds (0,0)-(800,600)
- Bags (projectiles) ignore yellow bars entirely

## Implementation Phases

### Phase 0: Project Init
- Scaffold Vite+React project (`npm create vite@latest . -- --template react`)
- Clean out Vite boilerplate (default App.jsx, assets, etc.)
- `npm install`
- Set up base file structure (`src/components/`, `src/game/`, `src/hooks/`)
- **Commit**: "Phase 0: Project scaffolding"

### Phase 1: Scaffolding + Static Field
- Create `constants.js` and `fieldLayout.js`
- Build `Field`, `PyramidGoal`, `FloorGoal`, `L4Goal`, `YellowBar`, `BeanBag` components (static, no interactivity)
- Build `HUD` with placeholder values
- Build `StartScreen` and `App` screen state machine
- **Result**: Visually complete field rendering
- **Commit**: "Phase 1: Static field rendering"

### Phase 2: Robot Movement + Timer
- Build `useKeyboard` hook (key tracking + just-pressed detection)
- Build `useGameLoop` hook (rAF + delta time)
- Implement robot movement in `physics.js` (4-dir, diagonal normalization, wall clamping)
- Implement yellow bar collision (robot blocked, must go around)
- Implement timer countdown
- Wire game phases: waiting -> playing -> finished
- Prevent default browser scroll on arrow keys/space
- **Result**: Robot moves, timer counts down, game ends at 0
- **Commit**: "Phase 2: Robot movement and timer"

### Phase 3: Bean Bag Pickup
- Implement proximity-based pickup in `collision.js`
- Enter-to-pickup with just-pressed detection
- HUD carry indicator (show bag color or empty)
- Visual: carried bag shown on robot, disappeared from field
- **Result**: Robot picks up bags from field
- **Commit**: "Phase 3: Bean bag pickup"

### Phase 4: Aim + Throw System
- Build `AimIndicator` (rotating arrow + oscillating power bar)
- Implement aim state machine (direction -> power -> launch)
- Implement projectile physics (velocity, friction, wall bounce, stop detection)
- Bags fly over yellow bars (no bar collision for projectiles)
- **Result**: Full throw mechanic working end-to-end
- **Commit**: "Phase 4: Aim and throw system"

### Phase 5: Scoring + Game Over
- Implement scoring detection in `scoring.js` with color matching rules
- Check pyramid color match (red pyramid = red/yellow bags, blue pyramid = blue/yellow bags)
- Check floor goal color match + fully-inside requirement
- L4 accepts yellow only
- Boundary rule: bag across two tiers = lower tier score
- Update HUD score and breakdown on score
- Scored bags get visual distinction (can't be re-picked-up)
- Wrong-color bags score 0, stay in goal, can be picked up again
- Build `GameOverScreen` with score breakdown + replay
- Score flash animation, timer warning under 10s
- **Result**: Complete playable game
- **Commit**: "Phase 5: Scoring and game over"

### Phase 6: Polish
- Tune all constants (speeds, radii, oscillation)
- Score popup animation floating up on point gain
- `React.memo` on BeanBag components for performance
- Center game on screen, prevent body scrolling
- Controls guide panel
- Edge cases (all bags used, boundary scoring)
- **Commit**: "Phase 6: Polish and tuning"

## Verification
1. `npm run dev` -> game loads with start screen
2. Press Enter -> field appears with robot, bags, goals, timer starts
3. Arrow keys move robot smoothly, can't exit field bounds
4. Robot blocked by yellow bars, must navigate around endpoints
5. Move near a bag, press Enter -> bag picked up, shown on robot
6. Press Space -> aim arrow appears, LEFT/RIGHT rotates it
7. Press Space -> power bar oscillates
8. Press Space -> bag launches, decelerates, stops
9. Bag flies over yellow bars if thrown across
10. Bag in matching-color goal -> score updates correctly (1/3/6/12/16 based on zone)
11. Wrong-color bag in goal -> 0 points, can pick back up
12. Yellow bag works in any goal
13. L4 only accepts yellow bags
14. Bag on tier boundary -> scores lower tier
15. Timer hits 0 -> game over screen with final score, press Enter to replay
