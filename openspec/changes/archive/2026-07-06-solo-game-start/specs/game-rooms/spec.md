## MODIFIED Requirements

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
