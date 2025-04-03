terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Create S3 bucket for Terraform state
resource "aws_s3_bucket" "terraform_state" {
  bucket = "eventdrivensystem-terraform-state"
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

module "vpc" {
  source = "./modules/vpc"
  
  environment     = var.environment
  vpc_cidr       = var.vpc_cidr
  azs            = var.availability_zones
  private_subnets = var.private_subnet_cidrs
  public_subnets  = var.public_subnet_cidrs
}

# Elastic Beanstalk Application
resource "aws_elastic_beanstalk_application" "app" {
  name        = var.elastic_beanstalk_app_name
  description = "Application for ${var.project_name}"
}

# Elastic Beanstalk Environment
resource "aws_elastic_beanstalk_environment" "app" {
  name                = var.elastic_beanstalk_env_name
  application         = aws_elastic_beanstalk_application.app.name
  solution_stack_name = var.solution_stack_name
  tier                = "WebServer"

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.eb_instance_profile.name
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = var.instance_type
  }

  setting {
    namespace = "aws:autoscaling:asg"
    name      = "MinSize"
    value     = var.min_instances
  }

  setting {
    namespace = "aws:autoscaling:asg"
    name      = "MaxSize"
    value     = var.max_instances
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "VPCId"
    value     = module.vpc.vpc_id
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "Subnets"
    value     = join(",", module.vpc.private_subnet_ids)
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "ELBSubnets"
    value     = join(",", module.vpc.public_subnet_ids)
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "LoadBalancerType"
    value     = "application"
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment:process:default"
    name      = "HealthCheckPath"
    value     = "/health"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "NODE_ENV"
    value     = var.environment
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "PORT"
    value     = var.app_port
  }

  tags = var.tags
}

# IAM Instance Profile for Elastic Beanstalk
resource "aws_iam_instance_profile" "eb_instance_profile" {
  name = "${var.project_name}-eb-instance-profile"
  role = aws_iam_role.eb_instance_role.name
}

resource "aws_iam_role" "eb_instance_role" {
  name = "${var.project_name}-eb-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "eb_web_tier" {
  role       = aws_iam_role.eb_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

# Security Group for Elastic Beanstalk
resource "aws_security_group" "eb_app" {
  name        = "${var.environment}-${var.project_name}-eb-app-sg"
  description = "Security group for Elastic Beanstalk application"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = var.app_port
    to_port     = var.app_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Frontend Infrastructure
module "frontend" {
  source = "./modules/frontend"
  
  environment = var.environment
  bucket_name = var.frontend_bucket_name
  domain_name = var.frontend_domain_name
  certificate_arn = var.frontend_certificate_arn
}

# Data source to get the current status of the Elastic Beanstalk environment
data "aws_elastic_beanstalk_environment" "app_status" {
  name = aws_elastic_beanstalk_environment.app.name
}

# Outputs
output "elastic_beanstalk_environment_endpoint" {
  value       = aws_elastic_beanstalk_environment.app.endpoint_url
  description = "The URL to the Elastic Beanstalk Environment"
}

output "elastic_beanstalk_environment_name" {
  value       = aws_elastic_beanstalk_environment.app.name
  description = "Elastic Beanstalk Environment Name"
}

output "elastic_beanstalk_environment_id" {
  value       = aws_elastic_beanstalk_environment.app.id
  description = "Elastic Beanstalk Environment ID"
}

output "elastic_beanstalk_environment_health" {
  value       = data.aws_elastic_beanstalk_environment.app_status
  description = "Elastic Beanstalk Environment Health Status"
}

output "frontend_url" {
  value = "http://${aws_elastic_beanstalk_environment.app.cname}"
} 