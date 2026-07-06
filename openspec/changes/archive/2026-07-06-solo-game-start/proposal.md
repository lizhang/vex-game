## Why

Today a match can only start when a room has 2 players who have both picked teams, so a lone player cannot play at all — they are stuck waiting for a second person. The game engine already runs correctly with a single robot (single robot spawn, `otherRobot: null` handled, bump detection skipped when fewer than 2 robots), so the only thing preventing solo play is the lobby's start gating. This change lets a single player start a match.

## What Changes

- A lone player who has picked a team SHALL be able to start a match; the existing **Start** button enables as soon as the sole player has a team (no separate "Start Solo" affordance).
- The server's game-start gate SHALL accept a 1-player room that is ready (player has a team) and not already in countdown/playing, instead of requiring exactly 2 players.
- The **Play Again** flow SHALL support restarting a solo game (a single remaining player restarts without waiting for a second).
- No change to gameplay, scoring, or the game engine: a solo match uses the same single shared score and the same point rules as a 2-player match.
- No change to join protection: once a solo match starts (`countdown`/`playing`), the room is already locked and a late joiner receives the existing "Game in progress" error. If a second player joins during the pre-start window, the room naturally becomes a 2-player match again (Start disables until both have teams).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `game-rooms`: The "Game start with countdown" requirement changes from requiring 2 players to allowing 1 or more players (each with a team). The "Play again flow" requirement changes to allow a solo player to restart. Room status lifecycle gains a solo start path (`waiting` → `countdown`).

## Impact

- **Client**: `src/components/RoomScreen.jsx` — `canStart` condition (`playerCount === 2` → `playerCount >= 1`).
- **Server**: `server/roomManager.js` — `isRoomReady` (length `=== 2` → `>= 1`); `server/gameManager.js` — `game:start` handler status gate (require not-in-progress rather than `=== 'ready'`) and `handlePlayAgain` (drop the `length === 2` restriction).
- **No new dependencies, no engine changes, no scoring changes, no data-model changes.**
