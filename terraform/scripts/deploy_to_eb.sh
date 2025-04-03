#!/bin/bash
set -e

# Configuration
APP_NAME="eventdrivensystem"
ENV_NAME="eventdrivensystem-production"
REGION="ap-south-1"
VERSION_LABEL="v$(date +"%Y%m%d-%H%M%S")"
ZIP_FILE="deploy.zip"

# Ensure we're in the project root directory
cd "$(dirname "$0")/../.."

# Create a deployment package
echo "Creating deployment package..."
zip -r "${ZIP_FILE}" . -x "*.git*" "node_modules/*" "terraform/*" "*.zip"

# Create a new application version
echo "Creating new application version: ${VERSION_LABEL}"
aws elasticbeanstalk create-application-version \
  --application-name "${APP_NAME}" \
  --version-label "${VERSION_LABEL}" \
  --source-bundle "S3Bucket=eventdrivensystem-terraform-state,S3Key=${ZIP_FILE}" \
  --region "${REGION}"

# Upload the deployment package to S3
echo "Uploading deployment package to S3..."
aws s3 cp "${ZIP_FILE}" "s3://eventdrivensystem-terraform-state/${ZIP_FILE}"

# Deploy the new version to the environment
echo "Deploying to Elastic Beanstalk environment: ${ENV_NAME}"
aws elasticbeanstalk update-environment \
  --environment-name "${ENV_NAME}" \
  --version-label "${VERSION_LABEL}" \
  --region "${REGION}"

# Clean up
echo "Cleaning up deployment package..."
rm "${ZIP_FILE}"

echo "Deployment initiated successfully!"
echo "You can monitor the deployment status with:"
echo "aws elasticbeanstalk describe-environments --environment-names ${ENV_NAME} --query 'Environments[0].Status' --output text" 