variable "vpc_id" {
  description = "VPC ID where Redis will be created"
  type        = string
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs"
  type        = list(string)
}

variable "app_security_group_id" {
  description = "Security group ID of the application that will access Redis"
  type        = string
} 