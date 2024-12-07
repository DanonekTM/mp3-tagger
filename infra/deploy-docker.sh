#!/bin/bash

# Build docker images
cd .. && docker compose build --no-cache && cd infra

# Create repositories
terraform apply -target=aws_ecr_repository.frontend -target=aws_ecr_repository.backend

# Get ECR login credentials
echo "Logging into AWS ECR..."
aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin $(terraform output -raw ecr_frontend_repository_url)

# Get the repository URLs
FRONTEND_REPO=$(terraform output -raw ecr_frontend_repository_url)
BACKEND_REPO=$(terraform output -raw ecr_backend_repository_url)

echo "Frontend repo: ${FRONTEND_REPO}"
echo "Backend repo: ${BACKEND_REPO}"

# Tag images
echo "Tagging images..."
docker tag tagger-frontend:latest ${FRONTEND_REPO}:latest
docker tag tagger-backend:latest ${BACKEND_REPO}:latest

# Push images
echo "Pushing images to ECR..."
docker push ${FRONTEND_REPO}:latest
docker push ${BACKEND_REPO}:latest

echo "Docker deployment complete!"