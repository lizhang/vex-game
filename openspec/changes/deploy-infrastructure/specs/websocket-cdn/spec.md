## ADDED Requirements

### Requirement: CloudFront /socket.io/* behavior routes to EC2
The CloudFront distribution SHALL have an ordered cache behavior for `/socket.io/*` that routes to the EC2 custom origin on port 3001 using HTTP.

#### Scenario: Socket.IO polling request reaches EC2
- **WHEN** a browser sends an HTTP request to `<cloudfront-domain>/socket.io/?EIO=4&transport=polling`
- **THEN** CloudFront SHALL forward the request to the EC2 origin on port 3001 and return the Socket.IO handshake response

### Requirement: WebSocket upgrade forwarded through CloudFront
The `/socket.io/*` behavior SHALL use the `AllViewer` origin request policy to forward all headers (including `Upgrade: websocket` and `Connection`) to the EC2 origin.

#### Scenario: WebSocket connection established
- **WHEN** a browser sends a WebSocket upgrade request through CloudFront
- **THEN** CloudFront SHALL forward the `Upgrade` and `Connection` headers to EC2, and the WebSocket connection SHALL be established

### Requirement: Caching disabled for WebSocket behavior
The `/socket.io/*` behavior SHALL use the `CachingDisabled` managed cache policy to ensure real-time traffic is never cached.

#### Scenario: Real-time messages are not cached
- **WHEN** multiple Socket.IO messages are exchanged between browser and server
- **THEN** each message SHALL pass through CloudFront without caching, and CloudFront SHALL NOT serve stale responses

### Requirement: All HTTP methods allowed for WebSocket behavior
The `/socket.io/*` behavior SHALL allow all HTTP methods (GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE) to support Socket.IO's polling transport.

#### Scenario: POST request for Socket.IO polling
- **WHEN** a browser sends a POST request to `/socket.io/` for the polling transport
- **THEN** CloudFront SHALL forward the POST to the EC2 origin and return the response

### Requirement: EC2 custom origin configuration
The CloudFront distribution SHALL configure the EC2 Elastic IP as a custom origin with HTTP-only protocol policy on port 3001.

#### Scenario: CloudFront connects to EC2 via HTTP
- **WHEN** CloudFront forwards a request to the EC2 origin
- **THEN** it SHALL connect to the EC2 Elastic IP on port 3001 using HTTP (not HTTPS)
