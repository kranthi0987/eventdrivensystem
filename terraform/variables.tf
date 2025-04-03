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

# Application Configuration
variable "app_port" {
  description = "Application port"
  type        = number
  default     = 8080
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "eventdrivensystem"
}

# Elastic Beanstalk Configuration
variable "solution_stack_name" {
  description = "Elastic Beanstalk solution stack name"
  type        = string
  default     = "64bit Amazon Linux 2023 v6.5.0 running Node.js 22"
}

variable "instance_type" {
  description = "EC2 instance type for Elastic Beanstalk"
  type        = string
  default     = "t3.micro"
}

variable "min_instances" {
  description = "Minimum number of instances in the Auto Scaling Group"
  type        = number
  default     = 1
}

variable "max_instances" {
  description = "Maximum number of instances in the Auto Scaling Group"
  type        = number
  default     = 2
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


variable "github_repository_url" {
  description = "GitHub repository URL"
  type        = string
  default     = ""
}

variable "github_repository_id" {
  description = "GitHub repository ID"
  type        = string
  default     = ""
}

variable "branch_name" {
  description = "Branch name"
  type        = string
  default     = "main"
}

variable "elastic_beanstalk_app_name" {
  description = "Elastic Beanstalk application name"
  type        = string
  default     = "eventdrivensystem"
}

variable "elastic_beanstalk_env_name" {
  description = "Elastic Beanstalk environment name"
  type        = string
  default     = "eventdrivensystem-prod"
}

variable "redis_node_type" {
  description = "Redis node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "redis_num_cache_nodes" {
  description = "Number of Redis cache nodes"
  type        = number
  default     = 1
}

variable "redis_parameter_group_family" {
  description = "Redis parameter group family"
  type        = string
  default     = "redis6.x"
}

variable "redis_port" {
  description = "Redis port"
  type        = number
  default     = 6379
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}