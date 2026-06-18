## Context

Greenfield project — no existing codebase. Building a single-player web game simulating the VEX IQ "Level Up" robotics competition. The game runs entirely client-side with React + Vite, using DOM-based rendering (absolutely positioned divs) rather than canvas.

The field is an 800x600px landscape representation of a 6'x8' physical VEX IQ field with a tile-based grid structure (half-tiles on edges, quarter-tiles on corners).

## Goals / Non-Goals

**Goals:**
- Playable single-player game with complete scoring
- Accurate field layout matching real VEX IQ Level Up field
- Smooth 60fps game loop with responsive controls
- 7-phase implementation with a working commit at each phase

**Non-Goals:**
- Multiplayer (designed for future addition but not implemented)
- Sound effects or music
- Mobile/touch controls
- Canvas rendering or WebGL
- AI opponents
- Loading zone bag dispensing (pre-placed bags only)

## Decisions

### 1. Hybrid React game loop pattern
**Decision**: Mutable game state in `useRef`, updated synchronously each frame via `requestAnimationFrame`. A frozen snapshot pushed into `useState` once per frame triggers React re-renders.

**Why**: Pure React state (useState/useReducer) causes re-renders on every state change and can't guarantee synchronous multi-field updates within a single frame. A mutable ref gives game-loop-style control while React handles rendering.

**Alternative**: Full canvas rendering — rejected because DOM-based rendering is simpler to style, debug, and extend with React components.

### 2. Keyboard input via ref-based Set
**Decision**: Track pressed keys in a `Set` stored in a `useRef`. A separate "just pressed" set is populated on keydown and cleared each game tick.

**Why**: React state for key tracking causes re-renders on every keypress and can't reliably detect single-press actions (Enter/Space) without debounce complexity. The just-pressed set gives clean single-fire detection.

### 3. Yellow bar collision as line segments
**Decision**: Model yellow bars as thin vertical line segments (x=300 from y=0 to y=350, x=500 from y=600 to y=250). Robot collision checks if movement would cross the line within the bar's y-range. Bags ignore bars entirely.

**Why**: The bars are described as "very thin, just a line" — no need for rectangle collision. Line-crossing detection is simpler and matches the physical game where the ramp is a thin obstacle.

### 4. Pyramid scoring as nested rectangles, not concentric circles
**Decision**: Pyramid tiers are axis-aligned rectangles (L1=150x150, L2=100x100, L3=50x50) nested into the field corner, not concentric rings. Check innermost (L3) first.

**Why**: Matches the physical VEX IQ pyramid structure where tiers are stacked platforms, not rings. Rectangle hit-testing is simpler than circular and aligns with the corner-aligned layout.

### 5. Phased implementation with commits
**Decision**: 7 phases (0-6), each producing a working state with a git commit. Each phase builds on the previous.

**Why**: Provides checkpoints for testing, rollback, and incremental verification. Each commit is independently demoable.

## Risks / Trade-offs

- **DOM rendering performance**: 20+ absolutely positioned divs with per-frame updates could cause layout thrashing. Mitigation: React.memo on static components (Phase 6), minimize DOM reads during game loop.
- **Delta time physics**: Tab-switching causes large delta spikes. Mitigation: Cap delta at 0.1s to prevent projectile teleportation.
- **Bar collision edge cases**: Robot sliding along a bar endpoint could cause tunneling. Mitigation: Clamp position after collision check, test edge cases in Phase 2.
- **Scoring boundary ambiguity**: Bag center vs. bag edge for tier detection needs a clear rule. Decision: Use bag center position for tier checks, "fully inside" for floor goals means entire bag radius within goal bounds.
