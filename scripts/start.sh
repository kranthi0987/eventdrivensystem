#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$SCRIPT_DIR/.."

# Start all services in parallel
(
  cd "$ROOT_DIR/apps/source-app" || { echo "Failed to cd to source-app"; exit 1; }
  npm start
) &

(
  cd "$ROOT_DIR/apps/bridge-service" || { echo "Failed to cd to bridge-service"; exit 1; }
  npm start
) &

(
  cd "$ROOT_DIR/apps/target-app" || { echo "Failed to cd to target-app"; exit 1; }
  npm start
) &
(
  cd "$ROOT_DIR/apps/event-monitor" || { echo "Failed to cd to target-app"; exit 1; }
  npm start
)

# Wait for all background processes to complete
wait

echo "✅ All services started"
