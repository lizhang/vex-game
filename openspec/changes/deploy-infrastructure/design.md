## Context

The VEX multiplayer game has a Node.js + Socket.IO backend and a React + Vite frontend. Currently both run on localhost. The game needs to be publicly accessible so two players on different machines can play together. The target is the cheapest AWS deployment possible, targeting ~$8/month using free-tier-eligible services.

## Goals / Non-Goals

**Goals:**
- Deploy the game to AWS so it's publicly accessible
- Minimize monthly cost (~$8/month target)
- Infrastructure as code with Terraform for reproducibility
- Simple manual deployment workflow (build → upload → restart)
- WebSocket support through CloudFront for Socket.IO

**Non-Goals:**
- CI/CD pipeline or automated deployments
- Custom domain or SSL certificate management (use CloudFront default domain)
- Auto-scaling or high availability
- Container orchestration (no ECS/EKS — run Node directly on EC2)
- Blue-green or zero-downtime deployments

## Decisions

### 1. No ALB or API Gateway — CloudFront direct to EC2

**Decision**: CloudFront routes directly to EC2's Elastic IP as a custom origin for WebSocket traffic. No load balancer or API gateway.

**Alternatives considered**:
- *ALB*: ~$16/month base cost just to sit in front of one EC2. Not worth it for a single instance.
- *API Gateway WebSocket API*: Cheaper per-request, but Socket.IO's HTTP-polling-then-upgrade handshake doesn't work with API Gateway's WebSocket model.

**Rationale**: CloudFront supports WebSocket natively when headers are forwarded correctly. For a single EC2 with casual traffic, this is the simplest and cheapest option.

### 2. CloudFront as unified entry point with dual origins

**Decision**: Single CloudFront distribution with two behaviors:
- Default (`*`) → S3 origin (static files via OAC)
- `/socket.io/*` → EC2 custom origin (HTTP, port 3001)

**Rationale**: Single domain for the browser, no CORS issues. CloudFront terminates HTTPS; EC2 origin uses HTTP only (no cert needed on EC2).

### 3. CloudFront WebSocket behavior configuration

**Decision**: The `/socket.io/*` behavior uses:
- Cache policy: `CachingDisabled` (managed policy)
- Origin request policy: `AllViewer` (forwards all headers including `Upgrade: websocket`)
- Allowed HTTP methods: ALL (GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE)
- Origin protocol: HTTP only to EC2

**Rationale**: WebSocket requires the `Upgrade` and `Connection` headers to be forwarded. The `AllViewer` managed policy handles this. Caching must be disabled for real-time traffic.

### 4. Terraform in infra/ directory

**Decision**: All Terraform files live in `infra/` at the project root. Single flat structure (no modules) with files split by concern:
- `main.tf` — provider, terraform config
- `variables.tf` — input variables
- `outputs.tf` — output values
- `ec2.tf` — EC2 instance, security group, Elastic IP, key pair
- `s3.tf` — S3 bucket, bucket policy, OAC
- `cloudfront.tf` — CloudFront distribution, behaviors, origins
- `dynamodb.tf` — GameResults table
- `iam.tf` — instance profile, role, DynamoDB policy

**Rationale**: Flat structure is easiest to navigate for a small project. File-per-resource-type keeps things organized without module overhead.

### 5. EC2 user data for initial setup

**Decision**: EC2 user data script installs Node.js, clones the repo (or receives code via scp), installs dependencies, and starts the server with pm2 for process management.

**Rationale**: Simplest bootstrap for a single instance. No container registry, no image builds. Future deploys are just ssh + git pull + pm2 restart.

### 6. S3 private bucket with CloudFront OAC

**Decision**: S3 bucket is private (no public access). CloudFront uses Origin Access Control (OAC) to read from S3.

**Alternatives considered**:
- *Public S3 bucket with static website hosting*: Works but less secure, objects are publicly accessible outside CloudFront.

**Rationale**: OAC is the modern best practice. Objects are only accessible through CloudFront, not directly from S3.

### 7. DynamoDB on-demand capacity

**Decision**: DynamoDB table uses on-demand (PAY_PER_REQUEST) billing mode instead of provisioned capacity.

**Rationale**: On-demand has no minimum cost and scales automatically. With casual usage (a few writes per game), this stays well within free tier and costs nothing extra.

## Risks / Trade-offs

- **Single point of failure**: One EC2 instance — if it goes down, the game is offline. → Acceptable for a casual game. EC2 auto-recovery can restart the instance on hardware failure.

- **CloudFront WebSocket idle timeout**: CloudFront has a 60-second idle timeout for WebSocket connections. If no data flows for 60 seconds, the connection drops. → Socket.IO has built-in ping/pong (25-second interval by default), which keeps the connection alive.

- **No zero-downtime deploys**: Restarting the server kills active games. → Acceptable. Deploy during quiet times. Games are 60 seconds, so the window is short.

- **SSH key management**: EC2 requires an SSH key pair for access. → Store the key pair locally, reference it in Terraform variables. Don't commit private keys.

- **Terraform state**: State file contains sensitive info (instance IDs, IPs). → Use local state for now (single developer). If team grows, move to S3 backend.
