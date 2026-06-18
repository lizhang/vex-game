## 1. Project Setup

- [x] 1.1 Create `server/` directory with `package.json` (type: module) and install server dependencies (`socket.io`, `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`)
- [x] 1.2 Create server entry point `server/index.js` with HTTP server + Socket.IO setup, listening on port 3001
- [x] 1.3 Add `socket.io-client` to the frontend `package.json`
- [x] 1.4 Configure Vite dev proxy to forward Socket.IO connections to the Node server (update `vite.config.js`)
- [x] 1.5 Add npm scripts for running the server (`npm run server`) and running both frontend + server together
- [ ] 1.6 Commit: "Add multiplayer project setup: Node server, Socket.IO, Vite proxy"

## 2. Room Management

- [ ] 2.1 Create `server/roomManager.js` — initialize 10 rooms in memory on startup, each with status `empty`, players array, and team assignments
- [ ] 2.2 Implement join room logic: validate room availability (< 2 players, not `playing`), add player, update status (`empty` → `waiting`, `waiting` → `ready`)
- [ ] 2.3 Implement leave room logic: remove player, update status (`waiting` → `empty`, `ready` → `waiting`), handle mid-game leave (end game with `abandoned`)
- [ ] 2.4 Implement team selection: first-come-first-served, deny if team already taken, assign remaining team
- [ ] 2.5 Wire up Socket.IO events for room management: `room:join`, `room:leave`, `room:select-team`, `room:list` (broadcast room status to lobby clients)
- [ ] 2.6 Commit: "Add room management: 10 pre-created rooms, join/leave, team selection"

## 3. Game Lifecycle

- [ ] 3.1 Create `server/gameManager.js` — manage per-room game state (two robots, bags, score, breakdown, timer, stun timers)
- [ ] 3.2 Implement game start with countdown: validate room is `ready`, emit `countdown` events (3, 2, 1) at 1-second intervals, then `game:go`
- [ ] 3.3 Implement server-side match timer: start 60-second timer on `game:go`, broadcast `timer:update` every second using elapsed time (not decrement), emit `game:over` at 0
- [ ] 3.4 Implement game-over flow: calculate final score/breakdown, emit `game:over` to both clients, transition room to `gameover` status
- [ ] 3.5 Implement play-again flow: track which players have pressed play-again, reset game state when both confirm, return room to `ready` status with teams preserved
- [ ] 3.6 Commit: "Add game lifecycle: countdown, timer, game-over, play-again flow"

## 4. Server Game Logic

- [ ] 4.1 Handle `player:move` — update robot position in server state, check bump detection (distance < ROBOT_SIZE between robots), relay position to other client
- [ ] 4.2 Implement bump mechanic — push both robots back ROBOT_SIZE pixels along approach vector, set stun timer (1 second), emit `bump` event with corrected positions
- [ ] 4.3 Implement stun enforcement — ignore all actions from a stunned player until stun timer expires
- [ ] 4.4 Handle `player:pickup` — check bag availability and proximity, grant or deny, emit `pickup:confirm` or `pickup:denied`, broadcast bag state update
- [ ] 4.5 Handle `player:throw` — receive angle/power/bagId, simulate projectile using `updateProjectile` from shared `physics.js`, check scoring via `checkScoring`, emit `score` event and updated bag/score state
- [ ] 4.6 Add second robot starting position to `constants.js` (blue start: x=775, y=75) and stun duration constant (1 second)
- [ ] 4.7 Commit: "Add server game logic: move, pickup, throw, bump/stun mechanics"

## 5. Frontend: Lobby and Room Screens

- [ ] 5.1 Create `LobbyScreen` component — display name input, list of 10 rooms with status/player count, Join button per available room
- [ ] 5.2 Create `RoomScreen` component — show room number, player list with team colors, team selection buttons (red/blue), Start button (enabled when 2 players + teams assigned), Leave button
- [ ] 5.3 Create `CountdownOverlay` component — full-screen overlay showing 3, 2, 1, GO! text centered on screen
- [ ] 5.4 Update `App.jsx` page flow — replace 3-screen flow with: lobby → room → playing (with countdown overlay) → gameover, manage screen transitions based on Socket.IO events
- [ ] 5.5 Create `useSocket` hook — establish Socket.IO connection, expose emit/on helpers, handle connect/disconnect lifecycle
- [ ] 5.6 Update `GameOverScreen` — add "Play Again" and "Leave Room" buttons, show waiting state when one player has pressed Play Again
- [ ] 5.7 Commit: "Add lobby, room, and countdown screens with Socket.IO integration"

## 6. Frontend: Multiplayer Game Screen

- [ ] 6.1 Update `Robot` component — add `team` prop for body color (red/blue), add `isLocal` prop to toggle grey overlay on remote robot, add `stunned` prop for dizzy CSS effect
- [ ] 6.2 Add dizzy stun CSS animation — shake/wobble keyframes on the robot div, rotating star pseudo-elements or spans above the robot, active during stun
- [ ] 6.3 Update `useGameState` — split into local state (my robot position, direction, aim state) and server state (remote robot, bags, score, timer, stun status)
- [ ] 6.4 Update `GameScreen` — render two `<Robot>` components (local + remote), wire local movement to Socket.IO emit (throttled at 50ms), listen for server state updates to render remote robot, bags, score, timer
- [ ] 6.5 Update pickup flow — on Enter press, send `player:pickup` to server and wait for `pickup:confirm`/`pickup:denied` instead of locally granting the bag
- [ ] 6.6 Update throw flow — on throw release, send `player:throw` with bagId/angle/power to server, remove bag from local carried state, wait for server to broadcast scoring result
- [ ] 6.7 Listen for `bump` events — snap local robot to corrected position, enter stun state (ignore input for 1 second, show dizzy effect)
- [ ] 6.8 Listen for `score` events — update score popup display and score/breakdown from server broadcasts
- [ ] 6.9 Commit: "Add multiplayer game screen: two robots, server sync, bump/stun effects"

## 7. DynamoDB Persistence

- [ ] 7.1 Create `server/dynamodb.js` — DynamoDB client setup reading from environment variables, graceful fallback if not configured (log warning, no-op writes)
- [ ] 7.2 Implement `saveGameResult` function — write one item to GameResults table with roomId, playedAt, players, teams, score, breakdown, endReason, duration
- [ ] 7.3 Call `saveGameResult` from gameManager on game-over (both completed and abandoned), fire-and-forget with error logging
- [ ] 7.4 Commit: "Add DynamoDB game results persistence"

## 8. Integration and Polish

- [ ] 8.1 End-to-end test: two browser tabs connect, join same room, select teams, start game, both robots visible, movement synced
- [ ] 8.2 Test pickup conflict: both players attempt to grab same bag, verify first-come-first-served
- [ ] 8.3 Test bump mechanic: drive robots into each other, verify pushback + stun + dizzy effect
- [ ] 8.4 Test game lifecycle: complete game, play again, leave room, verify room status transitions
- [ ] 8.5 Test disconnect handling: close one tab mid-game, verify game ends with abandoned, remaining player sees game over
- [ ] 8.6 Commit: "Integration testing and polish for multiplayer game rooms"
