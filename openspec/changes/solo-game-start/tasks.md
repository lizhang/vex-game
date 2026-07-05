## 1. Server: allow a solo room to be startable

- [x] 1.1 In `server/roomManager.js`, change `isRoomReady` from `room.players.length === 2` to `room.players.length >= 1` (keep the `every(p => p.team !== null)` team check).
- [x] 1.2 In `server/gameManager.js`, replace the `game:start` handler's `if (room.status !== 'ready') return;` gate with a not-in-progress guard (ignore when `room.status` is `countdown` or `playing`), keeping the existing `if (!roomMgr.isRoomReady(room)) return;` check.

## 2. Server: allow solo Play Again

- [x] 2.1 In `server/gameManager.js` `handlePlayAgain`, drop the `&& room.players.length === 2` clause so the restart triggers when `room.playAgain.size >= room.players.length` for a 1- or 2-player room.

## 3. Client: enable Start for a lone player

- [x] 3.1 In `src/components/RoomScreen.jsx`, change `canStart` from `room.playerCount === 2 && room.players.every(p => p.team)` to `room.playerCount >= 1 && room.players.every(p => p.team)`.

## 4. Verify behavior

- [x] 4.1 Verify a single player can join a room, pick a team, press Start, and play a solo match with score accumulating under the same point rules. _(Headless harness: solo start emits countdown→game:go→state:update with `myRobot` set and `otherRobot: null`. Timer/scoring path is unchanged existing behavior.)_
- [x] 4.2 Verify `GameScreen` renders a solo match correctly with no opponent robot (server sends `otherRobot: null`). _(Static: `GameScreen.jsx:235` guards the opponent with `renderState.otherRobot && (...)`; no other render depends on it.)_
- [x] 4.3 Verify solo Play Again returns the room to a startable state with the team preserved and a new match can start. _(Headless harness: lone player in `gameover` emits `game:play-again` and receives `game:ready`.)_
- [x] 4.4 Verify a 2-player match is unchanged: Start stays disabled until both players have teams, and the full versus lifecycle still works. _(Headless harness: two-player start emits countdown and both robots are present in state.)_
- [x] 4.5 Verify auto-convert: when a lone player has enabled Start and a second player joins before Start is clicked, Start disables until both players have teams. _(Headless harness: with a 2nd team-less player present, `game:start` is ignored — no countdown.)_
- [x] 4.6 Verify join protection: once a solo match is in `countdown`/`playing`, a player attempting to join that room receives the "Game in progress" error. _(Headless harness: join during active solo game rejected with `room:error` "Game in progress".)_
