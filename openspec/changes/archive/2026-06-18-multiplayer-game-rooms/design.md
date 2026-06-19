## Context

The VEX IQ game is a single-player, browser-based game built with React + Vite. Game state lives in a `useRef` (mutable, updated each frame via `requestAnimationFrame`), with a frozen snapshot pushed to `useState` for rendering. All logic (physics, collision, scoring) runs client-side in pure JS modules under `src/game/`. The field is 800x600px with DOM-based rendering (absolutely positioned divs).

To support two-player cooperative play, we need real-time communication between two browsers and a server to arbitrate shared state. The existing game logic modules are pure functions that can be reused on the server.

## Goals / Non-Goals

**Goals:**
- Two players cooperate on the same field in real time with low-latency controls
- Server-authoritative game logic for pickup, throw, scoring, and collision to prevent conflicts
- Simple lobby/room system for finding and joining games
- Persist game results for future stats display
- Reuse existing game logic modules on the server (no rewrite)

**Non-Goals:**
- User authentication or accounts (players enter a display name, no login)
- Horizontal scaling or multiple server instances (single Node process)
- Spectator mode
- Competitive (vs.) mode — this is cooperative only
- Mobile or touch controls
- Chat or voice communication between players

## Decisions

### 1. Hybrid client-server simulation model

**Decision**: Client runs movement and aim locally for instant feedback. Server is authoritative for pickup, throw physics, scoring, bump detection, and the match timer.

**Alternatives considered**:
- *Fully server-authoritative*: All input sent as raw keypresses, server simulates everything. Would add noticeable input lag to movement. Overkill for a cooperative casual game.
- *Fully client-authoritative with relay*: Each client runs full simulation, server just relays. Creates desync on pickup conflicts (both clients think they grabbed the same bag). Would need reconciliation logic.

**Rationale**: The hybrid approach gives instant movement feel while preventing the only meaningful conflict (two players grabbing the same bag). Since players cooperate rather than compete, minor position desync between what each player sees for the remote robot is acceptable.

### 2. Event-driven action processing (no tick-based server loop)

**Decision**: Process player actions as they arrive via Socket.IO handlers. Node's single-threaded event loop naturally serializes concurrent events.

**Alternatives considered**:
- *Fixed-rate server tick (e.g., 20Hz)*: Collect actions into a queue, process all pending actions each tick, broadcast batched updates. Standard for competitive multiplayer games.

**Rationale**: For two cooperating players, event-driven is simpler and lower latency. The server only needs to process discrete events (pickup, throw, move), not run continuous physics. The only continuous server task is the 60-second countdown timer, which runs as a `setInterval`. If we later need deterministic replay or competitive mode, we can switch to tick-based.

### 3. Server-side timer with `setInterval`

**Decision**: Server runs a 1-second interval timer, broadcasting remaining time to clients. Server ends the game when time reaches 0.

**Rationale**: Clients cannot be trusted with the timer in multiplayer. A 1-second broadcast interval is sufficient for a countdown display. The server checks exact elapsed time (not decrement) to avoid drift.

### 4. Position update throttling

**Decision**: Client sends position updates at most every 50ms (20Hz) while moving. Client renders locally at full framerate.

**Rationale**: 60 position updates/sec per player is excessive for a cooperative game. 20Hz is visually smooth enough for the remote robot's movement. The local player's robot renders at full framerate from local state.

### 5. Room state in server memory only

**Decision**: The 10 rooms and all live game state exist only in server memory. DynamoDB is used solely for persisting completed game results.

**Alternatives considered**:
- *Room state in DynamoDB*: Would survive server restarts but adds latency and complexity for state that changes every frame.
- *Redis for room state*: Overkill for single-server deployment.

**Rationale**: Single server, casual use, no need for durability of transient game state. If the server restarts, active games are lost — acceptable for this use case.

### 6. Shared game logic modules between client and server

**Decision**: `physics.js`, `collision.js`, `scoring.js`, `fieldLayout.js`, and `constants.js` are imported by both the client (for local prediction where applicable) and the server (for authoritative simulation). These files stay in `src/game/` and are imported by the server using ESM.

**Rationale**: Avoids duplicating game logic. The server package.json uses `"type": "module"` to support ESM imports from the shared `src/game/` directory.

### 7. Project structure

**Decision**: Server code lives in `server/` at project root. Server has its own `package.json` for server-only dependencies (`socket.io`, AWS SDK). Shared game logic stays in `src/game/`.

```
vex-game/
  src/                    (frontend — React + Vite)
    game/                 (shared game logic — pure JS, ESM)
      physics.js
      collision.js
      scoring.js
      fieldLayout.js
    constants.js
    components/
    hooks/
  server/                 (backend — Node.js + Socket.IO)
    index.js              (entry point, HTTP + Socket.IO setup)
    roomManager.js        (room state, join/leave/team logic)
    gameManager.js        (game loop, action processing, bump/stun)
    dynamodb.js           (DynamoDB client, result writes)
    package.json          (server-only deps)
```

### 8. Bump detection and stun

**Decision**: Server checks robot-robot distance after every move update. If distance < `ROBOT_SIZE` (40px), both robots are pushed back one robot length (40px) along their approach vector and stunned for 1 second. During stun, the server ignores all actions from that player.

**Rationale**: Simple distance check is sufficient for two square robots approximated as circles. Pushing along the approach vector (not just backwards) handles head-on and side collisions naturally.

### 9. DynamoDB table design

**Decision**: Single `GameResults` table. Partition key: `roomId` (Number). Sort key: `playedAt` (String, ISO-8601). Attributes: `players`, `teams`, `score`, `breakdown`, `endReason`, `duration`.

**Rationale**: Supports the two planned queries efficiently — "highest score" via Scan (small table) and "games in room X" via Query on partition key. No GSI needed at current scale.

## Risks / Trade-offs

- **Remote robot jitter**: At 20Hz updates, the other player's robot may appear to move in small jumps rather than smoothly. → Mitigation: Client-side interpolation of remote robot position between updates. Can add later if noticeable; may not matter with DOM-based rendering.

- **Server as single point of failure**: If the Node process crashes, all active games are lost. → Mitigation: Acceptable for casual use. Process manager (pm2) can auto-restart. No mid-game resume by design.

- **Bag pickup race condition perception**: Player presses Enter, waits for server confirmation — if server is slow (>100ms), pickup feels unresponsive. → Mitigation: On local network, latency is <10ms. For remote play, could add a "reaching" animation during the wait. Defer until it's a real problem.

- **Stun griefing**: A player could intentionally bump their teammate to stun them. → Mitigation: Cooperative game with no user accounts — social pressure is sufficient. Both players get stunned, so griefing hurts the griefer too.

- **DynamoDB costs**: Each game completion writes one item. At casual usage, this is well within free tier. No concern.
