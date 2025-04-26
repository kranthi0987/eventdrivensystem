#!/bin/bash

# Check if .env file exists
if [ -f .env ]; then
    echo ".env file already exists. Please remove it if you want to create a new one."
    exit 1
fi

# Copy .env.example to .env
cp .env.example .env

# Get the server IP
echo "Please enter your server IP address (or press Enter to use 0.0.0.0):"
read SERVER_IP
SERVER_IP=${SERVER_IP:-0.0.0.0}

# Update .env with server IP
sed -i "s|http://0.0.0.0|http://${SERVER_IP}|g" .env

# Generate a random JWT secret
JWT_SECRET=$(openssl rand -base64 32)
sed -i "s|your_jwt_secret_here|${JWT_SECRET}|g" .env

echo "Environment setup complete!"
echo "Please review the .env file and update any other values as needed."
echo "Do not commit the .env file to version control." 