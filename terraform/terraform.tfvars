# General Configuration
aws_region = "ap-south-1"
environment = "production"
project_name = "eventdrivensystem"

# VPC Configuration
vpc_cidr = "10.0.0.0/16"
availability_zones = ["ap-south-1a"]
private_subnet_cidrs = ["10.0.101.0/24"]
public_subnet_cidrs = ["10.0.1.0/24"]

# Application Configuration
app_name = "eventdrivensystem"
app_port = 8081
instance_type = "t3.micro"
min_instances = 1
max_instances = 1

# CI/CD Configuration
github_repository_url = "https://github.com/kranthi0987/eventdrivensystem"
github_repository_id = "kranthi0987/eventdrivensystem"
branch_name = "main"

# Redis Configuration
redis_node_type = "cache.t3.micro"
redis_num_cache_nodes = 1
redis_parameter_group_family = "redis6.x"
redis_port = 6379

# Frontend Configuration
frontend_bucket_name = "event-monitor-frontend"

# Tags
tags = {
  Environment = "production"
  Project     = "eventdrivensystem"
  Terraform   = "true"
  ManagedBy   = "terraform"
} 