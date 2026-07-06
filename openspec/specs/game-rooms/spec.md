# game-rooms

## Purpose

Multiplayer game-room lifecycle for the VEX game: ten persistent rooms, a live lobby, joining with a display name, team selection, match start with countdown, leaving/disconnect handling, play-again, and the room status state machine.
## Requirements
### Requirement: Ten pre-created game rooms
The server SHALL initialize 10 game rooms on startup, numbered 1-10. Rooms SHALL persist in server memory for the lifetime of the process. Rooms are never created or destroyed dynamically.

#### Scenario: Server starts with 10 empty rooms
- **WHEN** the server process starts
- **THEN** 10 rooms SHALL exist in memory, each with status `empty` and zero players

### Requirement: Lobby screen displays room list
The client SHALL display a lobby screen showing all 10 rooms with their current status and player count. The room list SHALL update in real time as players join or leave rooms.

#### Scenario: Player views lobby
- **WHEN** a player navigates to the lobby screen
- **THEN** the client SHALL display all 10 rooms showing room number, status (empty/waiting/playing), and player count (0/2, 1/2, 2/2)

#### Scenario: Room status updates in real time
- **WHEN** another player joins or leaves a room while the lobby is displayed
- **THEN** the lobby SHALL update that room's status and player count without a page refresh

### Requirement: Player joins a room with a display name
A player SHALL enter a display name before joining a room. The player SHALL be able to join any room that has fewer than 2 players and is not in `playing` status.

#### Scenario: Player joins an empty room
- **WHEN** a player enters a name and clicks Join on an empty room
- **THEN** the player SHALL be added to the room, room status SHALL change to `waiting`, and the player SHALL see the room screen

#### Scenario: Player joins a room with one player
- **WHEN** a player enters a name and clicks Join on a room with 1 player
- **THEN** the player SHALL be added to the room, room status SHALL change to `ready`, and both players SHALL see the updated room screen

#### Scenario: Player tries to join a full or playing room
- **WHEN** a player tries to join a room that already has 2 players or is in `playing` status
- **THEN** the join SHALL be rejected and the player SHALL remain in the lobby

### Requirement: Team selection in room
Each player in a room SHALL select a team (red or blue). Team selection is first-come-first-served: the first player to select a team locks that choice.

#### Scenario: First player selects a team
- **WHEN** the first player in a room selects red or blue
- **THEN** that team SHALL be assigned to them and the selection SHALL be broadcast to the other player

#### Scenario: Second player selects the same team
- **WHEN** the second player selects a team already taken by the first player
- **THEN** the selection SHALL be denied and the second player SHALL be assigned the remaining team

#### Scenario: Player changes team before game starts
- **WHEN** a player changes their team selection while in `waiting` or `ready` status and the desired team is available
- **THEN** the team assignment SHALL update and broadcast to the other player

### Requirement: Game start with countdown
A player SHALL be able to press Start when the room has at least 1 player and every player in the room has a team assigned. The server SHALL broadcast a 3-2-1-GO countdown to all clients in the room before the game begins. A room with more than one player still requires all players to have teams assigned before Start is available.

#### Scenario: Solo player presses Start with a team assigned
- **WHEN** the only player in a room has selected a team and presses Start
- **THEN** the server SHALL emit `countdown` events (3, 2, 1) at 1-second intervals, then emit `game:go` to begin a solo match with a single robot

#### Scenario: Player presses Start with two players ready
- **WHEN** either player presses Start and the room has 2 players with teams assigned
- **THEN** the server SHALL emit `countdown` events (3, 2, 1) at 1-second intervals, then emit `game:go` to begin the match

#### Scenario: Player presses Start before selecting a team
- **WHEN** a player presses Start but at least one player in the room has no team assigned
- **THEN** the Start action SHALL be ignored

#### Scenario: Start remains disabled until the sole player picks a team
- **WHEN** a lone player is in a room and has not selected a team
- **THEN** the Start control SHALL be disabled

### Requirement: Player leaving a room
A player SHALL be able to leave a room at any time. If a player disconnects (closes browser, loses connection), they are treated as leaving.

#### Scenario: Player leaves during waiting
- **WHEN** a player leaves a room in `waiting` status
- **THEN** the room SHALL return to `empty` status and appear available in the lobby

#### Scenario: Player leaves during ready (before game)
- **WHEN** one player leaves a room in `ready` status
- **THEN** the room status SHALL change to `waiting`, the remaining player stays in the room

#### Scenario: Player leaves during active game
- **WHEN** a player disconnects or leaves during an active game
- **THEN** the game SHALL end immediately with `endReason: "abandoned"`, the remaining player SHALL see the game over screen, and the room SHALL return to a state where the remaining player can leave or wait for a new partner

#### Scenario: Player disconnects (browser close or network drop)
- **WHEN** Socket.IO detects a client disconnect
- **THEN** the server SHALL treat it as the player leaving and apply the same rules as an intentional leave

### Requirement: Play again flow
After a game ends (completed or abandoned), the players remaining in the room SHALL be able to start a new game without leaving the room. When every remaining player has pressed Play Again, the room SHALL return to a startable state with team assignments preserved. This SHALL work for a solo player as well as for two players.

#### Scenario: Solo player presses Play Again
- **WHEN** the only player in the room presses Play Again after game over
- **THEN** the room SHALL return to a startable state with the team assignment preserved, and the player can press Start for a new countdown

#### Scenario: Both players press Play Again
- **WHEN** both players press Play Again after game over
- **THEN** the room SHALL return to `ready` status with team assignments preserved, and either player can press Start for a new countdown

#### Scenario: One player presses Play Again, other hasn't decided
- **WHEN** one player presses Play Again and the other has not yet acted
- **THEN** the ready player SHALL see a "Waiting for other player..." message

#### Scenario: One player leaves after game over
- **WHEN** one player presses Leave Room after game over
- **THEN** that player SHALL return to the lobby, the room status SHALL change to `waiting` with the remaining player still in the room

### Requirement: Room status lifecycle
Rooms SHALL transition through defined statuses: `empty` → `waiting` → `ready` → `countdown` → `playing` → `gameover`. A match MAY start from `waiting` (solo, one player with a team) or from `ready` (two players with teams). After game over, rooms return to a startable state (`ready` or `waiting`) or to `empty` when players leave.

#### Scenario: Full two-player room lifecycle
- **WHEN** a room goes through a complete two-player game cycle
- **THEN** the status transitions SHALL follow: `empty` → (P1 joins) → `waiting` → (P2 joins) → `ready` → (Start pressed) → `countdown` → (3-2-1 done) → `playing` → (timer ends) → `gameover` → (both play again) → `ready`

#### Scenario: Solo room lifecycle
- **WHEN** a single player joins a room, selects a team, and starts a solo match
- **THEN** the status transitions SHALL follow: `empty` → (P1 joins) → `waiting` → (Start pressed with team assigned) → `countdown` → (3-2-1 done) → `playing` → (timer ends) → `gameover` → (play again) → `waiting`

