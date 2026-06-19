resource "aws_dynamodb_table" "game_results" {
  name         = "GameResults"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "roomId"
  range_key    = "playedAt"

  attribute {
    name = "roomId"
    type = "N"
  }

  attribute {
    name = "playedAt"
    type = "S"
  }

  tags = {
    Name = "${var.project_name}-game-results"
  }
}
