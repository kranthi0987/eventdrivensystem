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

# Use data source for existing S3 bucket for Terraform state
data "aws_s3_bucket" "terraform_state" {
  bucket = "eventdrivensystem-terraform-state"
}

# Use data source for existing Elastic Beanstalk application
data "aws_elastic_beanstalk_application" "app" {
  name = var.elastic_beanstalk_app_name
}

# Use data source for existing IAM role
data "aws_iam_role" "eb_instance_role" {
  name = "${var.project_name}-eb-instance-role"
}

# Use data source for existing IAM instance profile
data "aws_iam_instance_profile" "eb_instance_profile" {
  name = "${var.app_name}-eb-instance-profile"
}

module "vpc" {
  source = "./modules/vpc"
  
  environment     = var.environment
  vpc_cidr       = var.vpc_cidr
  azs            = var.availability_zones
  private_subnets = var.private_subnet_cidrs
  public_subnets  = var.public_subnet_cidrs
}

# Elastic Beanstalk Environment
resource "aws_elastic_beanstalk_environment" "app" {
  name                = "${var.app_name}-${var.environment}"
  application         = data.aws_elastic_beanstalk_application.app.name
  solution_stack_name = "64bit Amazon Linux 2023 v6.5.0 running Node.js 22"
  tier                = "WebServer"

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = data.aws_iam_instance_profile.eb_instance_profile.name
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = "t3.micro"
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
  value       = "To check health status, use AWS CLI: aws elasticbeanstalk describe-environments --environment-names ${aws_elastic_beanstalk_environment.app.name} --query 'Environments[0].Health' --output text"
  description = "Elastic Beanstalk Environment Health Status (check using AWS CLI)"
}

output "frontend_url" {
  value = "http://${aws_elastic_beanstalk_environment.app.cname}"
} 