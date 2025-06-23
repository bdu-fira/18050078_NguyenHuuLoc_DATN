#!/bin/bash

# Rename example.env to .env
cp example.env .env
cp nodejs-app/example.env nodejs-app/.env
cp dashboard/example.env dashboard/.env

# Create nodejs-data
mkdir nodejs-data
chmod 777 nodejs-data

# Stop and remove existing containers
echo "Stopping existing containers..."
docker compose down

# Build and start containers with --build flag
echo "Building and starting containers..."
docker compose up --build -d

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to be ready..."
sleep 5

# Show status
echo "Setup complete!"
echo "Node.js app is running at http://localhost:3000"
echo "MongoDB is running on port 27017"