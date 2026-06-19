## Why

The VEX IQ game is currently single-player only. The real VEX IQ competition is a cooperative two-player experience where teammates work together on the same field. Adding multiplayer transforms this from a solo practice tool into a collaborative game that mirrors the actual competition format, making it more engaging and useful for team practice.

## What Changes

- Add a Node.js server with Socket.IO for real-time WebSocket communication between two players
- Create 10 pre-created game rooms that players can browse and join from a lobby screen
- Each player selects a team (red or blue) and controls their own robot on a shared field
- Game logic splits: movement and aim are client-local for responsiveness; pickup confirmation, throw physics, scoring, bump detection, and timer are server-authoritative
- Robot collision (bump) mechanic: both robots push back one robot length and are stunned for 1 second with a dizzy effect
- Pickup conflicts resolved server-side (first request wins)
- Game results persisted to DynamoDB (append-only) for future stats queries (total games played, highest score)
- New page flow: Lobby → Room (team selection + start) → 3-2-1 Countdown → Game → Game Over (play again or leave)
- If a player leaves mid-game, the game ends immediately (no resume)

## Capabilities

### New Capabilities
- `game-server`: Node.js + Socket.IO server that manages game rooms, processes player actions, runs server-authoritative game logic (pickup, throw physics, scoring, bump detection, timer), and broadcasts state updates
- `game-rooms`: Pre-created room system with lobby browsing, join/leave, team selection, ready state, and play-again flow
- `multiplayer-field`: Two robots on the shared field with team colors, grey overlay on remote robot, cooperative scoring, bump/stun mechanic, and client-server state synchronization
- `game-results-persistence`: DynamoDB integration to persist game results (score, breakdown, players, teams, end reason) on game completion

### Modified Capabilities

## Impact

- **New dependencies**: `socket.io`, `socket.io-client`, `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`
- **New server directory**: `server/` with Node.js entry point, room management, game loop, and DynamoDB client
- **Frontend restructure**: `App.jsx` page flow expands from 3 screens to 5+; `useGameState` splits into local and server state; `GameScreen` renders two robots
- **Shared code**: `physics.js`, `collision.js`, `scoring.js`, `fieldLayout.js`, `constants.js` used by both client and server
- **Dev setup**: Vite dev server proxies WebSocket connections to the Node server
- **Build/deploy**: Need to run both the Vite frontend and Node server (or serve built frontend from Node in production)
