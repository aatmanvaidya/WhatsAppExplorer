import os
import csv
from nudenet import NudeClassifier

def detect_nude(folder_path, nude_probability_map={}):
    thumbnail_path = "{}/thumbnails".format(folder_path)
    
    # Directories to search for media files
    media_directories = [folder_path, thumbnail_path]

    classifier = NudeClassifier()

    csv_file_path = "./temp_data/nude_probability.csv"
    csv_file_check = os.path.exists(csv_file_path)

    # Load existing data from the CSV file into a map
    if csv_file_check:
        with open(csv_file_path, 'r') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                nude_probability_map[row['file']] = float(row['nude_probability'])

    try:
        with open(csv_file_path, 'a', newline='') as csvfile:
            fieldnames = ['file', 'nude_probability']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

            if not csv_file_check:
                writer.writeheader()

            for media_directory in media_directories:
                try:
                    for filename in os.listdir(media_directory):
                        if filename.lower().endswith(('.png', '.jpg', '.jpeg')) and filename not in nude_probability_map:
                            file_path = os.path.join(media_directory, filename)
                            try:
                                curr_nude_prob = classifier.classify(file_path)[file_path]["unsafe"]
                                nude_probability_map[filename] = curr_nude_prob
                                writer.writerow({'file': filename, 'nude_probability': curr_nude_prob})
                                print(f"Nude detect done for: {filename}")
                            except Exception as e:
                                print(f"Error processing file {filename} for nude detection: {e}")
                except OSError as e:
                    print(f"Error reading media directory {media_directory}: {e}")
                    return 1
    except OSError as e:
        print(f"Error writing to CSV file: {e}")
        return 1

media_directory = "../backend/media_wp/"
nude_probability_map = {}
print(detect_nude(media_directory, nude_probability_map))