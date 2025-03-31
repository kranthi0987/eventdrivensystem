#!/usr/bin/env bash

# Exit immediately if any command fails
set -e

# Function to safely clean directory
clean_directory() {
  local dir="$1"
  if [[ -d "${dir}/node_modules" ]]; then
    if [[ -L "${dir}/node_modules" ]]; then
      echo "🔗 Unlinking symlinked node_modules in ${dir}"
      rm "${dir}/node_modules"
    else
      echo "🧹 Removing node_modules in ${dir}"
      rm -rf "${dir}/node_modules"
    fi
  fi
}

main() {
  echo "🚀 Starting clean up process..."

  # Get the absolute path to the script
  local SCRIPT_DIR
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

  # Try to find project root by looking for either apps/ or src/apps/
  local ROOT_DIR
  if [[ -d "${SCRIPT_DIR}/../../apps" ]]; then
    ROOT_DIR="${SCRIPT_DIR}/../.."
  elif [[ -d "${SCRIPT_DIR}/../../src/apps" ]]; then
    ROOT_DIR="${SCRIPT_DIR}/../../src"
  else
    echo "❌ Error: Couldn't find apps directory." >&2
    echo "💡 Try running this from your project root directory" >&2
    echo "   Expected to find either: /apps or /src/apps" >&2
    exit 1
  fi

  echo "✔ Found project root at: ${ROOT_DIR}"

  # Clean directories
  clean_directory "${ROOT_DIR}"

  # Clean shared if exists
  if [[ -d "${ROOT_DIR}/shared" ]]; then
    clean_directory "${ROOT_DIR}/shared"
  fi

  # Clean apps
  local APPS_DIR="${ROOT_DIR}/apps"
  if [[ ! -d "${APPS_DIR}" ]]; then
    APPS_DIR="${ROOT_DIR}/src/apps"
  fi

  if [[ -d "${APPS_DIR}" ]]; then
    for app_dir in "${APPS_DIR}"/*; do
      clean_directory "${app_dir}"
    done
  fi

  echo "✅ Clean up complete!"
}

main "$@"