#!/bin/bash

# Exit on error and show commands
set -ex

# 1. Clean existing node_modules and dist folders
echo "🧹 Cleaning up existing directories..."
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
find . -name "dist" -type d -prune -exec rm -rf '{}' +

# 2. Install Node.js if not exists
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 3. Create shared node_modules directory
echo "🔗 Setting up shared node_modules..."
mkdir -p shared/node_modules

# 4. Install root dependencies (without triggering the install script again)
echo "📦 Installing root dependencies..."
npm install --ignore-scripts

# 5. Install shared auth module
if [ -d "shared/auth" ]; then
    echo "📦 Installing shared auth module..."
    cd shared/auth
    npm install --ignore-scripts
    cd ../..
fi

# 6. Install app dependencies
echo "📦 Installing app dependencies..."
for app in apps/*; do
    [ -e "$app" ] || continue  # Handle empty dir case

    echo "⚙️ Processing $app..."
    cd "$app"

    # Remove existing node_modules if exists
    rm -rf node_modules 2>/dev/null || true

    # Create relative symlink to shared node_modules
    ln -sf ../../shared/node_modules node_modules

    # Install without triggering scripts
    npm install --ignore-scripts

    cd ../..
done

echo "✅ Installation completed successfully!"