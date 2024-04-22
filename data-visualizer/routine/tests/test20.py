import os
import subprocess
import sys
from moviepy.editor import VideoFileClip
import cv2

# temp_directory = "./temp_data"
# media_directory = "../backend/media_wp"
temp_directory = "vid_check"
media_directory = "vid_check"

haystack_file_path = "{}/haystack.hsh".format(temp_directory)

existing_hashes = set()
if os.path.exists(haystack_file_path):
    with open(haystack_file_path, 'r') as haystack_file:
        for line in haystack_file:
            try:
                file_name = line.split("filename=")[-1].strip()
                existing_hashes.add(file_name)
            except:
                print(line)
                sys.exit()

with open(haystack_file_path, 'a') as haystack_file:
    for file in os.listdir(media_directory):
        file_path = os.path.join(media_directory, file)
        if file_path.endswith(('.jpg', '.jpeg', '.png')) and file_path not in existing_hashes:
            command = f"./pdq/bin/pdq-photo-hasher-tool --details '{file_path}'"
            process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            output, error = process.communicate()
            if process.returncode == 0:
                hash_value = output.decode()
                haystack_file.write(hash_value)
                print(f"Hashed: {file_path}")
            else:
                print(f"Error hashing file: {file_path}. Error: {error.decode()}")

