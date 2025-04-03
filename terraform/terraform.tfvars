# General Configuration
aws_region = "ap-south-1"
environment = "production"
project_name = "eventdrivensystem"

# VPC Configuration
vpc_cidr = "10.0.0.0/16"
availability_zones = ["ap-south-1a", "ap-south-1b", "ap-south-1c"]
private_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
public_subnet_cidrs = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

# Elastic Beanstalk Configuration
app_name = "eventdrivensystem"
app_port = 3000
instance_type = "t2.micro"
min_instances = 1
max_instances = 1

# CI/CD Configuration
github_repository_url = "https://github.com/kranthi0987/eventdrivensystem"
github_repository_id = "kranthi0987/eventdrivensystem"
branch_name = "main"
elastic_beanstalk_app_name = "eventdrivensystem"
elastic_beanstalk_env_name = "eventdrivensystem-prod"

# Redis Configuration
redis_node_type = "cache.t3.micro"
redis_num_cache_nodes = 1
redis_parameter_group_family = "redis6.x"
redis_port = 6379

# Tags
tags = {
  Environment = "production"
  Project     = "eventdrivensystem"
  Terraform   = "true"
  ManagedBy   = "terraform"
} 