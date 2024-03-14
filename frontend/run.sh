#!/bin/bash

current_date_time=$(date '+%Y-%m-%d %H:%M:%S')

# Check if pm2 wm-frontend is running
pm2 list | grep wm-frontend
if [ $? -eq 0 ]; then
    echo "Frontend already running"
    exit 0
fi

echo "Installing dependencies"
npm install
echo "Starting Whatsapp Explorer Client at $current_date_time"
pm2 start npm --name wm-frontend -- run start --time
