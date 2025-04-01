# Event-Driven System Infrastructure

This directory contains the Terraform configuration for the complete infrastructure of the Event-Driven System, including VPC, Elastic Beanstalk, RDS, Redis, ALB, and CI/CD components.

## Infrastructure Components

### Core Infrastructure
- VPC with public and private subnets
- Elastic Beanstalk application environment
- RDS database instance
- Redis cache cluster
- Application Load Balancer

### CI/CD Infrastructure
- AWS CodeBuild Project for building the application
- AWS CodePipeline for orchestrating the CI/CD process
- S3 Bucket for storing artifacts
- IAM Roles and Policies for service permissions
- Security Groups for network access
- GitHub integration via CodeStar Connections

## Prerequisites

1. AWS CLI configured with appropriate credentials
2. Terraform installed (version >= 1.0)
3. GitHub repository with the application code
4. AWS S3 bucket for Terraform state (eventdrivensystem-terraform-state)

## Usage

### Initial Setup

1. Navigate to the terraform directory:
   ```bash
   cd terraform
   ```

2. Initialize the infrastructure:
   ```bash
   ./scripts/manage_state.sh init
   ```

3. Create a `terraform.tfvars` file with your configuration:
   ```hcl
   environment = "production"
   project_name = "eventdrivensystem"
   
   # VPC Configuration
   vpc_cidr = "10.0.0.0/16"
   availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
   private_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
   public_subnet_cidrs = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
   
   # Elastic Beanstalk Configuration
   app_name = "eventdrivensystem"
   app_port = 3000
   instance_type = "t2.micro"
   min_instances = 1
   max_instances = 4
   
   # RDS Configuration
   db_name = "eventdrivensystem"
   db_username = "admin"
   db_password = "your-secure-password"
   db_instance_class = "db.t3.micro"
   
   # CI/CD Configuration
   github_repository_url = "https://github.com/your-org/your-repo"
   github_repository_id = "your-org/your-repo"
   elastic_beanstalk_app_name = "your-app-name"
   elastic_beanstalk_env_name = "your-env-name"
   ```

4. Plan the infrastructure changes:
   ```bash
   ./scripts/manage_state.sh plan
   ```

5. Apply the infrastructure:
   ```bash
   ./scripts/manage_state.sh apply
   ```

### State Management

The infrastructure includes a state management script that provides the following functionality:

1. Initialize infrastructure:
   ```bash
   ./scripts/manage_state.sh init
   ```

2. Plan infrastructure changes:
   ```bash
   ./scripts/manage_state.sh plan
   ```

3. Apply infrastructure changes:
   ```bash
   ./scripts/manage_state.sh apply
   ```

4. Backup state file:
   ```bash
   ./scripts/manage_state.sh backup
   ```

5. Restore state file from backup:
   ```bash
   ./scripts/manage_state.sh restore YYYYMMDD_HHMMSS
   ```

6. List available backups:
   ```bash
   ./scripts/manage_state.sh list
   ```

7. Manually destroy infrastructure:
   ```bash
   ./scripts/manage_state.sh destroy
   ```

## State File Management

The state file is automatically backed up to an S3 bucket before any destructive operations. The backup bucket is configured as:
- Bucket: `eventdrivensystem-terraform-backups`
- Prefix: `backups/`

## Security Considerations

1. All resources are created in private subnets
2. Security groups are configured with minimal required access
3. IAM roles follow the principle of least privilege
4. Sensitive variables should be stored in AWS Secrets Manager or similar service
5. RDS and Redis instances are not publicly accessible
6. All traffic is routed through the ALB

## Maintenance

1. Regular state file backups are recommended
2. Monitor AWS CloudWatch metrics for all resources
3. Review and update IAM permissions periodically
4. Keep the GitHub connection up to date
5. Monitor database performance and scaling needs
6. Review security group rules regularly

## Troubleshooting

1. Check CloudWatch Logs for application and infrastructure issues
2. Verify GitHub connection status in AWS Console
3. Ensure all required IAM permissions are present
4. Check VPC and subnet configurations
5. Verify database connectivity and performance
6. Monitor ALB health checks and target group status

## Cleanup

To completely remove the infrastructure:

1. Run the manual destroy script:
   ```bash
   ./scripts/manage_state.sh destroy
   ```

2. Verify all resources are removed in the AWS Console

3. If needed, manually delete the S3 buckets and any remaining resources

## Directory Structure

```
terraform/
├── main.tf              # Main Terraform configuration
├── variables.tf         # Variable definitions
├── modules/            # Reusable Terraform modules
│   ├── vpc/           # VPC module
│   ├── elastic_beanstalk/  # Elastic Beanstalk module
│   ├── rds/           # RDS module
│   ├── redis/         # Redis module
│   └── alb/           # ALB module
├── scripts/           # Management scripts
│   └── manage_state.sh  # State management script
└── README.md          # This file
``` 