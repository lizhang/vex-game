## Context

The game began life single-player and was later converted to 2-player multiplayer rooms. The multiplayer conversion added lobby gating that requires exactly 2 players with teams before a match can start. Investigation shows the runtime game engine is already solo-safe:

- `createGameState` (gameManager.js) builds one robot per `room.players` entry — 1 player yields 1 robot.
- `emitStateToRoom` sends `otherRobot: null` when there is no second player.
- `checkBump` returns early when `Object.keys(state.robots).length < 2`.
- `player:move` guards the opponent broadcast with `if (otherPlayer)`.

So the change is purely about lobby/start gating, not gameplay. Four gates currently forbid a solo start, spread across client and server.

## Goals / Non-Goals

**Goals:**
- Let a single player with a team start and play a match using the existing Start button.
- Keep 2-player matches behaving exactly as before.
- Support solo Play Again.
- Preserve existing join protection (late joiners get "Game in progress").

**Non-Goals:**
- No separate "Start Solo" button or explicit room mode/flag.
- No changes to gameplay, scoring, physics, or the game engine.
- No "claim solo to lock out joiners before start" behavior — a joiner arriving during the pre-start window is allowed and converts the room to 2-player.

## Decisions

**Decision 1: Relax the minimum player count rather than add an explicit mode.**
A room with 1 player is solo; with 2 players it is versus. No `mode` field is introduced.
- *Why:* The engine already supports one robot, so no new state is needed. This is the smallest change that satisfies the requirement.
- *Alternative considered:* An explicit `room.mode = 'solo' | 'versus'`. Rejected — it threads new state through client, server, status model, and Play Again for no behavioral gain given the "auto-convert to versus" decision below.

**Decision 2: The Start button enables the instant a lone player has a team.**
`canStart` becomes `playerCount >= 1 && players.every(p => p.team)`.
- *Why:* Matches the user's chosen UX (no dedicated solo button).
- *Consequence:* If a second player joins before Start is clicked, `every(team)` becomes false (new player has no team yet) and Start disables — the room transparently becomes a versus lobby. This "auto-convert" is the intended behavior.

**Decision 3: Fix the server start gate to key off readiness + phase, not the literal `ready` status.**
A solo room sits at status `waiting` (set by `joinRoom` for 1 player). The current handler requires `status === 'ready'`, which would still block solo even after relaxing `isRoomReady`. Change the guard to: proceed when `isRoomReady(room)` is true and the room is not already in `countdown` or `playing`.
- *Why:* The `ready` status really means "2 players present," which conflates player count with game phase. Gating on `isRoomReady` (players + teams) plus a not-in-progress check expresses the real intent and covers both solo and versus.
- *Alternative considered:* Making `joinRoom` mark a 1-player room `ready`. Rejected — `waiting` vs `ready` is also used by the lobby to show joinability; overloading it risks display regressions.

**Decision 4: Solo Play Again drops the hard-coded 2.**
`handlePlayAgain` currently requires `playAgain.size >= players.length && players.length === 2`. Remove the `=== 2` clause so `size >= players.length` restarts for any occupied room (1 or 2 players).

## Risks / Trade-offs

- **Start button flicker when a joiner arrives mid-selection** → Accepted and intended (Decision 2). It communicates that the room became versus.
- **`isRoomReady` is used elsewhere** → It gates only the start path; broadening from `=== 2` to `>= 1` (still requiring teams) does not affect join or team-selection logic. Verify no other caller relies on the exact `=== 2` semantics.
- **Client `GameScreen` rendering a null opponent** → The server already sends `otherRobot: null`; confirm the client renders a solo match without assuming an opponent robot exists. This is a verification step, not expected new work.
- **Rollback** → All four edits are small and independent; reverting the diff fully restores 2-player-only behavior. No data migration, no infra change.
