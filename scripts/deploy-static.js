#!/usr/bin/env node
// Cross-platform static deploy: build the frontend, read the S3 bucket name
// from Terraform, sync dist/ to it, and invalidate CloudFront so the new
// files are served immediately. Replaces a bash-only `$(...)` npm script that
// broke on Windows cmd.exe.
import { execFileSync } from 'node:child_process';

const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { stdio: 'inherit', shell: false, ...opts });

const capture = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { encoding: 'utf8', shell: false, ...opts }).trim();

// 1. Read outputs from Terraform state.
const bucket = capture('terraform', ['-chdir=infra', 'output', '-raw', 's3_bucket_name']);
const distributionId = capture('terraform', ['-chdir=infra', 'output', '-raw', 'cloudfront_distribution_id']);

// 2. Build the production bundle.
run('npm', ['run', 'build'], { shell: process.platform === 'win32' });

// 3. Upload to S3, removing files that no longer exist locally.
run('aws', ['s3', 'sync', 'dist/', `s3://${bucket}`, '--delete']);

// 4. Invalidate the CloudFront cache (also clears any cached error pages).
run('aws', ['cloudfront', 'create-invalidation', '--distribution-id', distributionId, '--paths', '/*']);

console.log(`\nDeployed to s3://${bucket} and invalidated CloudFront (${distributionId}).`);
