# Event-Driven System

A modern event-driven system built with Node.js, TypeScript, and AWS services.

## Architecture

The system is built with the following components:

- **Frontend**: React/TypeScript application
- **Backend**: Node.js/TypeScript API with GraphQL
- **Infrastructure**: AWS services managed by Terraform
- **CI/CD**: GitHub Actions
- **Containerization**: Docker
- **Database**: Amazon RDS (PostgreSQL)
- **Caching**: Amazon ElastiCache (Redis)
- **Message Queue**: Amazon SQS
- **Container Orchestration**: Amazon ECS
- **Load Balancing**: Application Load Balancer

## Prerequisites

- Node.js 18.x
- Docker
- AWS CLI
- Terraform 1.5.x
- GitHub account
- AWS account with appropriate permissions

## Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/eventdrivensystem.git
   cd eventdrivensystem
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=3000
   DATABASE_URL=postgresql://user:password@localhost:5432/eventdrivensystem
   REDIS_URL=redis://localhost:6379
   AWS_REGION=us-east-1
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Infrastructure Setup

1. Configure AWS credentials:
   ```bash
   aws configure
   ```

2. Create an S3 bucket for Terraform state:
   ```bash
   aws s3api create-bucket --bucket eventdrivensystem-terraform-state --region us-east-1
   ```

3. Initialize Terraform:
   ```bash
   cd terraform
   terraform init
   ```

4. Apply the infrastructure:
   ```bash
   terraform apply
   ```

## CI/CD Setup

1. Fork the repository to your GitHub account

2. Add the following secrets to your GitHub repository:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `DB_PASSWORD`

3. Push to the main branch to trigger the CI/CD pipeline

## Deployment

The system is automatically deployed when changes are pushed to the main branch. The deployment process includes:

1. Running tests
2. Building Docker image
3. Pushing to Amazon ECR
4. Updating ECS service
5. Applying infrastructure changes via Terraform

## Monitoring and Logging

- Application logs are available in CloudWatch Logs
- Metrics are collected via CloudWatch Metrics
- Alarms are configured for critical metrics

## Security

- All sensitive data is stored in AWS Secrets Manager
- Network security is managed through VPC, security groups, and NACLs
- SSL/TLS encryption is enforced
- IAM roles and policies follow the principle of least privilege

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm test`
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
