#!/bin/bash

# Rename example.env to .env
cp example.env .env
cp nodejs-app/example.env nodejs-app/.env
cp dashboard/example.env dashboard/.env

# Create nodejs-data
mkdir nodejs-data
sudo chown -R 999:999 ./nodejs-data
sudo chmod -R 755 ./nodejs-data
chmod 777 nodejs-data

# Show status
echo "Setup complete!"