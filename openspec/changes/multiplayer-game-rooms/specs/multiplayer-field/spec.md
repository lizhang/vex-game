## ADDED Requirements

### Requirement: Two robots on the shared field
The game field SHALL display two robots, one per player. Each robot SHALL be colored according to its team (red or blue).

#### Scenario: Game starts with two robots
- **WHEN** the game begins after countdown
- **THEN** the red robot SHALL appear at the red loading zone (approximately x=25, y=550) and the blue robot SHALL appear at the blue loading zone (approximately x=775, y=75)

### Requirement: Local robot rendering
The local player's robot SHALL be rendered in full team color with the direction indicator, carried bag indicator, and aim indicator (when aiming).

#### Scenario: Local player sees their robot
- **WHEN** the game is active
- **THEN** the local player's robot SHALL render in full team color (red=#e74c3c or blue=#3498db) with full opacity

### Requirement: Remote robot rendering with grey overlay
The remote player's robot SHALL be rendered with its team color plus a semi-transparent grey overlay to visually distinguish it from the local player's robot.

#### Scenario: Player sees remote robot
- **WHEN** the game is active
- **THEN** the remote player's robot SHALL render in its team color with a grey overlay (dimmed appearance), showing direction and carried bag but no aim indicator

### Requirement: Local robot movement is client-local
The local player's robot movement SHALL be processed locally for instant feedback. Position updates SHALL be sent to the server at a throttled rate (every 50ms / 20Hz).

#### Scenario: Player moves their robot
- **WHEN** a player presses arrow keys
- **THEN** the local robot SHALL move immediately on screen without waiting for server response, and position updates SHALL be sent to the server at most every 50ms

### Requirement: Remote robot position from server
The remote player's robot position SHALL be updated based on position broadcasts from the server (relayed from the other client's position updates).

#### Scenario: Remote robot moves on screen
- **WHEN** the server broadcasts the other player's position update
- **THEN** the remote robot SHALL update to the new position on the local client's screen

### Requirement: Aim and power selection is client-local
The aim angle and power selection phases SHALL run entirely on the client. The aim indicator SHALL only be visible on the local player's screen. The server is not notified until the throw is released.

#### Scenario: Player enters aim mode
- **WHEN** a player presses Space while carrying a bag
- **THEN** the aim indicator SHALL appear on the local screen only, with no server communication

#### Scenario: Player adjusts aim and power
- **WHEN** a player uses arrow keys to adjust aim and Space to enter power mode
- **THEN** all aim/power state changes SHALL happen locally with no server round-trips

### Requirement: Pickup waits for server confirmation
When a player presses Enter to pick up a bag, the client SHALL send a `player:pickup` request and wait for server confirmation before showing the bag as carried.

#### Scenario: Pickup confirmed by server
- **WHEN** the player presses Enter near an available bag and the server responds with `pickup:confirm`
- **THEN** the bag SHALL be shown as carried by the local robot

#### Scenario: Pickup denied by server
- **WHEN** the player presses Enter near a bag but the server responds with `pickup:denied`
- **THEN** the bag SHALL remain in its current state and the robot SHALL not carry anything

### Requirement: Cooperative shared score
Both players contribute to a single shared score. The score and breakdown SHALL be identical on both clients, as determined by the server.

#### Scenario: Either player scores
- **WHEN** a bag thrown by either player lands in a goal
- **THEN** the server SHALL update the shared score and broadcast it to both clients, and both clients SHALL display the same score and breakdown

### Requirement: Bump stun mechanic
When the server detects a robot-robot collision, both robots SHALL be pushed back one robot length (ROBOT_SIZE = 40px) and stunned for 1 second. During stun, the player's input SHALL be ignored.

#### Scenario: Two robots collide
- **WHEN** two robots move within ROBOT_SIZE distance of each other
- **THEN** the server SHALL emit a `bump` event, both clients SHALL move their robots to the corrected positions, and both robots SHALL be stunned for 1 second

#### Scenario: Stunned robot ignores input
- **WHEN** a player's robot is stunned
- **THEN** arrow key movement, Enter (pickup), and Space (aim/throw) inputs SHALL be ignored until the stun expires

### Requirement: Dizzy stun visual effect
When a robot is stunned from a bump, it SHALL display a dizzy visual effect using CSS animations.

#### Scenario: Robot shows dizzy effect
- **WHEN** a robot enters the stunned state
- **THEN** the robot SHALL display a shake/wobble animation and rotating star indicators above the robot for the duration of the 1-second stun

#### Scenario: Dizzy effect clears after stun
- **WHEN** the 1-second stun duration expires
- **THEN** the dizzy visual effect SHALL stop and the robot SHALL return to normal appearance

### Requirement: Both robots can independently carry and throw
Each robot SHALL be able to carry one bag and throw independently. One robot carrying a bag SHALL not prevent the other from carrying a different bag.

#### Scenario: Both robots carry bags simultaneously
- **WHEN** Player A picks up bag b1 and Player B picks up bag r1
- **THEN** both robots SHALL show their respective carried bags and both can aim and throw independently

### Requirement: Score popups appear for both players
When a bag scores, a score popup (+N points) SHALL appear at the bag's landing position on both clients.

#### Scenario: Remote player's throw scores
- **WHEN** the other player throws a bag that scores
- **THEN** the local client SHALL display a score popup at the bag's landing position with the point value
