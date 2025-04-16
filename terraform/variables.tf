# General Configuration
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "eventdrivensystem"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "eventdrivensystem-app"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "key_name" {
  description = "Name of the existing EC2 key pair"
  type        = string
  default     = "eventdrivensystem-key"
}

# VPC Configuration
variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["ap-south-1a"]
}

variable "public_subnet_cidrs" {
  description = "Public subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.1.0/24"]
}

variable "private_subnet_cidrs" {
  description = "Private subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.101.0/24"]
}

# Application Configuration
variable "app_port" {
  description = "Application port"
  type        = number
  default     = 8081
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "min_instances" {
  description = "Minimum number of instances"
  type        = number
  default     = 1
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = number
  default     = 1
}

# CI/CD Configuration
variable "github_repository_url" {
  description = "GitHub repository URL"
  type        = string
}

variable "github_repository_id" {
  description = "GitHub repository ID"
  type        = string
}

variable "branch_name" {
  description = "Branch name"
  type        = string
  default     = "main"
}

# Redis Configuration
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

# Frontend Configuration
variable "frontend_bucket_name" {
  description = "Frontend S3 bucket name"
  type        = string
  default     = "event-monitor-frontend"
}

# Tags
variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default = {
    Environment = "production"
    Project     = "eventdrivensystem"
    Terraform   = "true"
    ManagedBy   = "terraform"
  }
}