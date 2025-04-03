variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
}

variable "bucket_name" {
  description = "Name of the S3 bucket for frontend hosting"
  type        = string
}

variable "domain_name" {
  description = "Domain name for the CloudFront distribution"
  type        = string
}

variable "certificate_arn" {
  description = "ARN of the ACM certificate for the domain"
  type        = string
} 