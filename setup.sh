#!/bin/bash

# Rename example.env to .env
# cp example.env .env
# cp nodejs-app/example.env nodejs-app/.env
# cp dashboard/example.env dashboard/.env

# Create nodejs-data
mkdir nodejs-data
mkdir nodejs-data/mongodb

sudo chown -R 999:999 ./nodejs-data
sudo chown -R 999:999 ./nodejs-data/mongodb
sudo chmod -R 755 ./nodejs-data
sudo chmod -R 755 ./nodejs-data/mongodb
chmod 777 ./nodejs-data
chmod 777 ./nodejs-data/mongodb

# Show status
echo "Setup complete!"