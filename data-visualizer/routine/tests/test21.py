import subprocess
from moviepy.editor import VideoFileClip
import cv2
import timeout_decorator

# Example usage
folder_path = "../backend/media_wp"
file_name = 'b3819f18-d874-4b0f-a42f-5979cbdef5da.mp4'

video_path = folder_path+"/"+file_name


@timeout_decorator.timeout(10) 
def create_thumbnail():
    try:
        print("Creating Thumbnail")
        # Read the video and extract metadata
        video = VideoFileClip(video_path)
        print("---")
        frame = video.get_frame(0)
        print("---")
        
        # Convert the frame from RGB to BGR
        frame_bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        print("---")

        # Save the frame as a thumbnail
        cv2.imwrite(thumbnail_file_path, frame_bgr)
        print("---")
        
        # Release the video
        video.reader.close()
        if video.audio:
            video.audio.reader.close_proc()
        print(f"Thumbnail created")
    except Exception as e:
        print(f"Skipping thumbnail creation due to error: {str(e)}")

create_thumbnail()