# General Configuration
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "eventdrivensystem"
}

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

# Elastic Beanstalk Configuration
variable "app_name" {
  description = "Application name"
  type        = string
  default     = "eventdrivensystem"
}

variable "app_port" {
  description = "Application port"
  type        = number
  default     = 3000
}

variable "instance_type" {
  description = "EC2 instance type for Elastic Beanstalk"
  type        = string
  default     = "t2.micro"
}

variable "min_instances" {
  description = "Minimum number of EC2 instances"
  type        = number
  default     = 1
}

variable "max_instances" {
  description = "Maximum number of EC2 instances"
  type        = number
  default     = 4
}

# RDS Configuration
variable "db_name" {
  description = "Database name"
  type        = string
  default     = "eventdrivensystem"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "admin"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "Database instance class"
  type        = string
  default     = "db.t3.micro"
}

# CI/CD Configuration
variable "github_repository_url" {
  description = "GitHub repository URL"
  type        = string
}

variable "github_repository_id" {
  description = "GitHub repository ID (owner/repo)"
  type        = string
}

variable "branch_name" {
  description = "GitHub branch name to build from"
  type        = string
  default     = "main"
}

variable "elastic_beanstalk_app_name" {
  description = "Elastic Beanstalk application name"
  type        = string
}

variable "elastic_beanstalk_env_name" {
  description = "Elastic Beanstalk environment name"
  type        = string
}

variable "ecr_repository" {
  description = "ECR repository name"
  type        = string
  default     = "eventdrivensystem"
}

# Frontend Configuration
variable "frontend_bucket_name" {
  description = "Name of the S3 bucket for frontend hosting"
  type        = string
  default     = "event-monitor-frontend"
}

variable "frontend_domain_name" {
  description = "Domain name for the frontend application"
  type        = string
  default     = "monitor.yourdomain.com"
}

variable "frontend_certificate_arn" {
  description = "ARN of the ACM certificate for the frontend domain"
  type        = string
  default     = ""
} 