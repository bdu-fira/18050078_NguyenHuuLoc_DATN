#!/bin/bash

# Stop and remove existing containers
echo "Stopping existing containers..."
docker compose down

# Build and start containers with --build flag
echo "Building and starting containers..."
docker compose up --build -d

# Show status
echo "All services are running!"