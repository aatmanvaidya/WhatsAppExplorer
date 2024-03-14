#!/bin/bash

# Load run.conf
source run.conf

script_dir=$(dirname "$0")
# Set up python for anonymization
if ! command -v python3 &>/dev/null; then
    echo "Python 3 is not installed. Installing Python 3..."
    sudo apt update
    sudo apt-get install libgl1 
    sudo apt install python3.9
else
    echo "Python 3 is already installed."
fi

# Check if pip is already installed
if ! command -v pip3 &>/dev/null; then
    echo "pip is not installed. Installing pip..."
    sudo apt update
    sudo apt install python3-pip
else
    echo "pip is already installed."
fi

# Install packages from requirements.txt
if [ -f "$script_dir/anonymisation/requirements.txt" ]; then
    pip install -r "$script_dir/anonymisation/requirements.txt"
else
    echo "requirements.txt file not found. Please create one with the packages you want to install."
fi

# Check if pm2 wm-backend is running
pm2 list | grep wm-backend
if [ $? -eq 0 ]; then
    echo "Backend already running"
    exit 0
fi

# Google DLP Setup
echo "Setting up Google DLP"
export GOOGLE_APPLICATION_CREDENTIALS=$GCLOUD_KEY_PATH
gcloud auth activate-service-account --key-file $GCLOUD_KEY_PATH

current_date_time=$(date '+%Y-%m-%d %H:%M:%S')

echo "Installing dependencies"
npm install
echo "Starting Whatsapp Explorer API at $current_date_time"
pm2 start npm --name wm-backend -- run start --time
