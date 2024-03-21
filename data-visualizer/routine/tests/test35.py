import os
import csv

# Path to the folder containing the files
media_directory = "../backend/media_wp"
temp_directory = './temp_data'
temp_tmk_directory = "{}/vid_tmk".format(temp_directory)
thumbnail_path = "{}/thumbnails".format(media_directory)

# Initialize sets for image and video filenames
image_files = set()
video_files = set()

# Loop through all files in the folder
for file_name in os.listdir(media_directory):
    # Get lowercase file extension
    file_extension = os.path.splitext(file_name)[1].lower()
    # Check if the file has a JPEG, JPG, or PNG extension
    if file_extension in ('.jpeg', '.jpg', '.png'):
        image_files.add(file_name)
    # Check if the file has an MP4 extension
    elif file_extension in ('.mp4', '.avi', '.mkv'):
        video_files.add(file_name)


# Print the sets of image and video filenames
print("Image Files:", len(image_files))
print("Video Files:", len(video_files))


haystack_file_path = "{}/haystack.hsh".format(temp_directory)

hashed_image_files = set()
if os.path.exists(haystack_file_path):
    with open(haystack_file_path, 'r') as haystack_file:
        for line in haystack_file:
            try:
                file_name = line.split("filename=")[-1].strip()
                hashed_image_files.add(os.path.basename(file_name))
            except:
                print("Error while reading {}: {}".format(haystack_file_path, line))
                # return False
            
print("Hashed image files:",len(hashed_image_files))

unhashed_image_files = image_files.difference(hashed_image_files)
print("Unhashed image files:",len(unhashed_image_files))

hashed_video_files_no_ext = set()
for file_name in os.listdir(temp_tmk_directory):
    file_extension = os.path.splitext(file_name)[1].lower()
    if file_extension == '.tmk':
        hashed_video_files_no_ext.add(os.path.splitext(file_name)[0])

print("Hashed video files:",len(hashed_video_files_no_ext))

unhashed_video_files = set()

video_files_no_ext = {os.path.splitext(file_name)[0] for file_name in video_files}

# Find unhashed_video_files by taking the set difference
unhashed_video_files_no_ext = video_files_no_ext.difference(hashed_video_files_no_ext)

# Restore filenames with their original extensions
for filename_no_ext in unhashed_video_files_no_ext:
    for ext in ['.mp4', '.avi', '.mkv']:  # You can extend this list for other possible video extensions
        file_with_ext = filename_no_ext + ext
        if file_with_ext in video_files:
            unhashed_video_files.add(file_with_ext)
            break

# Print the set of unhashed video files
print("Unhashed Video Files:", len(unhashed_video_files))

existing_thumbnail_files_no_ext = set()
for file_name in os.listdir(thumbnail_path):
    file_extension = os.path.splitext(file_name)[1].lower()
    if file_extension == '.jpg':
        existing_thumbnail_files_no_ext.add(os.path.splitext(file_name)[0])

print("Existing Thumbnail Files:", len(existing_thumbnail_files_no_ext))

remaining_thumbnail_files_no_ext = video_files_no_ext.difference(existing_thumbnail_files_no_ext)

remaining_thumbnail_files = set()

for filename_no_ext in remaining_thumbnail_files_no_ext:
    for ext in ['.mp4', '.avi', '.mkv']:  # You can extend this list for other possible video extensions
        file_with_ext = filename_no_ext + ext
        if file_with_ext in video_files:
            remaining_thumbnail_files.add(file_with_ext)
            break

print("Remaining Thumbnail Files:", len(remaining_thumbnail_files))

# after thumbnail calculation
thumbnail_files = set()
for file_name in os.listdir(thumbnail_path):
    file_extension = os.path.splitext(file_name)[1].lower()
    if file_extension == '.jpg':
        thumbnail_files.add(file_name)

combined_image_files = image_files.union(thumbnail_files)
print("Image + Thumbnail Files:", len(combined_image_files))

existing_nude_files = set()

csv_file_path = "./temp_data/nude_probability.csv"
csv_file_check = os.path.exists(csv_file_path)

# Load existing data from the CSV file into a map
if csv_file_check:
    with open(csv_file_path, 'r') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            existing_nude_files.add(row['file'])
            # nude_probability_map[row['file']] = float(row['nude_probability'])

remaining_nude_files = combined_image_files.difference(existing_nude_files)
print("Existing Nude Files:", len(existing_nude_files))
print("Remaining Nude Files:", len(remaining_nude_files))

