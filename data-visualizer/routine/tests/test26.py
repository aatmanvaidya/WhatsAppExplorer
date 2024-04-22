# import os
# import subprocess

# def run_command(command):
#     try:
#         result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True, shell=True)
#         if result.returncode != 0:  
#             print(f"Command failed with exit code {result.returncode}")
#             print(result.stderr)  
#             return result.returncode 
#         else:
#             return 0 
#     except Exception as e:
#         print(f"An error occurred: {e}")
#         return 1 
    
# # copying media along with older media
# media_directory_old = "../backend/media"
# if not os.path.exists(media_directory_old):
#     os.mkdir(media_directory_old)
    
# bash_script = """
# source_folder=/mnt/storage/kg766/WhatsappMonitorData/archive/downloaded-media
# destination_folder={}
# for folder in "$source_folder"/*; do
#     for file in "$folder"/*; do
#         file_name=$(basename "$file")
#         if [ ! -e "$destination_folder/$file_name" ]; then  
#             ln -s "$file" "$destination_folder/$file_name" 2>/dev/null
#         fi
#     done
# done
# """.format(media_directory_old)
# if run_command(bash_script) != 0:
#     print("Crashed while copying media to {}. Terminating!".format(media_directory_old))
# import pandas as pd

# def remove_duplicates(input_csv, output_csv):
#     # Read the CSV file into a pandas DataFrame
#     df = pd.read_csv(input_csv)

#     # Remove duplicates based on all columns
#     df_no_duplicates = df.drop_duplicates()

#     # Write the DataFrame without duplicates to a new CSV file
#     df_no_duplicates.to_csv(output_csv, index=False)

# # Example usage:
# input_file = './temp_data/nude_probability.csv'
# output_file = './temp_data/nude_probability2.csv'
# remove_duplicates(input_file, output_file)

import os

def count_files_with_extensions(folder_path, extensions):
    count = 0
    for file in os.listdir(folder_path):
        if file.lower().endswith(extensions):
            count += 1
    return count

current_folder = "../backend/media_wp/thumbnails"
image_extensions = ('.jpg', '.jpeg', '.png')

jpg_count = count_files_with_extensions(current_folder, '.jpg')
jpeg_count = count_files_with_extensions(current_folder, '.jpeg')
png_count = count_files_with_extensions(current_folder, '.png')

print(f"Number of JPG files: {jpg_count}")
print(f"Number of JPEG files: {jpeg_count}")
print(f"Number of PNG files: {png_count}")

t = jpg_count+jpeg_count+png_count

print(t)
423709+60321