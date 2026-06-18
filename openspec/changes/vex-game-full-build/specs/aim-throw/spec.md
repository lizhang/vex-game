## ADDED Requirements

### Requirement: Three-phase aim sequence
Throwing SHALL follow a 3-press Space sequence: (1) Enter aim mode — direction arrow appears at robot's facing angle, (2) Lock direction — power bar starts oscillating, (3) Launch — bag fires at locked angle with captured power. The robot MUST be carrying a bag to enter aim mode.

#### Scenario: Full aim and throw sequence
- **WHEN** the robot is carrying a bag and the player presses Space three times
- **THEN** the bag launches at the locked direction with the captured power level

#### Scenario: Cannot aim without a bag
- **WHEN** the robot is not carrying a bag and the player presses Space
- **THEN** nothing happens

### Requirement: Aim direction control
In aim mode (phase 1), LEFT/RIGHT arrow keys SHALL rotate the aim direction arrow. The arrow starts at the robot's current facing direction.

#### Scenario: Rotate aim direction
- **WHEN** the player is in aim mode and presses LEFT arrow
- **THEN** the aim direction arrow rotates counter-clockwise

### Requirement: Power bar oscillation
In power phase (phase 2), a power bar SHALL oscillate from 0% to 100% and back, completing one cycle in ~1.25 seconds. The second Space press captures the current power level.

#### Scenario: Power bar oscillates
- **WHEN** the player locks the aim direction (second Space press)
- **THEN** a power bar begins oscillating between 0% and 100%

#### Scenario: Power captured on third press
- **WHEN** the player presses Space while the power bar is at 75%
- **THEN** the bag launches at 75% of maximum throw speed

### Requirement: Escape cancels aim mode
Pressing Escape at any point during aim mode SHALL cancel the aim sequence and return to normal movement. The carried bag is retained.

#### Scenario: Cancel aim mode
- **WHEN** the player presses Escape during aim mode
- **THEN** aim mode exits, the robot can move again, and the bag remains carried

### Requirement: Projectile physics
A thrown bag SHALL launch at the locked angle with speed proportional to captured power (min 100px/s at 0%, max 500px/s at 100%). The bag decelerates via linear friction (300px/s^2). The bag stops when speed reaches 0.

#### Scenario: Max power throw distance
- **WHEN** a bag is thrown at 100% power on open field
- **THEN** the bag travels approximately 415px before stopping

### Requirement: Wall bounce
A thrown bag SHALL bounce off field walls (0,0)-(800,600) with 50% energy loss on each bounce.

#### Scenario: Bag bounces off wall
- **WHEN** a thrown bag hits a field wall
- **THEN** the bag reflects its velocity component perpendicular to the wall, reduced by 50%

### Requirement: Bags fly over yellow bars
Thrown bags SHALL NOT collide with yellow bars. Bags pass through/over the bars freely. Only the robot is blocked by bars.

#### Scenario: Bag crosses yellow bar
- **WHEN** a thrown bag's trajectory crosses a yellow bar line
- **THEN** the bag continues through unaffected

### Requirement: Delta time capping
The physics delta time SHALL be capped at 0.1 seconds per frame to prevent projectile teleportation when the browser tab loses focus and regains it.

#### Scenario: Tab switch does not break physics
- **WHEN** the player switches away from the tab for 5 seconds and returns
- **THEN** the physics step uses at most 0.1s delta, preventing bags from teleporting
