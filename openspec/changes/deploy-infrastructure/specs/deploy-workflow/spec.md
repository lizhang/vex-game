## ADDED Requirements

### Requirement: Static files deploy script
The project SHALL include an npm script to build the frontend and upload the dist/ output to the S3 bucket.

#### Scenario: Deploy static files to S3
- **WHEN** a user runs the deploy script
- **THEN** the Vite build SHALL run, and the contents of `dist/` SHALL be synced to the S3 bucket with appropriate content types

### Requirement: Server deployment via SSH
The project SHALL document a workflow for deploying the Node.js server to EC2 via SSH: clone/pull the repo, install server dependencies, and start/restart with pm2.

#### Scenario: First deploy to EC2
- **WHEN** a user SSHs into the EC2 instance for the first time after provisioning
- **THEN** they SHALL be able to clone the repo, run `cd server && npm install`, and start the server with `pm2 start index.js --name vex-server`

#### Scenario: Subsequent deploys to EC2
- **WHEN** a user SSHs into EC2 to deploy an update
- **THEN** they SHALL run `git pull`, `cd server && npm install`, and `pm2 restart vex-server`

### Requirement: Server listens on 0.0.0.0
The Node.js server SHALL listen on `0.0.0.0` (all interfaces) in production so it accepts connections from CloudFront via the public IP.

#### Scenario: Server accepts external connections
- **WHEN** the Node.js server starts on EC2
- **THEN** it SHALL bind to `0.0.0.0:3001` and accept connections from any source IP

### Requirement: Server reads AWS region from environment
The Node.js server SHALL read `AWS_REGION` from the environment to configure the DynamoDB client. On EC2 with an instance profile, no explicit access keys are needed.

#### Scenario: DynamoDB works with instance profile
- **WHEN** the server starts on EC2 with `AWS_REGION` set and an instance profile attached
- **THEN** the DynamoDB client SHALL authenticate using the instance profile and successfully write game results
