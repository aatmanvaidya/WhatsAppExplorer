import os
import datetime

# specify the directory path
directory_path = '../../whatsappMonitor/data/'

# get a list of all directories in the specified directory path
directories = [d for d in os.listdir(directory_path) if os.path.isdir(os.path.join(directory_path, d))]

# get the latest modified directory by sorting the directories by modification time and selecting the last one
latest_modified_directory = sorted(directories, key=lambda x: os.path.getmtime(os.path.join(directory_path, x)), reverse=True)[0]

# print the name of the latest modified directory
print(latest_modified_directory)