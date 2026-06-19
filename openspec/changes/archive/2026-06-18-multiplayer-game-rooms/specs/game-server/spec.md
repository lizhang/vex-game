## ADDED Requirements

### Requirement: Node.js server with Socket.IO
The system SHALL provide a Node.js HTTP server with Socket.IO for real-time WebSocket communication between clients and the server. The server SHALL listen on a configurable port (default 3001).

#### Scenario: Server starts and accepts connections
- **WHEN** the server process starts
- **THEN** it SHALL listen for HTTP and WebSocket connections on the configured port and log readiness

#### Scenario: Client connects via Socket.IO
- **WHEN** a browser client connects using the socket.io-client library
- **THEN** the server SHALL establish a WebSocket connection and assign the client a unique socket ID

### Requirement: Server processes player actions sequentially
The system SHALL process all player actions (move, pickup, throw) in the order they arrive via Node's event loop. No explicit action queue is needed; the single-threaded event loop provides natural serialization.

#### Scenario: Two pickup requests arrive for the same bag
- **WHEN** Player A and Player B both send a `player:pickup` event for the same bag
- **THEN** the server SHALL grant the bag to whichever request is processed first and deny the other with a `pickup:denied` response

#### Scenario: Move and pickup arrive from different players
- **WHEN** Player A sends a `player:move` and Player B sends a `player:pickup` near-simultaneously
- **THEN** both actions SHALL be processed in arrival order without blocking each other

### Requirement: Server-authoritative match timer
The server SHALL own the 60-second match timer. The server SHALL broadcast remaining time to both clients at 1-second intervals. The server SHALL end the game when the timer reaches 0.

#### Scenario: Timer counts down and ends the game
- **WHEN** a game starts after the 3-2-1 countdown
- **THEN** the server SHALL start a 60-second timer, broadcast `timer:update` events every second, and emit `game:over` when time reaches 0

#### Scenario: Timer uses elapsed time, not decrements
- **WHEN** the server timer ticks
- **THEN** it SHALL calculate remaining time based on elapsed time since game start (not by decrementing a counter) to avoid drift

### Requirement: Server handles throw physics and scoring
When a player throws a bag, the server SHALL simulate the throw trajectory using the shared `physics.js` module and determine scoring using `scoring.js`. The server SHALL broadcast the scoring result to both clients.

#### Scenario: Player throws a bag that scores
- **WHEN** a client sends `player:throw` with bagId, angle, and power
- **THEN** the server SHALL simulate the projectile using `updateProjectile`, check scoring via `checkScoring`, update the shared score, and emit a `score` event to both clients with the tier and points

#### Scenario: Player throws a bag that lands without scoring
- **WHEN** a client sends `player:throw` and the bag lands outside any goal
- **THEN** the server SHALL update the bag state to `landed` at its final position and broadcast the updated bag state to both clients

### Requirement: Server detects robot-robot bumps
The server SHALL check the distance between both robots after every position update. When robots overlap (distance < ROBOT_SIZE), the server SHALL trigger a bump event.

#### Scenario: Two robots collide
- **WHEN** the server receives a `player:move` and the resulting robot positions are within ROBOT_SIZE distance of each other
- **THEN** the server SHALL push both robots back one robot length (ROBOT_SIZE pixels) along their approach vector, stun both for 1 second, and emit a `bump` event to both clients with corrected positions and stun duration

#### Scenario: Stunned player sends actions
- **WHEN** a player is in the stunned state and sends `player:move`, `player:pickup`, or `player:throw`
- **THEN** the server SHALL ignore all actions from that player until the 1-second stun duration expires

### Requirement: Server confirms or denies pickup requests
When a client sends a `player:pickup` request, the server SHALL check bag availability and respond with either `pickup:confirm` or `pickup:denied`.

#### Scenario: Player picks up an available bag
- **WHEN** a client sends `player:pickup` for a bag that is in `field` or `landed` state and within PICKUP_RANGE of the player's robot
- **THEN** the server SHALL set the bag state to `carried`, assign it to that player's robot, and emit `pickup:confirm` to the requesting client and a state update to the other client

#### Scenario: Player tries to pick up an unavailable bag
- **WHEN** a client sends `player:pickup` for a bag that is already `carried`, `flying`, or `scored`
- **THEN** the server SHALL emit `pickup:denied` to the requesting client

### Requirement: Vite dev proxy for WebSocket
In development, the Vite dev server SHALL proxy WebSocket connections to the Node.js server so both frontend and backend can be developed with hot reload.

#### Scenario: Client connects during development
- **WHEN** the Vite dev server is running alongside the Node server
- **THEN** Socket.IO connections from the browser SHALL be proxied to the Node server's port via Vite's proxy configuration
