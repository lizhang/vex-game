## ADDED Requirements

### Requirement: Proximity-based pickup
The robot SHALL pick up a bean bag when the player presses Enter and the robot is within pickup range (configurable, default 30px) of a bag's position. Only bags on the field (not scored, not carried, not in-flight) are eligible.

#### Scenario: Pick up nearby bag
- **WHEN** the robot is within 30px of a bean bag and the player presses Enter
- **THEN** the bag is removed from the field and attached to the robot

#### Scenario: No pickup when too far
- **WHEN** the robot is more than 30px from all bean bags and the player presses Enter
- **THEN** nothing happens

### Requirement: Carry one bag at a time
The robot SHALL carry at most one bean bag. If the robot is already carrying a bag, pressing Enter near another bag SHALL NOT pick it up.

#### Scenario: Cannot pick up second bag
- **WHEN** the robot is already carrying a bag and presses Enter near another bag
- **THEN** the second bag is not picked up

### Requirement: Carried bag visual
When carrying a bag, the robot SHALL display the bag's color visually on the robot sprite. The carried bag SHALL disappear from its field position.

#### Scenario: Bag shown on robot
- **WHEN** the robot picks up a blue bag
- **THEN** the bag disappears from the field and a blue indicator appears on the robot

### Requirement: HUD carry indicator
The HUD SHALL display the color of the currently carried bag, or an empty indicator when no bag is carried.

#### Scenario: HUD shows carried bag color
- **WHEN** the robot is carrying a red bag
- **THEN** the HUD carry indicator shows red

#### Scenario: HUD shows empty when no bag
- **WHEN** the robot is not carrying any bag
- **THEN** the HUD carry indicator shows empty/none

### Requirement: Single-press pickup detection
The Enter key SHALL use just-pressed detection to prevent repeated pickups from holding the key down. Only the initial press triggers a pickup attempt.

#### Scenario: Holding Enter does not repeat pickup
- **WHEN** the player holds down Enter near multiple bags
- **THEN** only one bag is picked up (the first press)

### Requirement: Re-pickup of missed or wrong-color bags
Bags that missed all goals or scored 0 points (wrong color) SHALL be eligible for re-pickup. Bags that successfully scored SHALL NOT be eligible.

#### Scenario: Pick up a missed bag
- **WHEN** a thrown bag lands on the field without scoring and the robot moves near it and presses Enter
- **THEN** the bag is picked up

#### Scenario: Cannot pick up scored bag
- **WHEN** a bag has successfully scored in a goal
- **THEN** the bag is not eligible for pickup regardless of proximity
