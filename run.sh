#!/bin/bash

# Load run.conf
source run.conf

# Get current dir
curPath=$(pwd)
current_date=$(date '+%Y-%m-%d')
logPath="$curPath/$current_date.log"
# Create logs file
touch $logPath

cd $HOME

sudo apt install libcups2 libnss3-dev librust-atk-sys-dev libatk-bridge2.0-dev librust-gtk-sys-dev --assume-yes

# Install nvm
# Get nvm path
export NVM_DIR="$HOME/.nvm"
# Check if nvm.sh exists in NVM_DIR
if [ -s "$NVM_DIR/nvm.sh" ]; then
    echo "nvm already installed"
else
    echo "Installing nvm"
    wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
fi

# Load nvm
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
# Install node 18.16.0
nvm ls | grep 18.16.0
if [ $? -eq 0 ]; then
    echo "Node 18.16.0 already installed"
else
    echo "Installing node 18.16.0"
    nvm install 18.16.0
fi
nvm use 18.16.0
clear

# Install pm2
# Check if pm2 is installed
pm2 --version
if [ $? -eq 0 ]; then
    echo "pm2 already installed"
else
    echo "Installing pm2"
    npm install pm2 -g
fi
# Install mongodb
# Check if mongodb is installed
mongod --version
if [ $? -eq 0 ]; then
    echo "MongoDB already installed"
else
    echo "Installing MongoDB"
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | gpg --dearmor | sudo tee /usr/share/keyrings/mongodb.gpg >/dev/null
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    sudo apt update
    sudo apt install mongodb-org --assume-yes

    # Start mongodb
    sudo systemctl start mongod
    sudo systemctl enable mongod
fi
clear


# Install gcloud
export GCLOUD_DIR="$HOME/gcloud/google-cloud-sdk"
# Check if gcloud is installed
if [ -s "$GCLOUD_DIR/path.bash.inc" ]; then
    echo "gcloud already installed"
else
    echo "Installing gcloud"
    # Install gcloud
    mkdir -p $HOME/gcloud
    cd $HOME/gcloud
    curl https://sdk.cloud.google.com > install.sh
    bash install.sh --disable-prompts --install-dir=$HOME/gcloud

    # Load gcloud
    [ -s "$GCLOUD_DIR/path.bash.inc" ] && \. "$GCLOUD_DIR/path.bash.inc"
    clear
fi

# Start the API
echo "Starting the Backend"
cd $curPath
cd $BACKEND_FOLDER
bash ./run.sh >> $logPath 2>&1
echo "Backend started"

# Start the Frontend
echo "Starting the Frontend"
cd $curPath
cd $FRONTEND_FOLDER
bash ./run.sh >> $logPath 2>&1
echo "Frontend started"

cd ..

# Start the Downloader service by adding to cron
cd $curPath
cd $DOWNLOADER_FOLDER
npm install
# Add running run.sh to cron
# Check if cronjob is already added
crontab -l | grep "downloadTool"
if [ $? -eq 0 ]; then
    echo "Downloader already added"
else
    echo "Starting the Downloader"
    (crontab -l 2>/dev/null; echo "$DOWNLOADER_TIME cd $curPath/downloadTool && bash ./run.sh >> $curPath/downloadTool/runlogs.log 2>&1") | crontab -
fi

# Start the dashboard
echo "Starting the Dashboard"
cd $curPath
cd $DASHBOARD_FOLDER
bash ./run.sh >> $logPath 2>&1
echo "Dashboard started"