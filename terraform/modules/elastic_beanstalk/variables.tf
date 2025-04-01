variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnets" {
  description = "List of private subnet IDs"
  type        = list(string)
}

variable "public_subnets" {
  description = "List of public subnet IDs"
  type        = list(string)
}

variable "app_name" {
  description = "Application name"
  type        = string
}

variable "app_port" {
  description = "Application port"
  type        = number
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
}

variable "min_instances" {
  description = "Minimum number of EC2 instances"
  type        = number
}

variable "max_instances" {
  description = "Maximum number of EC2 instances"
  type        = number
}

variable "rds_endpoint" {
  description = "RDS endpoint"
  type        = string
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "db_username" {
  description = "Database username"
  type        = string
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "redis_endpoint" {
  description = "Redis endpoint"
  type        = string
} 