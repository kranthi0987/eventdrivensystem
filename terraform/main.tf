terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
  backend "s3" {
    bucket = "eventdrivensystem-terraform-state"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

module "vpc" {
  source = "./modules/vpc"
  
  environment     = var.environment
  vpc_cidr       = var.vpc_cidr
  azs            = var.availability_zones
  private_subnets = var.private_subnet_cidrs
  public_subnets  = var.public_subnet_cidrs
}

module "elastic_beanstalk" {
  source = "./modules/elastic_beanstalk"
  
  environment     = var.environment
  vpc_id         = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnet_ids
  public_subnets  = module.vpc.public_subnet_ids
  
  app_name       = var.app_name
  app_port       = var.app_port
  instance_type  = var.instance_type
  min_instances  = var.min_instances
  max_instances  = var.max_instances
}

module "redis" {
  source = "./modules/redis"
  
  environment     = var.environment
  vpc_id         = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  app_security_group_id = module.elastic_beanstalk.security_group_id
}

# Frontend Infrastructure
module "frontend" {
  source = "./modules/frontend"
  
  environment = var.environment
  bucket_name = var.frontend_bucket_name
  domain_name = var.frontend_domain_name
  certificate_arn = var.frontend_certificate_arn
}

# CI/CD Infrastructure
# CodeBuild Project
resource "aws_codebuild_project" "nodeci_cd" {
  name          = "${var.environment}-${var.project_name}-build"
  description   = "Build project for NodeCI-CD"
  build_timeout = "30"
  service_role  = aws_iam_role.codebuild_role.arn

  artifacts {
    type = "NO_ARTIFACTS"
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                      = "aws/codebuild/amazonlinux2-x86_64-standard:4.0"
    type                       = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
  }

  source {
    type            = "GITHUB"
    location        = var.github_repository_url
    git_clone_depth = 1
    buildspec       = "buildspec.yml"
  }

  vpc_config {
    vpc_id             = module.vpc.vpc_id
    subnets            = module.vpc.private_subnet_ids
    security_group_ids = [aws_security_group.codebuild_sg.id]
  }
}

# CodePipeline
resource "aws_codepipeline" "nodeci_cd" {
  name     = "${var.environment}-${var.project_name}-pipeline"
  role_arn = aws_iam_role.codepipeline_role.arn

  artifact_store {
    location = aws_s3_bucket.artifact_store.bucket
    type     = "S3"
  }

  stage {
    name = "Source"

    action {
      name             = "Source"
      category         = "Source"
      owner            = "AWS"
      provider         = "CodeStarSourceConnection"
      version          = "1"
      output_artifacts = ["source_output"]

      configuration = {
        ConnectionArn    = aws_codestarconnections_connection.github.arn
        FullRepositoryId = var.github_repository_id
        BranchName       = var.branch_name
        OutputArtifactFormat = "CODE_ZIP"
      }
    }
  }

  stage {
    name = "Build"

    action {
      name            = "Build"
      category        = "Build"
      owner           = "AWS"
      provider        = "CodeBuild"
      input_artifacts = ["source_output"]
      version         = "1"

      configuration = {
        ProjectName = aws_codebuild_project.nodeci_cd.name
      }
    }
  }

  stage {
    name = "Deploy"

    action {
      name            = "Deploy"
      category        = "Deploy"
      owner           = "AWS"
      provider        = "ElasticBeanstalk"
      input_artifacts = ["source_output"]
      version         = "1"

      configuration = {
        ApplicationName = var.elastic_beanstalk_app_name
        EnvironmentName = var.elastic_beanstalk_env_name
      }
    }
  }
}

# S3 Bucket for Artifacts
resource "aws_s3_bucket" "artifact_store" {
  bucket = "${var.environment}-${var.project_name}-artifacts-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket_versioning" "artifact_store" {
  bucket = aws_s3_bucket.artifact_store.id
  versioning_configuration {
    status = "Enabled"
  }
}

# IAM Roles and Policies
resource "aws_iam_role" "codebuild_role" {
  name = "${var.environment}-${var.project_name}-codebuild-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "codebuild.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role" "codepipeline_role" {
  name = "${var.environment}-${var.project_name}-codepipeline-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "codepipeline.amazonaws.com"
        }
      }
    ]
  })
}

# Security Group for CodeBuild
resource "aws_security_group" "codebuild_sg" {
  name        = "${var.environment}-${var.project_name}-codebuild-sg"
  description = "Security group for CodeBuild project"
  vpc_id      = module.vpc.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# GitHub Connection
resource "aws_codestarconnections_connection" "github" {
  name          = "${var.environment}-${var.project_name}-github"
  provider_type = "GitHub"
}

# Data source for AWS account ID
data "aws_caller_identity" "current" {}

# Update CodeBuild IAM role to include S3 and CloudFront permissions
resource "aws_iam_role_policy" "codebuild_frontend_deploy" {
  name = "${var.environment}-${var.project_name}-codebuild-frontend-deploy"
  role = aws_iam_role.codebuild_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket",
          "s3:DeleteObject"
        ]
        Resource = [
          "arn:aws:s3:::${var.frontend_bucket_name}",
          "arn:aws:s3:::${var.frontend_bucket_name}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation"
        ]
        Resource = [
          module.frontend.cloudfront_distribution_arn
        ]
      }
    ]
  })
} 