## 1. Terraform Project Setup

- [x] 1.1 Create `infra/` directory with `main.tf` (AWS provider, terraform required version) and `variables.tf` (aws_region, instance_type, key_pair_name, project_name with defaults)
- [x] 1.2 Create `outputs.tf` with cloudfront_domain, ec2_public_ip, and s3_bucket_name outputs
- [x] 1.3 Add `infra/.terraform/` and `infra/*.tfstate*` to `.gitignore`
- [ ] 1.4 Commit: "Add Terraform project scaffolding"

## 2. EC2 and Networking

- [ ] 2.1 Create `infra/ec2.tf` — security group with inbound rules for SSH (22), HTTP (80), Node server (3001), and all outbound
- [ ] 2.2 Add EC2 instance resource (t3.micro, Amazon Linux 2023 AMI, key pair variable, security group, instance profile)
- [ ] 2.3 Add user data script to install Node.js 20, pm2, and git on first boot
- [ ] 2.4 Add Elastic IP resource and associate with the EC2 instance
- [ ] 2.5 Commit: "Add Terraform EC2, security group, and Elastic IP"

## 3. DynamoDB and IAM

- [ ] 3.1 Create `infra/dynamodb.tf` — GameResults table with roomId (N) partition key, playedAt (S) sort key, PAY_PER_REQUEST billing
- [ ] 3.2 Create `infra/iam.tf` — IAM role with ec2 assume role policy, DynamoDB read/write policy for the GameResults table, instance profile
- [ ] 3.3 Commit: "Add Terraform DynamoDB table and IAM instance profile"

## 4. S3 Static Hosting

- [ ] 4.1 Create `infra/s3.tf` — private S3 bucket with block_public_access, CloudFront OAC resource, and bucket policy granting CloudFront read access
- [ ] 4.2 Commit: "Add Terraform S3 bucket with CloudFront OAC"

## 5. CloudFront Distribution

- [ ] 5.1 Create `infra/cloudfront.tf` — CloudFront distribution with S3 origin (OAC) as default behavior, index.html as default root object
- [ ] 5.2 Add EC2 custom origin (Elastic IP, port 3001, HTTP-only protocol)
- [ ] 5.3 Add ordered cache behavior for `/socket.io/*` — CachingDisabled policy, AllViewer origin request policy, all HTTP methods allowed
- [ ] 5.4 Commit: "Add Terraform CloudFront distribution with dual origins"

## 6. App Changes for Production

- [ ] 6.1 Update `server/index.js` to listen on `0.0.0.0` and read port from `PORT` env var
- [ ] 6.2 Add `deploy:static` npm script to build and sync dist/ to S3 (`npm run build && aws s3 sync dist/ s3://<bucket> --delete`)
- [ ] 6.3 Add `DEPLOY.md` documenting the full deployment workflow (terraform apply, deploy static, deploy server via SSH)
- [ ] 6.4 Commit: "Add production server config and deploy scripts"

## 7. Validate and Test

- [ ] 7.1 Run `terraform init` and `terraform validate` to verify all configuration is syntactically correct
- [ ] 7.2 Run `terraform plan` to preview resources that would be created
- [ ] 7.3 Commit: "Finalize deploy-infrastructure setup"
