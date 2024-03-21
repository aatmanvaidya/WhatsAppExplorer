import os

temp_directory = "./temp_data"
if not os.path.exists(temp_directory):
    os.makedirs(temp_directory)

##################################################################################################################

temp_tmk_directory = "{}/vid_tmk".format(temp_directory)
if not os.path.exists(temp_tmk_directory):
    os.makedirs(temp_tmk_directory)
    
def get_latest_file(folder_path):
    files = os.listdir(folder_path)

    # Get the full file paths and their corresponding creation timestamps
    file_paths_with_timestamps = [(os.path.join(folder_path, file), os.path.getctime(os.path.join(folder_path, file))) for file in files]

    # Sort files by creation timestamp in descending order
    sorted_files = sorted(file_paths_with_timestamps, key=lambda x: x[1], reverse=True)

    # Get the name of the last created file
    if sorted_files:
        last_created_file_path, _ = sorted_files[0]
        last_created_file_name = os.path.basename(last_created_file_path)
        return last_created_file_name
    else:
        return None

print(get_latest_file(temp_tmk_directory))