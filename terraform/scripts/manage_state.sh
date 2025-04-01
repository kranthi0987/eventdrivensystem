#!/bin/bash

# Exit on error
set -e

# Configuration
STATE_BUCKET="eventdrivensystem-terraform-state"
STATE_KEY="terraform.tfstate"
BACKUP_BUCKET="eventdrivensystem-terraform-backups"
BACKUP_PREFIX="backups"

# Function to backup state file
backup_state() {
    echo "Backing up state file..."
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_KEY="${BACKUP_PREFIX}/terraform_${TIMESTAMP}.tfstate"
    
    # Download current state
    aws s3 cp "s3://${STATE_BUCKET}/${STATE_KEY}" "terraform.tfstate"
    
    # Upload backup
    aws s3 cp "terraform.tfstate" "s3://${BACKUP_BUCKET}/${BACKUP_KEY}"
    
    # Clean up local file
    rm terraform.tfstate
    
    echo "State file backed up to s3://${BACKUP_BUCKET}/${BACKUP_KEY}"
}

# Function to restore state file
restore_state() {
    if [ -z "$1" ]; then
        echo "Please provide the backup timestamp (YYYYMMDD_HHMMSS)"
        exit 1
    fi
    
    BACKUP_KEY="${BACKUP_PREFIX}/terraform_${1}.tfstate"
    
    echo "Restoring state file from backup..."
    aws s3 cp "s3://${BACKUP_BUCKET}/${BACKUP_KEY}" "terraform.tfstate"
    aws s3 cp "terraform.tfstate" "s3://${STATE_BUCKET}/${STATE_KEY}"
    rm terraform.tfstate
    
    echo "State file restored from s3://${BACKUP_BUCKET}/${BACKUP_KEY}"
}

# Function to list available backups
list_backups() {
    echo "Available backups:"
    aws s3 ls "s3://${BACKUP_BUCKET}/${BACKUP_PREFIX}/" | grep terraform_ | awk '{print $4}'
}

# Function to manually destroy infrastructure
manual_destroy() {
    echo "Starting manual destroy process..."
    
    # Backup state before destroy
    backup_state
    
    # Run terraform destroy
    terraform destroy -auto-approve
    
    echo "Infrastructure destroyed successfully"
}

# Function to initialize infrastructure
init_infrastructure() {
    echo "Initializing infrastructure..."
    
    # Initialize Terraform
    terraform init
    
    # Create backup bucket if it doesn't exist
    if ! aws s3 ls "s3://${BACKUP_BUCKET}" 2>&1 > /dev/null; then
        echo "Creating backup bucket..."
        aws s3 mb "s3://${BACKUP_BUCKET}" --region us-east-1
        aws s3api put-bucket-versioning --bucket "${BACKUP_BUCKET}" --versioning-configuration Status=Enabled
    fi
    
    echo "Infrastructure initialized successfully"
}

# Function to apply infrastructure changes
apply_infrastructure() {
    echo "Applying infrastructure changes..."
    
    # Backup current state if it exists
    if aws s3 ls "s3://${STATE_BUCKET}/${STATE_KEY}" 2>&1 > /dev/null; then
        backup_state
    fi
    
    # Apply changes
    terraform apply -auto-approve
    
    echo "Infrastructure changes applied successfully"
}

# Function to plan infrastructure changes
plan_infrastructure() {
    echo "Planning infrastructure changes..."
    terraform plan
}

# Main script
case "$1" in
    "init")
        init_infrastructure
        ;;
    "plan")
        plan_infrastructure
        ;;
    "apply")
        apply_infrastructure
        ;;
    "backup")
        backup_state
        ;;
    "restore")
        restore_state "$2"
        ;;
    "list")
        list_backups
        ;;
    "destroy")
        manual_destroy
        ;;
    *)
        echo "Usage: $0 {init|plan|apply|backup|restore TIMESTAMP|list|destroy}"
        exit 1
        ;;
esac 