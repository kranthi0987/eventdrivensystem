#!/bin/bash

# Exit on error
set -e

# Configuration
ENVIRONMENT=${ENVIRONMENT:-"production"}
PROJECT_NAME=${PROJECT_NAME:-"eventdrivensystem"}

# Get Redis endpoint from AWS
echo "Getting Redis endpoint..."
REDIS_ENDPOINT=$(aws elasticache describe-cache-clusters \
  --cache-cluster-id "${ENVIRONMENT}-redis-cluster" \
  --show-cache-node-info \
  --query 'CacheClusters[0].CacheNodes[0].Endpoint.Address' \
  --output text)

REDIS_PORT=$(aws elasticache describe-cache-clusters \
  --cache-cluster-id "${ENVIRONMENT}-redis-cluster" \
  --show-cache-node-info \
  --query 'CacheClusters[0].CacheNodes[0].Endpoint.Port' \
  --output text)

if [ -z "$REDIS_ENDPOINT" ] || [ -z "$REDIS_PORT" ]; then
    echo "Error: Could not find Redis endpoint"
    exit 1
fi

echo "Redis endpoint: $REDIS_ENDPOINT:$REDIS_PORT"

# Wait for Redis to be available
echo "Waiting for Redis to be available..."
until redis-cli -h "$REDIS_ENDPOINT" -p "$REDIS_PORT" ping; do
    echo "Redis is not available yet. Waiting..."
    sleep 5
done

echo "Redis is available!"

# Set environment variables for the application
echo "Setting environment variables..."
export REDIS_HOST="$REDIS_ENDPOINT"
export REDIS_PORT="$REDIS_PORT"

# Start the application
echo "Starting the application..."
cd /var/app/current
npm start

# Keep the script running
tail -f /var/log/eb-engine.log 