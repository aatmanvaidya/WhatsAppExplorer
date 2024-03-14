#!/bin/bash
script_dir=$(dirname "$0")
source $script_dir/run.conf
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
if [ -f "$script_dir/requirements.txt" ]; then
    pip install -r "$script_dir/requirements.txt"
else
    echo "requirements.txt file not found. Please create one with the packages you want to install."
fi

# Run streamlit app in background
streamlit run $script_dir/Home.py --server.port $PORT --server.enableCORS false --server.enableXsrfProtection false --server.baseURLPath $BASE_URL >> $script_dir/streamlit.log 2>&1 &