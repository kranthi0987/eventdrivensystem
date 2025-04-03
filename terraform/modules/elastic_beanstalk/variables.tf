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

variable "min_instances" {
  description = "Minimum number of EC2 instances"
  type        = number
}

variable "max_instances" {
  description = "Maximum number of EC2 instances"
  type        = number
}

variable "redis_endpoint" {
  description = "Redis endpoint"
  type        = string
} 