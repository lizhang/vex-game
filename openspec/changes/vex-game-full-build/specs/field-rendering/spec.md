## ADDED Requirements

### Requirement: Field dimensions and orientation
The field SHALL render as an 800x600px landscape container with `position: relative`. All game objects SHALL be absolutely positioned children within this container.

#### Scenario: Field renders at correct size
- **WHEN** the game screen loads
- **THEN** the field container is 800px wide and 600px tall

### Requirement: VEX IQ tile grid structure
The field SHALL use a tile grid with full tiles (100x100px) in the interior, half tiles (50px) on edges, and quarter tiles (50x50px) at corners. Grid intersection X coordinates: 0, 50, 150, 250, 350, 450, 550, 650, 750, 800. Grid intersection Y coordinates: 0, 50, 150, 250, 350, 450, 550, 600.

#### Scenario: Grid lines visible on field
- **WHEN** the field renders
- **THEN** grid lines are drawn at the specified intersection coordinates

### Requirement: Pyramid goals as nested corner-aligned squares
Two pyramid goals SHALL render as nested squares aligned to their respective field corners. Top-left pyramid (RED): L1=(0,0)->(150,150), L2=(0,0)->(100,100), L3=(0,0)->(50,50). Bottom-right pyramid (BLUE): L1=(650,450)->(800,600), L2=(700,500)->(800,600), L3=(750,550)->(800,600).

#### Scenario: Top-left pyramid renders in corner
- **WHEN** the field renders
- **THEN** three nested squares appear at the top-left corner with L3 innermost (50x50), L2 middle (100x100), L1 outer (150x150), all aligned to (0,0), colored red

#### Scenario: Bottom-right pyramid renders in corner
- **WHEN** the field renders
- **THEN** three nested squares appear at the bottom-right corner with L3 innermost (50x50) at (750,550), L2 middle (100x100) at (700,500), L1 outer (150x150) at (650,450), all aligned to (800,600), colored blue

### Requirement: L4 goals
Two L4 goals SHALL render as 50x50px squares. Top L4 centered at (300,350) with coordinates (275,325)->(325,375). Bottom L4 centered at (500,250) with coordinates (475,225)->(525,275). L4 goals SHALL be visually distinct (purple/special color) to indicate yellow-bags-only.

#### Scenario: L4 goals render at correct positions
- **WHEN** the field renders
- **THEN** two 50x50 L4 goal squares appear at centers (300,350) and (500,250)

### Requirement: Yellow bars as vertical barriers
Two thin vertical yellow lines SHALL render on the field. Top bar from (300,0) to (300,350). Bottom bar from (500,250) to (500,600). The bars SHALL be visually prominent (yellow color).

#### Scenario: Yellow bars render as vertical lines
- **WHEN** the field renders
- **THEN** two yellow vertical lines appear: one at x=300 from y=0 to y=350, one at x=500 from y=250 to y=600

### Requirement: Floor goals on field sides
Two floor goals SHALL render as rectangles on the field edges. Left floor goal (RED): (0,150)->(50,450), 50x300px. Right floor goal (BLUE): (750,150)->(800,450), 50x300px.

#### Scenario: Floor goals render on sides
- **WHEN** the field renders
- **THEN** a red 50x300 rectangle appears on the left side at (0,150) and a blue 50x300 rectangle appears on the right side at (750,150)

### Requirement: Loading zones
Two loading zones SHALL render at the remaining corners. Bottom-left: (0,450)->(50,600), 50x150px. Top-right: (750,0)->(800,150), 50x150px. These are visual only with no game mechanic.

#### Scenario: Loading zones render at corners
- **WHEN** the field renders
- **THEN** loading zone indicators appear at bottom-left and top-right corners

### Requirement: Pre-placed bean bags
20 bean bags SHALL render at their initial positions. Each bag is a small colored element (blue, red, or yellow). Blue bags at: (100,200), (100,300), (100,400), (150,550), (250,50), (250,300), (250,550), (400,250). Red bags at: (700,400), (700,300), (700,200), (650,50), (550,550), (550,300), (550,50), (400,350). Yellow bags at: (350,250), (450,250), (350,350), (450,350).

#### Scenario: All 20 bags render at starting positions
- **WHEN** the game starts
- **THEN** 8 blue bags, 8 red bags, and 4 yellow bags appear at their specified positions
