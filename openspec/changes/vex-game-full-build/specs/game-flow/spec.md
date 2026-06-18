## ADDED Requirements

### Requirement: Screen state machine
The game SHALL have three screens: Start, Playing, and Game Over. Transitions: Start->(Enter)->Playing->(timer expires)->Game Over->(Enter)->Start.

#### Scenario: Game starts on start screen
- **WHEN** the page loads
- **THEN** the start screen is displayed with title and "Press Enter to Start"

#### Scenario: Enter starts the game
- **WHEN** the player presses Enter on the start screen
- **THEN** the game transitions to the playing screen with field, robot, bags, and timer

#### Scenario: Game over when timer expires
- **WHEN** the 60-second timer reaches 0
- **THEN** the game transitions to the game over screen

#### Scenario: Replay from game over
- **WHEN** the player presses Enter on the game over screen
- **THEN** the game resets and returns to the start screen

### Requirement: 60-second countdown timer
The match SHALL last exactly 60 seconds, counting down from 60 to 0. The timer SHALL be displayed in the HUD. The timer SHALL use delta time from the game loop for accuracy.

#### Scenario: Timer counts down
- **WHEN** the game is playing
- **THEN** the timer decreases from 60 toward 0 in real-time

#### Scenario: Timer reaches zero
- **WHEN** the timer reaches 0
- **THEN** gameplay stops and the game over screen appears

### Requirement: Timer warning under 10 seconds
The timer display SHALL show a visual warning (color change or animation) when the remaining time drops below 10 seconds.

#### Scenario: Timer warning appears
- **WHEN** the timer drops below 10 seconds
- **THEN** the timer display changes to a warning style (e.g., red color, pulsing)

### Requirement: Game over screen with score breakdown
The game over screen SHALL display the final total score and a breakdown showing points earned from each goal type (Floor, L1, L2, L3, L4) and the number of bags scored in each.

#### Scenario: Score breakdown shown
- **WHEN** the game ends with 3 bags scored (1 in L1 for 3pts, 1 in L2 for 6pts, 1 in Floor for 1pt)
- **THEN** the game over screen shows total: 10, with breakdown: Floor: 1pt (1 bag), L1: 3pts (1 bag), L2: 6pts (1 bag)

### Requirement: Score flash animation
The game SHALL show a brief score animation (floating number) when points are earned during gameplay.

#### Scenario: Score popup on point gain
- **WHEN** a bag scores 12 points in L3
- **THEN** a "+12" animation floats up from the bag's position

### Requirement: Game state reset on replay
When the player chooses to replay, all game state SHALL reset: timer back to 60, score to 0, all bags to their original positions, robot to start position (25,550).

#### Scenario: Full reset on replay
- **WHEN** the player presses Enter on the game over screen
- **THEN** timer resets to 60, score resets to 0, bags return to initial positions, robot returns to (25,550)
