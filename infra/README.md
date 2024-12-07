# MP3 Editor - AWS ECS Terraform Deployment

This repository contains Terraform configurations to deploy the MP3 Editor application to AWS ECS using Fargate.

## Architecture Overview

The deployment creates the following AWS resources:
- VPC with public and private subnets
- Application Load Balancer (ALB)
- ECS Cluster with Fargate
- EFS for persistent storage
- ECR repositories for Docker images
- Security Groups and IAM roles
- CloudWatch Log Groups

## Prerequisites

- Terraform >= 1.0.0
- AWS CLI configured with appropriate credentials
- Docker installed locally
- The MP3 Editor application Docker images built locally

## Project Structure

```
.
├── provider.tf          # AWS provider configuration
├── variables.tf         # Input variables
├── vpc.tf               # VPC and networking
├── security_groups.tf   # Security group definitions
├── efs.tf               # EFS configuration
├── alb.tf               # Load balancer setup
├── ecs.tf               # ECS cluster and service
├── ecr.tf               # Container registries
├── iam.tf               # IAM roles and policies
├── cloudwatch.tf        # Logging configuration
└── outputs.tf           # Output values
```

## Configuration Variables

Edit `variables.tf` to customize:
- `environment` - Deployment environment (default: "prod")
- `app_name` - Application name (default: "tagger")
- `aws_region` - Region name (default: "eu-west-2")

## Deployment Steps

1. Initialize Terraform:
```bash
terraform init
```

2. Create ECR repositories and push Docker images:
```bash
terraform apply -target=aws_ecr_repository.frontend -target=aws_ecr_repository.backend

# Get ECR login credentials
aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin $(terraform output -raw ecr_frontend_repository_url)

# Get the repository URLs
FRONTEND_REPO=$(terraform output -raw ecr_frontend_repository_url)
BACKEND_REPO=$(terraform output -raw ecr_backend_repository_url)

# Tag images
docker tag tagger-frontend:latest ${FRONTEND_REPO}:latest
docker tag tagger-backend:latest ${BACKEND_REPO}:latest

# Push images
docker push ${FRONTEND_REPO}:latest
docker push ${BACKEND_REPO}:latest
```

3. Review the planned changes:
```bash
terraform plan
```

4. Apply the configuration:
```bash
terraform apply --auto-approve
```

5. Get the application URL:
```bash
terraform output alb_dns_name
```

## Resource Details

### Networking
- VPC with CIDR block 10.0.0.0/16
- Two public subnets for ALB
- Two private subnets for ECS tasks
- NAT Gateway for private subnet internet access

### Security
- ALB security group: Allows inbound HTTP/HTTPS
- ECS tasks security group: Allows inbound from ALB
- EFS security group: Allows NFS access from ECS tasks

### Storage
- EFS file system for persistent storage
- Mount points in each private subnet
- Separate directories for uploads and output

### Compute
- ECS Fargate cluster
- Task definition with frontend and backend containers
- Service with desired count of 1 (configurable)
- Auto-scaling ready

### Load Balancer
- Application Load Balancer
- Frontend target group (port 5173)
- Backend target group (port 8000)
- Path-based routing (/api/* to backend)

## Monitoring and Logging

- CloudWatch log groups for container logs
- Log retention set to 30 days
- ECS service metrics available in CloudWatch

## Cleanup

To destroy all created resources:
```bash
terraform destroy
```

## Cost Considerations

This deployment includes:
- Fargate tasks (CPU/Memory)
- ALB hours
- EFS storage
- NAT Gateway hours
- CloudWatch Logs

Monitor AWS billing dashboard for actual costs.

## Security Considerations

- All containers run in private subnets
- No direct internet access to ECS tasks
- EFS encryption enabled
- IAM roles follow least privilege principle

## Troubleshooting

1. Check ECS service events:
```bash
aws ecs describe-services --cluster tagger-cluster --services tagger-service
```

2. View container logs:
```bash
aws logs get-log-events --log-group-name /ecs/tagger --log-stream-name frontend/backend
```

3. Common issues:
- Task failures: Check CloudWatch logs
- Health check failures: Verify application ports and paths
- Container crashes: Check Docker image configuration

## Future Improvements

- Add HTTPS with ACM certificate
- Implement auto-scaling
- Add backup strategy for EFS
- Set up CloudWatch alarms
- Add WAF for security
- Implement blue-green deployments