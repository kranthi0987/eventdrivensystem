#!/bin/bash
set -e

# Configuration
S3_BUCKET="eventdrivensystem-terraform-state"
BACKUP_DIR="terraform-state-backups"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_NAME="terraform-state-backup-${TIMESTAMP}.tar.gz"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Create a backup of the state files
echo "Creating backup of Terraform state files..."
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}" terraform.tfstate terraform.tfstate.backup .terraform.tfstate.lock.info

# Upload the backup to S3
echo "Uploading backup to S3 bucket: ${S3_BUCKET}"
aws s3 cp "${BACKUP_DIR}/${BACKUP_NAME}" "s3://${S3_BUCKET}/${BACKUP_NAME}"

# Clean up local backup
echo "Cleaning up local backup files..."
rm "${BACKUP_DIR}/${BACKUP_NAME}"

echo "Backup completed successfully!"
echo "Backup file: s3://${S3_BUCKET}/${BACKUP_NAME}" 