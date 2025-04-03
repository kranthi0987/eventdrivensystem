#!/bin/bash
set -e

# Configuration
S3_BUCKET="eventdrivensystem-terraform-state"
BACKUP_DIR="terraform-state-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="terraform_state_backup_${TIMESTAMP}.tar.gz"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "Creating backup of Terraform state files..."

# Create a temporary directory for the files we want to backup
TEMP_DIR=$(mktemp -d)

# Copy only the files that exist
if [ -f "terraform.tfstate" ]; then
  cp terraform.tfstate $TEMP_DIR/
  echo "Included terraform.tfstate in backup"
fi

if [ -f "terraform.tfstate.backup" ]; then
  cp terraform.tfstate.backup $TEMP_DIR/
  echo "Included terraform.tfstate.backup in backup"
fi

if [ -f ".terraform.tfstate.lock.info" ]; then
  cp .terraform.tfstate.lock.info $TEMP_DIR/
  echo "Included .terraform.tfstate.lock.info in backup"
fi

# Check if we have any files to backup
if [ "$(ls -A $TEMP_DIR)" ]; then
  # Create tar archive
  tar -czf $BACKUP_DIR/$BACKUP_FILE -C $TEMP_DIR .
  
  # Upload to S3
  echo "Uploading backup to S3 bucket: $S3_BUCKET"
  aws s3 cp $BACKUP_DIR/$BACKUP_FILE s3://$S3_BUCKET/terraform-state-backups/
  
  # Clean up
  rm -rf $TEMP_DIR
  rm -f $BACKUP_DIR/$BACKUP_FILE
  
  echo "Backup completed successfully!"
else
  echo "No Terraform state files found to backup."
  rm -rf $TEMP_DIR
  exit 0
fi 