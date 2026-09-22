# AWS — Essentials for Developers 2025

## Summary
AWS = cloud platform. Key services: S3 (storage), Lambda (serverless), EC2 (compute), RDS (database), CloudFront (CDN). Key: least privilege IAM, IaC, serverless-first.

## S3 (Storage)
```javascript
// Upload to S3
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
const s3 = new S3Client({ region: 'ap-southeast-1' })

await s3.send(new PutObjectCommand({
  Bucket: 'my-bucket',
  Key: `uploads/${userId}/${filename}`,
  Body: fileBuffer,
  ContentType: 'image/webp',
}))
```
**Best Practices:**
- Never make buckets public (use CloudFront + OAI)
- Enable versioning for critical data
- Lifecycle rules: Standard → IA → Glacier
- Encrypt at rest (KMS) and in transit (HTTPS)
- Enable access logs

## Lambda (Serverless)
```javascript
// Lambda handler
export const handler = async (event) => {
  try {
    const { id } = JSON.parse(event.body)
    const result = await db.getUser(id)
    return { statusCode: 200, body: JSON.stringify(result) }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
  }
}
```
**Best Practices:**
- Keep functions small and focused
- Use environment variables for config
- Use Lambda Layers for shared code
- SnapStart for cold start optimization
- DLQ (Dead Letter Queue) for failed invocations
- Memory = performance (more memory = more CPU)
- Max 15 min execution (use Step Functions for longer)

## EC2 (Compute)
**Best Practices:**
- Use Graviton (ARM) for 40% better price-performance
- Auto Scaling Groups for traffic spikes
- Spot Instances for non-critical workloads (70% savings)
- Use Session Manager instead of SSH
- Encrypt EBS volumes

## RDS (Database)
**Best Practices:**
- Multi-AZ for high availability
- Read Replicas for read-heavy workloads
- Performance Insights for slow query analysis
- Automated backups + point-in-time recovery
- Use Parameter Groups for tuning

## CloudFront (CDN)
**Best Practices:**
- Put CloudFront in front of S3 (not direct S3 URLs)
- Enable HTTPS with ACM certificates
- WAF integration for security
- Cache policies with proper TTL
- Lambda@Edge for dynamic content

## IAM Security
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:PutObject"],
    "Resource": "arn:aws:s3:::my-bucket/uploads/*"
  }]
}
```
- ✅ Least privilege (only permissions needed)
- ✅ Use IAM Roles, not access keys
- ✅ Enable MFA for root account
- ✅ Rotate credentials regularly
- ❌ Never hardcode credentials in code

## Cost Optimization
- Use AWS Cost Explorer + Budgets
- Right-size instances (Compute Optimizer)
- Reserved Instances for steady workloads
- Spot for batch processing
- Turn off dev/staging at night

## Architecture Cheat Sheet
```
Static Site:     S3 + CloudFront
API:             API Gateway + Lambda
Full App:        EC2 + RDS (or ECS + Fargate)
Real-time:       API Gateway WebSocket + Lambda
Queue:           SQS + Lambda
Scheduled:       EventBridge + Lambda
Auth:            Cognito
Monitoring:      CloudWatch + X-Ray
IaC:             CloudFormation or Terraform
```

## Date: 2026-03-17 | Sources: aws.amazon.com, dev.to
