import cv2
import os
from moviepy.editor import VideoFileClip
import shutil

def move_files(filepaths, destination_folder):
    if not os.path.exists(destination_folder):
        os.mkdir(destination_folder)
    for filepath in filepaths:
        if os.path.exists(filepath):
            print(filepath, destination_path)
            filename = os.path.basename(filepath)
            destination_path = os.path.join(destination_folder, filename)
            shutil.move(filepath, destination_path)

def extract_thumbnails(folder_path):
    corrupt_filenames = []
    thumbnail_path = "{}/thumbnails2".format(folder_path)
    if not os.path.exists(thumbnail_path):
        os.mkdir(thumbnail_path)

    for filename in os.listdir(folder_path):
        # Skip if the file is not a video file
        if not filename.lower().endswith((".mp4", ".avi", ".mkv")):
            continue
        
        video_path = os.path.join(folder_path, filename)
        
        try:
            # Read the video and extract metadata
            video = VideoFileClip(video_path)
            frame = video.get_frame(0)
            
            # Convert the frame from RGB to BGR
            frame_bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)

            # Save the frame as a thumbnail
            thumbnail_file = os.path.splitext(filename)[0] + ".jpg"
            thumbnail_file_path = os.path.join(thumbnail_path, thumbnail_file)
            cv2.imwrite(thumbnail_file_path, frame_bgr)
            
            # Release the video
            video.reader.close()
            if video.audio:
                video.audio.reader.close_proc()
        except Exception as e:
            print(f"Skipping {filename} due to error: {str(e)}")
            corrupt_filenames.append(filename)
            break
            continue
    move_files(corrupt_filenames, "../backend/media/corrupt_media")

# copying media
media_directory = "../backend/media"
extract_thumbnails(media_directory)
