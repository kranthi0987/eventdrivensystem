terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Generate random string for bucket name
resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

# Create S3 bucket for storing key pair
resource "aws_s3_bucket" "keys" {
  bucket = "${var.project_name}-keys-${random_string.suffix.result}"
}

# Set bucket ownership controls
resource "aws_s3_bucket_ownership_controls" "keys" {
  bucket = aws_s3_bucket.keys.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

# Enable server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "keys" {
  bucket = aws_s3_bucket.keys.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Bucket policy to ensure private access
resource "aws_s3_bucket_policy" "keys" {
  bucket = aws_s3_bucket.keys.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Deny"
        Principal = "*"
        Action = "s3:*"
        Resource = [
          aws_s3_bucket.keys.arn,
          "${aws_s3_bucket.keys.arn}/*"
        ]
        Condition = {
          Bool = {
            "aws:SecureTransport" = "false"
          }
        }
      }
    ]
  })
}

# Create EC2 key pair
resource "tls_private_key" "ec2_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

# Import existing key pair
resource "aws_key_pair" "app" {
  key_name   = var.key_name
  public_key = tls_private_key.ec2_key.public_key_openssh

  tags = merge(var.tags, {
    Name = "${var.project_name}-key"
  })

  lifecycle {
    ignore_changes = [public_key]
  }
}

# Store private key in S3
resource "aws_s3_object" "private_key" {
  bucket  = aws_s3_bucket.keys.id
  key     = "ec2-key.pem"
  content = tls_private_key.ec2_key.private_key_pem

  server_side_encryption = "AES256"
}

# VPC Configuration
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(var.tags, {
    Name = "${var.project_name}-vpc"
  })
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[0]
  map_public_ip_on_launch = true
  availability_zone       = var.availability_zones[0]

  tags = merge(var.tags, {
    Name = "${var.project_name}-public-subnet"
  })
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(var.tags, {
    Name = "${var.project_name}-igw"
  })
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-public-rt"
  })
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# Security Group for EC2 Instance
resource "aws_security_group" "app" {
  name        = "${var.project_name}-app-sg"
  description = "Security group for application"
  vpc_id      = aws_vpc.main.id

  # Allow HTTP traffic
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP"
  }

  # Allow HTTPS traffic
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS"
  }

  # Allow SSH traffic
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH"
  }

  # Allow application ports
  ingress {
    from_port   = 3000
    to_port     = 3002
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Application ports"
  }

  # Allow frontend port
  ingress {
    from_port   = 5173
    to_port     = 5173
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Frontend port"
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-app-sg"
  })
}

# Elastic IP for the EC2 instance
resource "aws_eip" "app" {
  tags = merge(var.tags, {
    Name = "${var.project_name}-eip"
  })
}

# Associate Elastic IP with EC2 instance
resource "aws_eip_association" "app" {
  instance_id   = aws_instance.app.id
  allocation_id = aws_eip.app.id
}

# EC2 Instance
resource "aws_instance" "app" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = var.instance_type
  key_name              = var.key_name
  subnet_id             = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.app.id]

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
    encrypted   = true
  }

  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install -y nginx
              systemctl start nginx
              systemctl enable nginx
              EOF

  tags = merge(var.tags, {
    Name        = "${var.project_name}-app-server"
    Environment = var.environment
    Application = var.app_name
  })
}

# Latest Amazon Linux 2023 AMI
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Outputs
output "instance_public_ip" {
  value = aws_eip.app.public_ip
}

output "instance_public_dns" {
  value = aws_eip.app.public_dns
}

output "elastic_ip" {
  value = aws_eip.app.public_ip
}

output "key_bucket_name" {
  value = aws_s3_bucket.keys.id
}

output "key_object_name" {
  value = aws_s3_object.private_key.id
} 