#!/bin/bash

# Exit on any error
set -e

# Create necessary directories
mkdir -p backups
mkdir -p terraform-state-backups

# Get current timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="terraform_${TIMESTAMP}.tfstate.backup"

# Verify terraform state exists
if [ ! -f "terraform.tfstate" ]; then
    echo "Error: terraform.tfstate not found!"
    exit 1
fi

# Create backup of current state
echo "Creating local backup..."
cp terraform.tfstate "backups/${BACKUP_FILE}"

# Verify backup was created
if [ ! -f "backups/${BACKUP_FILE}" ]; then
    echo "Error: Backup file was not created!"
    exit 1
fi

# Upload to S3
echo "Uploading backup to S3..."
aws s3 cp "backups/${BACKUP_FILE}" \
    "s3://${TERRAFORM_STATE_BUCKET}/terraform-state-backups/${BACKUP_FILE}" \
    --sse AES256

# Cleanup old local backups (keep last 5)
echo "Cleaning up old local backups..."
cd backups && ls -t | tail -n +6 | xargs -r rm --

# Cleanup old S3 backups (keep last 10)
echo "Cleaning up old S3 backups..."
aws s3 ls "s3://${TERRAFORM_STATE_BUCKET}/terraform-state-backups/" | \
    sort -r | tail -n +11 | \
    while read -r line; do
        file=$(echo "$line" | awk '{print $4}')
        aws s3 rm "s3://${TERRAFORM_STATE_BUCKET}/terraform-state-backups/$file"
    done

echo "Backup process completed successfully!"
echo "Local backups:"
ls -la backups/
echo "S3 backups:"
aws s3 ls "s3://${TERRAFORM_STATE_BUCKET}/terraform-state-backups/" 