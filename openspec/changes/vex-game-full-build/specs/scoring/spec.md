## ADDED Requirements

### Requirement: Score detection on bag stop
Scoring SHALL be checked when a thrown bag's speed reaches 0 (bag stops moving). The bag's final position determines which goal zone it landed in.

#### Scenario: Bag scored when it stops
- **WHEN** a thrown bag decelerates to 0 speed inside a goal zone
- **THEN** the scoring system evaluates the bag's position and awards points

### Requirement: Pyramid tier scoring with innermost-first check
Pyramid scoring SHALL check tiers from innermost to outermost: L3 (12pts) first, then L2 (6pts), then L1 (3pts). The bag's center position determines the tier. If the bag center is within L3 bounds, it scores 12 points regardless of also being within L2/L1.

#### Scenario: Bag in L3 scores 12 points
- **WHEN** a bag stops with its center inside the L3 zone (0,0)-(50,50) of the top-left pyramid
- **THEN** the bag scores 12 points

#### Scenario: Bag in L2 but not L3 scores 6 points
- **WHEN** a bag stops with its center inside L2 (0,0)-(100,100) but outside L3 (0,0)-(50,50)
- **THEN** the bag scores 6 points

### Requirement: Boundary means lower tier
When a bag's center position falls exactly on the boundary between two tiers, it SHALL score as the lower (less valuable) tier.

#### Scenario: Bag on L2/L1 boundary
- **WHEN** a bag stops with its center exactly on the edge between L2 and L1 of a pyramid
- **THEN** the bag scores 3 points (L1 value)

### Requirement: Color matching for pyramid goals
A bag in a pyramid goal SHALL only score if its color matches the pyramid's color OR the bag is yellow. Top-left pyramid is RED (accepts red and yellow bags). Bottom-right pyramid is BLUE (accepts blue and yellow bags). A wrong-color bag scores 0 points.

#### Scenario: Matching color bag scores
- **WHEN** a red bag stops inside the top-left (RED) pyramid L1 zone
- **THEN** the bag scores 3 points

#### Scenario: Yellow bag scores in any pyramid
- **WHEN** a yellow bag stops inside the bottom-right (BLUE) pyramid L2 zone
- **THEN** the bag scores 6 points

#### Scenario: Wrong color scores zero
- **WHEN** a blue bag stops inside the top-left (RED) pyramid L1 zone
- **THEN** the bag scores 0 points

### Requirement: L4 scoring yellow only
L4 goals SHALL only accept yellow bags, scoring 16 points. Any non-yellow bag in an L4 goal scores 0 points.

#### Scenario: Yellow bag in L4 scores 16
- **WHEN** a yellow bag stops inside an L4 goal zone
- **THEN** the bag scores 16 points

#### Scenario: Non-yellow bag in L4 scores zero
- **WHEN** a blue bag stops inside an L4 goal zone
- **THEN** the bag scores 0 points

### Requirement: Floor goal scoring with fully-inside rule
A bag in a floor goal SHALL only score 1 point if the entire bag (center and radius) is fully inside the floor goal rectangle AND the bag's color matches the goal color or is yellow. Left floor goal is RED. Right floor goal is BLUE.

#### Scenario: Bag fully inside matching floor goal
- **WHEN** a red bag stops with its entire area inside the left (RED) floor goal
- **THEN** the bag scores 1 point

#### Scenario: Bag partially outside floor goal
- **WHEN** a bag stops with its center inside a floor goal but part of it extends outside
- **THEN** the bag scores 0 points

### Requirement: Wrong-color bag stays and is re-pickable
A bag that scores 0 points (wrong color or miss) SHALL remain at its stopped position on the field and be eligible for pickup again. A bag that successfully scores (1+ points) SHALL remain in the goal with a visual distinction and NOT be eligible for pickup.

#### Scenario: Wrong-color bag can be retrieved
- **WHEN** a blue bag scores 0 in a RED pyramid goal
- **THEN** the bag stays at its position and can be picked up again

#### Scenario: Scored bag cannot be retrieved
- **WHEN** a red bag scores 3 points in the RED pyramid L1
- **THEN** the bag remains in the goal with a scored visual state and cannot be picked up

### Requirement: HUD score display
The HUD SHALL display the current total score and a breakdown by goal type (floor, L1, L2, L3, L4).

#### Scenario: Score updates on successful score
- **WHEN** a bag scores 6 points in L2
- **THEN** the HUD total score increases by 6 and the L2 count increments
