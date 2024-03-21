#!/bin/bash

# Define source and destination folders
source_folder="/mnt/storage-2tb/kg766/WhatsappMonitorData/downloaded-media"
destination_folder="../backend/media"

# Check if the destination folder exists, if not, create it
if [ ! -d "$destination_folder" ]; then
    mkdir -p "$destination_folder"
fi

# Loop through each folder in the source folder
for folder in "$source_folder"/*; do
    # Loop through each file in the current folder
    for file in "$folder"/*; do
        # Extract the file name
        file_name=$(basename "$file")
        
        # Check if the file doesn't exist in the destination folder, then create a symbolic link
        if [ ! -e "$destination_folder/$file_name" ]; then  
            ln -s "$file" "$destination_folder/$file_name" 
        fi
    done
done
