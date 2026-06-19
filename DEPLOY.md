# Deployment Guide

## Prerequisites

- AWS CLI configured with credentials (`aws configure`)
- Terraform CLI installed (v1.0+)
- An EC2 key pair created in AWS (note the name)

## 1. Provision Infrastructure

```bash
cd infra
terraform init
terraform plan -var="key_pair_name=YOUR_KEY_NAME"
terraform apply -var="key_pair_name=YOUR_KEY_NAME"
```

Note the outputs:
- `cloudfront_domain` — your game URL
- `ec2_public_ip` — for SSH access
- `s3_bucket_name` — for static file uploads

## 2. Deploy Static Files

From the project root:

```bash
npm run deploy:static
```

This builds the frontend and syncs `dist/` to the S3 bucket.

## 3. Deploy Server (First Time)

```bash
ssh -i ~/.ssh/YOUR_KEY.pem ec2-user@<ec2_public_ip>

# On the EC2 instance:
git clone <your-repo-url> ~/vex-game
cd ~/vex-game/server
npm install
AWS_REGION=us-east-1 pm2 start index.js --name vex-server
pm2 save
pm2 startup  # follow instructions to enable on boot
```

## 4. Deploy Server (Updates)

```bash
ssh -i ~/.ssh/YOUR_KEY.pem ec2-user@<ec2_public_ip>

cd ~/vex-game
git pull
cd server
npm install
pm2 restart vex-server
```

## 5. Access the Game

Open `https://<cloudfront_domain>` in your browser.

## Tear Down

```bash
cd infra
terraform destroy -var="key_pair_name=YOUR_KEY_NAME"
```
