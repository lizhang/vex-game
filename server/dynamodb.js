let docClient = null;
let tableName = process.env.DYNAMODB_TABLE_NAME || 'GameResults';
let enabled = false;

async function init() {
  if (!process.env.AWS_REGION) {
    console.warn('DynamoDB not configured (AWS_REGION not set). Game results will not be persisted.');
    return;
  }

  try {
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient } = await import('@aws-sdk/lib-dynamodb');

    const client = new DynamoDBClient({ region: process.env.AWS_REGION });
    docClient = DynamoDBDocumentClient.from(client);
    enabled = true;
    console.log(`DynamoDB enabled. Table: ${tableName}`);
  } catch (err) {
    console.warn('Failed to initialize DynamoDB:', err.message);
  }
}

init();

export async function saveGameResult({ roomId, players, teams, score, breakdown, endReason, duration }) {
  if (!enabled || !docClient) return;

  try {
    const { PutCommand } = await import('@aws-sdk/lib-dynamodb');

    await docClient.send(new PutCommand({
      TableName: tableName,
      Item: {
        roomId,
        playedAt: new Date().toISOString(),
        players,
        teams,
        score,
        breakdown,
        endReason,
        duration,
      },
    }));
  } catch (err) {
    console.error('Failed to save game result:', err.message);
  }
}
