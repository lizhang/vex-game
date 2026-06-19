## ADDED Requirements

### Requirement: Private S3 bucket for static files
Terraform SHALL create a private S3 bucket (no public access) to host the Vite build output. The bucket SHALL block all public access.

#### Scenario: Bucket is created with public access blocked
- **WHEN** `terraform apply` is run
- **THEN** an S3 bucket SHALL exist with `block_public_acls`, `block_public_policy`, `ignore_public_acls`, and `restrict_public_buckets` all set to true

### Requirement: CloudFront Origin Access Control for S3
Terraform SHALL create a CloudFront Origin Access Control (OAC) and an S3 bucket policy that grants CloudFront read access to the bucket contents.

#### Scenario: CloudFront can read S3 objects
- **WHEN** a browser requests a static file through the CloudFront domain
- **THEN** CloudFront SHALL retrieve the file from S3 using OAC and serve it to the browser

#### Scenario: Direct S3 access is denied
- **WHEN** a user attempts to access an S3 object URL directly (without CloudFront)
- **THEN** the request SHALL be denied with a 403 Forbidden response

### Requirement: CloudFront default behavior serves static files
The CloudFront distribution's default behavior (`*`) SHALL route to the S3 origin, serving the Vite build output with caching enabled.

#### Scenario: Index page is served
- **WHEN** a browser navigates to the CloudFront domain root
- **THEN** CloudFront SHALL serve `index.html` from the S3 bucket

#### Scenario: Static assets are cached
- **WHEN** a browser requests a JS or CSS file from `/assets/*`
- **THEN** CloudFront SHALL serve it from cache (if cached) or fetch from S3 and cache it
