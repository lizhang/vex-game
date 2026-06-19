## Why

The multiplayer VEX game currently runs only on localhost (Vite dev server + Node server). To allow two players on different machines to play together, the game needs to be deployed to a publicly accessible environment. AWS provides the cheapest path at ~$8/month using free-tier-eligible services.

## What Changes

- Add Terraform configuration in `infra/` directory to provision all AWS resources
- S3 bucket to host the static Vite build output (dist/)
- CloudFront distribution as CDN with two origins: S3 for static files, EC2 for WebSocket
- EC2 t3.micro instance running the Node.js + Socket.IO game server
- Elastic IP for stable EC2 address used as CloudFront custom origin
- DynamoDB GameResults table for persisting game scores
- IAM instance profile granting EC2 access to DynamoDB
- Security group allowing SSH (22), HTTP (80), and Node server port (3001)
- CloudFront `/socket.io/*` behavior with CachingDisabled and AllViewer header forwarding for WebSocket passthrough
- npm deploy script to build and upload static files to S3

## Capabilities

### New Capabilities
- `terraform-infra`: Terraform configuration for all AWS resources (S3, CloudFront, EC2, DynamoDB, IAM, security group, Elastic IP)
- `static-hosting`: S3 bucket with CloudFront OAC for serving the Vite build output
- `websocket-cdn`: CloudFront behavior routing /socket.io/* to EC2 custom origin with WebSocket support
- `deploy-workflow`: Scripts and documentation for deploying the application (build, upload to S3, deploy server to EC2)

### Modified Capabilities

## Impact

- **New directory**: `infra/` containing all Terraform files
- **New dependency**: Terraform CLI required locally for infrastructure management
- **AWS account**: Required with appropriate credentials configured
- **package.json**: New deploy scripts for S3 upload
- **server/index.js**: May need minor adjustments for production (listen on 0.0.0.0, environment variables for AWS region)
- **vite.config.js**: No proxy needed in production — CloudFront handles routing
