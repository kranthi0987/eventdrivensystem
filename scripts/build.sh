#!/bin/bash

# Build all TypeScript projects
cd shared/auth && npm run build
pwd
cd ../../
for app in apps/*; do
    if [ -f "$app/tsconfig.json" ]; then
        echo "Building $app"
        cd $app
        npm run build
        cd ../..
    fi
done

echo "✅ Build completed successfully!"