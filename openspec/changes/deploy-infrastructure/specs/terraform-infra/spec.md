## ADDED Requirements

### Requirement: Terraform project structure
The project SHALL contain an `infra/` directory at the project root with Terraform configuration files split by resource type: `main.tf`, `variables.tf`, `outputs.tf`, `ec2.tf`, `s3.tf`, `cloudfront.tf`, `dynamodb.tf`, `iam.tf`.

#### Scenario: Terraform initializes successfully
- **WHEN** a user runs `terraform init` in the `infra/` directory
- **THEN** Terraform SHALL download the AWS provider and initialize the working directory without errors

### Requirement: EC2 instance with Elastic IP
Terraform SHALL provision a t3.micro EC2 instance with an Elastic IP for a stable public address. The instance SHALL use an Amazon Linux 2023 AMI.

#### Scenario: EC2 instance is created
- **WHEN** `terraform apply` is run
- **THEN** a t3.micro EC2 instance SHALL be created with the specified key pair and an Elastic IP attached

#### Scenario: EC2 instance has Node.js installed
- **WHEN** the EC2 instance boots for the first time
- **THEN** the user data script SHALL install Node.js (v20+) and pm2

### Requirement: Security group for game server
Terraform SHALL create a security group allowing inbound SSH (port 22), HTTP (port 80), and the Node.js server port (3001) from all sources.

#### Scenario: Security group rules are applied
- **WHEN** the EC2 instance is created
- **THEN** inbound traffic SHALL be allowed on ports 22, 80, and 3001, and all outbound traffic SHALL be allowed

### Requirement: IAM instance profile for DynamoDB
Terraform SHALL create an IAM role and instance profile granting the EC2 instance read/write access to the GameResults DynamoDB table.

#### Scenario: EC2 can write to DynamoDB
- **WHEN** the Node.js server running on EC2 calls DynamoDB PutItem on the GameResults table
- **THEN** the request SHALL succeed using the instance profile credentials without explicit access keys

### Requirement: DynamoDB GameResults table
Terraform SHALL create a DynamoDB table named `GameResults` with partition key `roomId` (Number) and sort key `playedAt` (String), using on-demand billing.

#### Scenario: Table is created with correct schema
- **WHEN** `terraform apply` is run
- **THEN** a DynamoDB table SHALL exist with the name `GameResults`, partition key `roomId` (N), sort key `playedAt` (S), and PAY_PER_REQUEST billing

### Requirement: Terraform variables
Terraform SHALL accept variables for: `aws_region` (default: us-east-1), `instance_type` (default: t3.micro), `key_pair_name` (required), and `project_name` (default: vex-game).

#### Scenario: Default values work without override
- **WHEN** `terraform apply` is run with only `key_pair_name` provided
- **THEN** all resources SHALL be created in us-east-1 using t3.micro and "vex-game" as the project prefix

### Requirement: Terraform outputs
Terraform SHALL output the CloudFront distribution domain name, EC2 Elastic IP, and S3 bucket name after apply.

#### Scenario: Outputs displayed after apply
- **WHEN** `terraform apply` completes
- **THEN** the output SHALL display `cloudfront_domain`, `ec2_public_ip`, and `s3_bucket_name`
