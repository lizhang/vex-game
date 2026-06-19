## ADDED Requirements

### Requirement: DynamoDB GameResults table
The system SHALL use a DynamoDB table named `GameResults` with partition key `roomId` (Number) and sort key `playedAt` (String, ISO-8601 timestamp).

#### Scenario: Table schema supports required queries
- **WHEN** the table is created
- **THEN** it SHALL have partition key `roomId` (Number) and sort key `playedAt` (String), supporting queries by room and chronological ordering

### Requirement: Write game result on completion
The server SHALL write one item to the GameResults table when a game ends, regardless of whether it ended by timer expiration or player abandonment.

#### Scenario: Game completes normally (timer expires)
- **WHEN** the 60-second timer reaches 0
- **THEN** the server SHALL write a GameResults item with: `roomId`, `playedAt` (ISO-8601), `players` (list of display names), `teams` (map of name→team), `score` (final score), `breakdown` (floor/l1/l2/l3/l4 points and counts), `endReason: "completed"`, `duration: 60`

#### Scenario: Game abandoned (player leaves)
- **WHEN** a player disconnects during an active game
- **THEN** the server SHALL write a GameResults item with `endReason: "abandoned"` and `duration` set to the number of seconds elapsed before abandonment

### Requirement: Game result write is fire-and-forget
The DynamoDB write SHALL be fire-and-forget. If the write fails, the game still ends normally for the players. The failure SHALL be logged to server console but SHALL NOT affect the game over flow.

#### Scenario: DynamoDB write fails
- **WHEN** the DynamoDB put operation fails (network error, credentials, table not found)
- **THEN** the server SHALL log the error, and both clients SHALL still see the game over screen with correct score and breakdown

### Requirement: DynamoDB configuration via environment variables
The DynamoDB client SHALL read AWS configuration from environment variables (`AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`). The table name SHALL default to `GameResults` and be overridable via `DYNAMODB_TABLE_NAME` environment variable.

#### Scenario: Server starts with DynamoDB configured
- **WHEN** the server starts with valid AWS environment variables
- **THEN** the DynamoDB client SHALL initialize and be ready to write results

#### Scenario: Server starts without DynamoDB configured
- **WHEN** the server starts without AWS environment variables
- **THEN** the server SHALL log a warning that game results will not be persisted, and games SHALL still function normally without persistence
