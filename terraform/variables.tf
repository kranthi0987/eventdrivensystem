# General Configuration
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "eventdrivensystem"
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
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["ap-south-1a", "ap-south-1b"]
}

variable "public_subnet_cidrs" {
  description = "Public subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "Private subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.3.0/24", "10.0.4.0/24"]
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

# Frontend Configuration
variable "frontend_bucket_name" {
  description = "S3 bucket name for frontend assets"
  type        = string
}

# Tags
variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default = {
    Environment = "production"
    Terraform   = "true"
  }
}