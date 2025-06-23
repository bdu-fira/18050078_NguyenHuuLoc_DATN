#!/bin/bash

# Rename example.env to .env
cp example.env .env
cp nodejs-app/example.env nodejs-app/.env
cp dashboard/example.env dashboard/.env

# Create nodejs-data
mkdir nodejs-data
chmod 777 nodejs-data

# Show status
echo "Setup complete!"