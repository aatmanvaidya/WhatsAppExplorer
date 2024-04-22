#!/bin/bash

source_folder="/mnt/storage/kg766/WhatsappMonitorData/archive/downloaded-media"
# source_folder="/mnt/storage/kg766/WhatsappMonitorData/downloaded-media"
destination_folder="../backend/media2"

for folder in "$source_folder"/*; do
    for file in "$folder"/*; do
        file_name=$(basename "$file")
        if [ ! -e "$destination_folder/$file_name" ]; then  
            ln -s "$file" "$destination_folder/$file_name" 2>/dev/null
            if [ $? -eq 0 ]; then
                echo "Copied: $file_name"
            else
                echo "Failed to copy: $file_name"
            fi
        else
            echo "Already exists: $file_name"
        fi
    done
done
