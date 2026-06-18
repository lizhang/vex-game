## ADDED Requirements

### Requirement: Arrow key movement
The robot SHALL move in response to arrow key input. Up/Down/Left/Right arrows move the robot in the corresponding direction. Movement speed SHALL be defined in constants (default 200px/s). The robot SHALL face the direction of movement.

#### Scenario: Robot moves with arrow keys
- **WHEN** the player presses an arrow key during gameplay
- **THEN** the robot moves in that direction at the configured speed

#### Scenario: Robot faces movement direction
- **WHEN** the robot moves in a direction
- **THEN** the robot's facing indicator updates to show the current direction

### Requirement: Diagonal movement normalization
When two perpendicular arrow keys are pressed simultaneously, the robot SHALL move diagonally with the movement vector normalized so diagonal speed equals cardinal speed.

#### Scenario: Diagonal movement same speed as cardinal
- **WHEN** the player presses Up+Right simultaneously
- **THEN** the robot moves diagonally at the same total speed as moving in a single direction

### Requirement: Field boundary clamping
The robot SHALL NOT move outside the field bounds (0,0)-(800,600). Position SHALL be clamped to keep the robot (40x40px) fully within the field.

#### Scenario: Robot stops at field edge
- **WHEN** the robot reaches the edge of the 800x600 field
- **THEN** the robot's position is clamped to stay fully within bounds

### Requirement: Yellow bar collision blocking
The robot SHALL NOT cross yellow bar line segments. Top bar at x=300 from y=0 to y=350. Bottom bar at x=500 from y=250 to y=600. The robot MUST navigate around the bar endpoints to cross from one side to the other.

#### Scenario: Robot blocked by top bar
- **WHEN** the robot attempts to move through the yellow bar at x=300 between y=0 and y=350
- **THEN** the robot's x-position is clamped to not cross x=300 within that y-range

#### Scenario: Robot can pass around bar endpoint
- **WHEN** the robot moves below y=350 (past the top bar's endpoint)
- **THEN** the robot can freely cross x=300

### Requirement: Movement frozen during aim mode
The robot SHALL NOT move while in aim mode (after pressing Space to start aiming). Movement resumes when aim mode is cancelled (Escape) or after throwing.

#### Scenario: Robot frozen during aiming
- **WHEN** the player enters aim mode by pressing Space
- **THEN** arrow keys do not move the robot (they rotate the aim direction instead)

### Requirement: Browser scroll prevention
The game SHALL prevent default browser scrolling behavior for arrow keys, Space, and Enter during gameplay.

#### Scenario: No page scroll during gameplay
- **WHEN** the player presses arrow keys or Space during an active game
- **THEN** the browser page does not scroll
