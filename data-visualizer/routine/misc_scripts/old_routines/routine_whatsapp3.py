import subprocess 
import glob
import cv2
import os
import csv
import re
import json
from urlextract import URLExtract
import validators
import datetime
import itertools
from text_clusterer import get_clusters
from langdetect import detect, LangDetectException
import pymongo
from moviepy.editor import VideoFileClip
from gridfs import GridFS
from gridfs.errors import NoFile
from collections import defaultdict
import requests
import timeout_decorator
from nudenet import NudeClassifier
import uuid
import redis
import time

pattern = r'[^\w\s]|[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF]'

time_log = {}

os.chdir("/home/kg766/dataVisualiser/routine")

def send_notification(message):
    telegram_token = '6499270319:AAFOd6wDr7GqciizSKAb1lFi_QyIm3-z1js'

    api_url = f'https://api.telegram.org/bot{telegram_token}/sendMessage'
    params = {
        'chat_id': '-4068837293',
        'text': message
    }

    response = requests.post(api_url, data=params)
    return response.json()

def is_url(string):
    if validators.url(string):
        return True
    else:
        return False

def run_command(command):
    try:
        result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True, shell=True)
        if result.returncode != 0:  
            print(f"Command failed with exit code {result.returncode}")
            print(result.stderr)  
            return result.returncode 
        else:
            return 0 
    except Exception as e:
        print(f"An error occurred: {e}")
        return 1 

def replace_unencodable_characters(text):
    replaced_text = ""
    
    for char in text:
        try:
            char.encode('utf-8')
            replaced_text += char
        except UnicodeEncodeError:
            replaced_text += '�'
    
    return replaced_text
    
with open('exceptions.json', 'r') as f:
    # Load the data from the file using the json module
    group_exceptions = json.load(f)

def check_explicit_content_chatname(chatname, nude_probability_map, image_name):
    explicit_content = ["RDX group💣🔪🚬", "जनसु की मड़ैया 18+"]
    if chatname == "RDX group💣🔪🚬":
        return True
    elif chatname == "जनसु की मड़ैया 18+":
        if image_name in nude_probability_map and nude_probability_map[image_name] > 0.8:
            return True
    return False
    # return (chatname in explicit_content)

def check_grouped_section(section):
    section_group_map = {
        "wsurveyor1": "up_data_collection",
        "wsurveyor2": "up_data_collection",
        "wsurveyor3": "up_data_collection",
        "wsurveyor4": "up_data_collection",
        "wsurveyor5": "up_data_collection",
        "wsurveyor6": "up_data_collection",
        "ved": "up_data_collection",
        "samantha_stanley@brown.edu": "brown",
        "stefanie_friedhoff@brown.edu": "brown",
        "Claire_Wardle@brown.edu": "brown",
        "ruth_crane@brown.edu": "brown",
        "max": "brown",
        "brazil1": "brazil",
        "brazil2": "brazil",
        "brazil3": "brazil",
        "brazil4": "brazil",
        "brazil5": "brazil",
        "brazil6": "brazil",
        "brazil7": "brazil",
        "brazil8": "brazil",
        "brazil9": "brazil",
        "brazil10": "brazil",
        "brazil11": "brazil",
        "brazil12": "brazil",
        "brazil13": "brazil",
        "brazil14": "brazil",
        "brazil15": "brazil",
        "brazil16": "brazil",
        "brazil17": "brazil",
        "brazil18": "brazil",
        "brazil19": "brazil",
        "brazil20": "brazil",
        "juan": "colombia",
        "princessa": "indonesia",
    }
    if section in section_group_map.keys():
        return section_group_map[section]
    return section

def compute_video_clusters():
    if not os.path.exists("/home/kg766/dataVisualiser/routine/temp_data/vid_tmk"):
        os.makedirs("/home/kg766/dataVisualiser/routine/temp_data/vid_tmk")
    os.chdir("/home/kg766/dataVisualiser/routine/temp_data/vid_tmk")
    
    cluster_file = "../vidstack.clu"

    command = "ls | ../../tmk/cpp/tmk-clusterize --c1 0.9 --c2 0.9 -s -i > {}".format(cluster_file)
    if run_command(command) != 0:
        print("Video clustering failed. Terminating")
        return 1
        
    print("Videos clustered successfully")
    
    os.chdir("/home/kg766/dataVisualiser/routine")
    
    return 0

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
    return 0
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
    return 0
import redis
import json

def get_redis_connection(db=0):
    redis_host = "localhost"
    redis_port = 6379
    redis_password = "" 

    try:
        connection = redis.StrictRedis(
            host=redis_host,
            port=redis_port,
            password=redis_password,
            decode_responses=True,
            db=db
        )
        connection.ping()  # Check if the connection is alive
        return connection
    except redis.exceptions.ConnectionError as e:
        print(f"Error: Unable to connect to Redis - {e}")
        return None
    
def get_file_data_from_redis(redis_conn, key):
    try:
        key_without_extension = os.path.splitext(key)[0]
        json_string = redis_conn.get(key_without_extension)
        if json_string:
            data = json.loads(json_string)
            return data.get("FileData")
        else:
            return ""
    except Exception as e:
        print(f"Error: {e}")
        return ""
    
def get_file_data_from_redis_video(redis_conn, key):
    try:
        key_without_extension = os.path.splitext(key)[0]
        json_string = redis_conn.get(key_without_extension)
        if json_string:
            data = json.loads(json_string)
            file_data = data.get("FileData")

            # Check if file_data is an array of strings
            if isinstance(file_data, list) and all(isinstance(item, str) for item in file_data):
                return " ".join(file_data)
            else:
                print("Invalid format or no data found for FileData")
                return ""
        else:
            return ""
    except Exception as e:
        print(f"Error: {e}")
        return ""
    
def whatsapp():
    
    ##################################################################################################################
    
    redis_conn = get_redis_connection()
    if redis_conn is None:
        return False
    
    redis_conn_2 = get_redis_connection(db=1)
    if redis_conn_2 is None:
        return False
    
    ##################################################################################################################
    
    yesterday_date = (datetime.datetime.utcnow() - datetime.timedelta(days=6)).replace(hour=0, minute=0, second=0, microsecond=0)
    
    # get participant names
    client = pymongo.MongoClient("mongodb://localhost:27017/")
    db = client["whatsappLogs"]
    participants_collection = db["participants"]
    participants = participants_collection.find()

    participant_map = {}
    for participant in participants:
        participant_map[participant["name"]] = participant["addedByName"]
    print(participant_map)

    ##################################################################################################################
    
    corrupt_videos = set()
    corrupt_images = set()
    
    @timeout_decorator.timeout(2)  # 2 seconds timeout
    def create_thumbnail(video_path, thumbnail_file_path):
        try:
            # Read the video and extract metadata
            video = VideoFileClip(video_path)
            frame = video.get_frame(0)
            
            # Convert the frame from RGB to BGR
            frame_bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)

            # Save the frame as a thumbnail
            cv2.imwrite(thumbnail_file_path, frame_bgr)

            # Release the video
            video.reader.close()
            if video.audio:
                video.audio.reader.close_proc()
            print(f"Thumbnail created: {video_path}")
            return True
        except Exception as e:
            print(f"Skipping thumbnail creation of {video_path} due to error: {str(e)}")
            return False

    def extract_thumbnails(folder_path):
        thumbnail_path = "{}/thumbnails".format(folder_path)
        if not os.path.exists(thumbnail_path):
            os.mkdir(thumbnail_path)

        for filename in os.listdir(folder_path):
            # Skip if the file is not a video file
            if not filename.lower().endswith((".mp4", ".avi", ".mkv")):
                continue
            
            video_path = os.path.join(folder_path, filename)
            thumbnail_file = os.path.splitext(filename)[0] + ".jpg"
            thumbnail_file_path = os.path.join(thumbnail_path, thumbnail_file)
            
            # Check if the thumbnail file already exists, and if it does, skip it
            if os.path.exists(thumbnail_file_path):
                # print(f"Thumbnail already exists for {filename}. Skipping.")
                continue
            
            try:
                if not create_thumbnail(video_path, thumbnail_file_path):
                    corrupt_videos.add(filename)
            except timeout_decorator.TimeoutError:
                print(f"Skipping thumbnail creation for {video_path}. Timed out after 2 seconds.")
                corrupt_videos.add(filename)
                continue

    ##################################################################################################################

    # # copying media along with older media
    # media_directory_old = "../backend/media"
    # if not os.path.exists(media_directory_old):
    #     os.mkdir(media_directory_old)
        
    # bash_script = """
    # source_folder=/mnt/storage/kg766/WhatsappMonitorData/downloaded-media
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
    #     return False
    
    # # copying media 
    # media_directory = "../backend/media_wp"
    # if not os.path.exists(media_directory):
    #     os.mkdir(media_directory)
        
    # bash_script = """
    # source_folder=/mnt/storage/kg766/WhatsappMonitorData/downloaded-media
    # destination_folder={}
    # for folder in "$source_folder"/*; do
    #     for file in "$folder"/*; do
    #         file_name=$(basename "$file")
    #         if [ ! -e "$destination_folder/$file_name" ]; then  
    #             ln -s "$file" "$destination_folder/$file_name" 2>/dev/null
    #         fi
    #     done
    # done
    # """.format(media_directory)
    # if run_command(bash_script) != 0:
    #     print("Crashed while copying media to {}. Terminating!".format(media_directory))
    #     return False
    
    start_time = time.time()
    
    # copying media along with older media
    media_directory_old = "../backend/media"
    if not os.path.exists(media_directory_old):
        os.mkdir(media_directory_old)
        
    bash_script = """
    source_folder=/mnt/storage-2tb/kg766/WhatsappMonitorData/downloaded-media
    destination_folder={}
    for folder in "$source_folder"/*; do
        for file in "$folder"/*; do
            file_name=$(basename "$file")
            if [ ! -e "$destination_folder/$file_name" ]; then  
                ln -s "$file" "$destination_folder/$file_name" 2>/dev/null
            fi
        done
    done
    """.format(media_directory_old)
    # run_command(bash_script)
    # if run_command(bash_script) != 0:
    #     print("Crashed while copying media to {}. Terminating!".format(media_directory_old))
    #     return False
    
    # copying media 
    media_directory = "../backend/media_wp"
    if not os.path.exists(media_directory):
        os.mkdir(media_directory)
        
    bash_script = """
    source_folder=/mnt/storage-2tb/kg766/WhatsappMonitorData/downloaded-media
    destination_folder={}
    for folder in "$source_folder"/*; do
        for file in "$folder"/*; do
            file_name=$(basename "$file")
            if [ ! -e "$destination_folder/$file_name" ]; then  
                ln -s "$file" "$destination_folder/$file_name" 2>/dev/null
            fi
        done
    done
    """.format(media_directory)
    # run_command(bash_script) 
    # if run_command(bash_script) != 0:
    #     print("Crashed while copying media to {}. Terminating!".format(media_directory))
    #     return False
    
    time_log["simlink creation"] = time.time() - start_time
     
    ##################################################################################################################
    
    start_time = time.time()
    
    # extract_thumbnails(media_directory)
    
    time_log["thumbnail extraction"] = time.time() - start_time
    
    print("Corrupt videos: ", corrupt_videos)
    
    ##################################################################################################################
    
    start_time = time.time()
    
    print("Detecting nudes....")
    nude_probability_map = {}
    
    if detect_nude(media_directory, nude_probability_map) != 0:
        print("Crashed while running nude detection. Terminating!")
        return False
    
    print("Nude detection completed.")
    
    time_log["nude detection"] = time.time() - start_time
    
    ##################################################################################################################
    
    temp_directory = "./temp_data"
    if not os.path.exists(temp_directory):
        os.makedirs(temp_directory)

    ##################################################################################################################

    start_time = time.time()

    temp_tmk_directory = "{}/vid_tmk".format(temp_directory)
    if not os.path.exists(temp_tmk_directory):
        os.makedirs(temp_tmk_directory)
    
    print("Computing Video Hashes...")
    
    # # delete latest created file, just to avoid any corruption issue
    # last_created_tmk_file = get_latest_file(temp_tmk_directory)
    # if last_created_tmk_file is not None:
    #     tmk_file = os.path.join(temp_tmk_directory, last_created_tmk_file)
    #     if os.path.exists(tmk_file):
    #         os.remove(tmk_file)
    #         print(f"Deleted last created hash file: {tmk_file}")
    
    # for v in os.listdir(media_directory):
    #     if v.endswith('.mp4'):
    #         video_file = os.path.join(media_directory, v)
    #         tmk_file = os.path.join(temp_tmk_directory, v.replace('.mp4', '.tmk'))
            
    #         # check if tmk file for corrupt video exists, and if so delete it
    #         if v in corrupt_videos:
    #             if os.path.exists(tmk_file):
    #                 os.remove(tmk_file)
    #             print(f"Skipping hash creation for corrupt video: {tmk_file}")
    #             continue
        
    #         # Check if the .tmk file already exists
    #         if not os.path.exists(tmk_file):
    #             command = f"./tmk/cpp/tmk-hash-video -f /usr/bin/ffmpeg -i {video_file} -d {temp_tmk_directory}"
                
    #             response = run_command(command)
                
    #             # Check if the created .tmk file is empty
    #             if response != 0 or os.path.getsize(tmk_file) == 0:
    #                 print("Retrying...")
    #                 # If empty, try creating it once more
    #                 response = run_command(command)
    #                 # Check again if the file is empty after recreating it
    #                 if response != 0 or os.path.getsize(tmk_file) == 0:
    #                     # If still empty, delete the file
    #                     if os.path.exists(tmk_file):
    #                         os.remove(tmk_file)
    #                     print(f"Error creating hash: {tmk_file}")
                        
    print("Hashed all videos, running clusterisation")
    
    time_log["video hashing"] = time.time() - start_time
    
    ##################################################################################################################

    start_time = time.time()

    # response = compute_video_clusters()
    
    # if response != 0:
    #     print(f"Error creating video cluster. Terminating!")
    #     return False
        
    print("Computed Video Clusters")
    
    time_log["video clustering"] = time.time() - start_time
    
    ##################################################################################################################

    start_time = time.time()

    # store video cluster map
    print("Mapping video clusters to common video...")
    video_map = {}
    with open("{}/vidstack.clu".format(temp_directory)) as csvfile:
        spamreader = csv.reader(csvfile)
        cnt = 1
        tmp = []
        for row in spamreader:
            if len(row)==0:
                continue
            clid = int(row[0].split('=')[1])
            clusz = int(row[1].split('=')[1])
            name = (row[2].split('=')[1].split('/')[-1])[:-3]+"mp4"
            tmp.append(name)
            name2 = name[:11]+name[18:] # fix to remove id from between
            tmp.append(name2)
            if clusz == cnt:
                for nm in tmp:
                    video_map[nm] = name
                tmp.clear()
                cnt = 1
            else:
                cnt+=1

    print("Video mapping done")
    
    time_log["video mapping"] = time.time() - start_time
    
    ##################################################################################################################

    start_time = time.time()

    # compute photo clusters

    print("Computing Image Hashes...")
    
    # haystack_file_path = "{}/haystack.hsh".format(temp_directory)

    # existing_hashes = set()
    # if os.path.exists(haystack_file_path):
    #     with open(haystack_file_path, 'r') as haystack_file:
    #         for line in haystack_file:
    #             try:
    #                 file_name = line.split("filename=")[-1].strip()
    #                 existing_hashes.add(file_name)
    #             except:
    #                 print("Error while reading {}: {}".format(haystack_file_path, line))
    #                 return False

    # with open(haystack_file_path, 'a') as haystack_file:
    #     for file in os.listdir(media_directory):
    #         file_path = os.path.join(media_directory, file)
    #         if file_path.endswith(('.jpg', '.jpeg', '.png')) and file_path not in existing_hashes:
    #             command = f"./pdq/bin/pdq-photo-hasher-tool --details '{file_path}'"
    #             process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    #             output, error = process.communicate()
    #             if process.returncode == 0:
    #                 hash_value = output.decode()
    #                 haystack_file.write(hash_value)
    #                 print(f"Hashed: {file_path}")
    #             else:
    #                 print(f"Error hashing file: {file_path}. Error: {error.decode()}")
    #                 corrupt_images.add(file)
    
    print("Computed Image Hashes. Running Clusterisation...")
        
    time_log["image hashing"] = time.time() - start_time

    start_time = time.time()

    # response = run_command("./pdq/bin/clusterize256-tool -d 63 {}/haystack.hsh > {}/haystack.clu".format(temp_directory, temp_directory))
    # if response != 0:
    #     print("Image Cluster Crashed. Terminating!")
    #     return False
        
    # print("Computed Image Clusters")
            
    time_log["image clustering"] = time.time() - start_time
    
    print("Corrupt images: ", corrupt_images)

    ##################################################################################################################

    start_time = time.time()

    # store image cluster map
    print("Mapping image clusters to common image...")
    
    pattern = re.compile(r'clidx=(\d+).*filename=(.+)')
    file_clusters = {}
    with open('temp_data/output.txt', 'r') as file:
        for line in file:
            match = pattern.search(line)
            if match:
                clidx = match.group(1)
                filename_basename = os.path.basename(match.group(2))
                file_clusters.setdefault(clidx, []).append(filename_basename)

    image_map = {}
    for clidx, filenames in file_clusters.items():
        head_filename = filenames[0] 
        for filename in filenames:
            image_map[filename] = head_filename
            alt_filename = filename[:11]+filename[18:]
            image_map[alt_filename] = head_filename

    del file_clusters
    
    print("Image mapping done")

    time_log["image mapping"] = time.time() - start_time
    
    ##################################################################################################################

    # init
    extractor = URLExtract()
    data = {"text_msg": {}, "video": {}, "image": {}, "link": {}}
    tmp_data = {"text_msg": {}} # for storing temporary message data

    def get_urls(body):
        urls = []
        if body is not None:
            all_tmp_urls = extractor.find_urls(body.replace("\\n", " "))
            for url_content in all_tmp_urls:
                # remove trailing backslash
                url_content = url_content.rstrip("/").rstrip("\\").rstrip("/").rstrip(",").rstrip("*").lstrip("*")
                # fix http if missing
                url_content = url_content if "://" in url_content else "http://" + url_content
                # check for valid format
                if not ("itms-apps://" not in url_content and not validators.url(url_content)):
                    urls.append(url_content)
        # print(urls)
        return urls

    # read messages file
    print("Reading Messages Database")
    messages_list = {}
    tmp_users = []

    messages_collection = db['messages']
    gridfs = GridFS(db, collection='largeFiles')

    messages = messages_collection.find()
    
    start_time = time.time()
    
    # debug_cnt = 0
    position = 0
            
    for messages_row in messages:
        try:
            if messages_row["messages"]['length'] > 0:
                file_object = gridfs.find_one({'filename': messages_row['messages']['filename']})
                content = file_object.read().decode('utf-8')
                messages_row['messages'] = json.loads(content)
        except:
            continue
        
        for message in messages_row["messages"]:
            # debug_cnt+=1
            # if debug_cnt > 1000:
            #     break
            # temporary fix to store data from new people
            if messages_row["userName"] not in participant_map:
                participant_map[messages_row["userName"]] = "test" # future fix
                tmp_users.append(messages_row["userName"])
                # continue
            section = check_grouped_section(participant_map[messages_row["userName"]])

            if "whatsapp" in group_exceptions:
                if section in group_exceptions["whatsapp"]:
                    if messages_row["chatName"] in group_exceptions["whatsapp"][section]:
                        continue

            if "author" not in message:
                continue

            metadata = {
                "from": message["author"],
                "to": message["to"] if "to" in message else "",
                "timestamp": {"$date": datetime.datetime.fromtimestamp(message["timestamp"]).strftime("%Y-%m-%dT%H:%M:%S.000Z")},
                "chatname": messages_row["chatName"],
                "forwardingScore": message["forwardingScore"],
                "captionOf": "__NONE__",
            }
            
            if "msg_id" in message.keys():
                metadata["msg_id"] = message["msg_id"]
            else:
                metadata["msg_id"] = message["id"]["_serialized"]
            
            # # skip 1 day of messages just to download media
            message_timestamp = datetime.datetime.fromtimestamp(message["timestamp"])
            if message_timestamp >= yesterday_date:
                continue
            
            # For text message
            if message["type"] in ["chat", "image", "video"]:
                if "body" in message.keys() and message["body"] not in ["MEDIA", "IMAGE MESSAGE", "VIDEO MESSAGE", "WhatsApp", "None"] and message["body"] is not None:
                    # fix for having these in the form of prefix with gibberish
                    if any(message["body"].startswith(prefix) for prefix in ["MEDIA", "IMAGE MESSAGE", "VIDEO MESSAGE", "WhatsApp", "None"]):
                        continue
                    # store urls
                    # print(message)message["body"])
                    urls_calc = get_urls(message["body"])
                    urls_stored = list(itertools.chain.from_iterable([get_urls(x["link"]) for x in message["links"]]))
                    urls = list(set([*urls_calc, *urls_stored]))

                    if section not in data["link"]:
                        data["link"][section] = {}

                    for url in urls:
                        if url not in data["link"][section]:
                            data["link"][section][url] = {
                                "senderData": [],
                                "isDownloaded": True,
                            }
                        metadata["position"] = position
                        position+=1
                        data["link"][section][url]["senderData"].append({**metadata})
                    
                    #store text messages for clustering section wise
                    if section not in messages_list:
                        messages_list[section] = []
                    messages_list[section].append(message["body"])
                    
                    if section not in tmp_data["text_msg"]:
                        tmp_data["text_msg"][section] = {}

                    if message["body"] not in tmp_data["text_msg"][section]:
                        tmp_data["text_msg"][section][message["body"]] = {
                            "senderData": [],
                            "isDownloaded": True,
                            # "frequency": 0
                        }

                    if message["type"] in ["image", "video"] and "mediaData" in message:
                        metadata["captionOf"] = message["mediaData"]["filename"]+"."+ message["mediaData"]["mimetype"][6:]
                        if message["type"] == "image":
                            if metadata["captionOf"] in image_map:
                                metadata["captionOf"] = image_map[metadata["captionOf"]]
                        elif message["type"] == "video":
                            if metadata["captionOf"] in video_map:
                                metadata["captionOf"] = video_map[metadata["captionOf"]]
                            
                    if not any(d["timestamp"] == metadata["timestamp"] and d["chatname"] == metadata["chatname"] for d in tmp_data["text_msg"][section][message["body"]]["senderData"]):
                        metadata["position"] = position
                        position+=1
                        tmp_data["text_msg"][section][message["body"]]["senderData"].append({**metadata})
                        # tmp_data["text_msg"][message["body"]]["frequency"]+=1
            
            metadata["captionOf"] = "__NONE__"

            if message["type"] == "image":
                if "mediaData" in message: # future
                    image_name = message["mediaData"]["filename"]+"."+ message["mediaData"]["mimetype"][6:]
                    found = True #tbd
                    # extracting similar image from cluster
                    if image_name in image_map:
                        image_name = image_map[image_name]
                    else:
                        found = False
                    
                    if section not in data["image"]:
                        data["image"][section] = {}

                    if image_name not in data["image"][section]:
                        # check for media file
                        isDownloaded = False
                        if image_name not in corrupt_images and os.path.exists(os.path.join(media_directory_old, image_name)) and os.path.exists(os.path.join(media_directory, image_name)):
                            isDownloaded = True
                        
                        data["image"][section][image_name] = {
                            "senderData": [],
                            "isDownloaded": isDownloaded,
                            "isPresent": found,
                            "isExplicit": False
                        }
                        
                    if check_explicit_content_chatname(messages_row["chatName"], nude_probability_map, image_name):
                        data["image"][section][image_name]["isExplicit"] = True
                        
                    metadata["position"] = position
                    position+=1
                    data["image"][section][image_name]["senderData"].append({**metadata})
                
            elif message["type"] == "video":
                if "mediaData" in message: # future
                    video_name = message["mediaData"]["filename"]+"."+ message["mediaData"]["mimetype"][6:]
                    found = True #tbd
                    # extracting similar video from cluster
                    if video_name in video_map:
                        video_name = video_map[video_name]
                    else:
                        found = False

                    if section not in data["video"]:
                        data["video"][section] = {}

                    if video_name not in data["video"][section]:
                        # check for media file
                        isDownloaded = False
                        if video_name not in corrupt_videos and os.path.exists(os.path.join(media_directory_old, video_name)) and os.path.exists(os.path.join(media_directory, video_name)):
                            isDownloaded = True
                            
                        data["video"][section][video_name] = {
                            "senderData": [],
                            "isDownloaded": isDownloaded,
                            "isPresent": found,
                            "isExplicit": False
                        }
                        
                    thumbnail_name = video_name.split('.')[0] + ".jpg"
                    if check_explicit_content_chatname(messages_row["chatName"], nude_probability_map, thumbnail_name):
                        data["video"][section][video_name]["isExplicit"] = True
                        
                    metadata["position"] = position
                    position+=1
                    data["video"][section][video_name]["senderData"].append({**metadata})
    
    time_log["reading raw messages"] = time.time() - start_time
    
    ##################################################################################################################
    
    start_time = time.time()
    
    db_main = client["testDb5"]
    collection = db_main["messagesUuidMap"]
    text_message_uuid_map = {doc['message']: doc['uuid'] for doc in collection.find()}

    print(tmp_users)
    # clustering text data
    print("Clustering Messages and assigning uuids")

    messages_map = {}
    for section in messages_list:
        print("Section : {}".format(section))
        print(len(messages_list[section]))
        messages_list[section] = list(set(messages_list[section]))
        print(len(messages_list[section]))
        # messages_list[section] = list(filter(lambda item: item is not None, messages_list[section]))
        # print(len(messages_list[section]))
        
        # filtering only to avoid issues in clustering

        # tmp = []
        # for message in messages_list[section]:   
        #     try:
        #         if detect(message) == 'en':   # cluster only if language is english
        #             if not is_url(message):
        #                 tmp.append(message)
        #     except LangDetectException as e:
        #         if not is_url(message):
        #             tmp.append(message)
        # messages_list[section] = tmp
        # print(len(messages_list[section]))

        # num_clusters, cluster_messages = get_clusters(messages_list[section], (len(messages_list[section])*993)//1000)
        # tmpp = []
    
        messages_map[section] = {}
        # for i in range(num_clusters):
        #     for message in cluster_messages[i]:     
        #         try:
        #             if detect(message) == 'en':   # cluster only if language is english
        #                 if not is_url(message):
        #                     messages_map[section][message] = cluster_messages[i][0]
        #         except LangDetectException as e:
        #             if not is_url(message):
        #                 messages_map[section][message] = cluster_messages[i][0]
        #             if message not in tmpp:
        #                 tmpp.append(message)
        # # print(tmpp)
        
        # forming uuids for text messages
        for message in messages_list[section]:
            message = replace_unencodable_characters(message)
            if message not in text_message_uuid_map:
                uid = str(uuid.uuid4())
                text_message_uuid_map[message] = uid
    
    time_log["uuid mapping"] = time.time() - start_time
    
    start_time = time.time()
    
    for section in tmp_data["text_msg"]:
        for key in tmp_data["text_msg"][section]:
            message = key
            if key in messages_map[section]:
                message = messages_map[section][key]
            if section not in data["text_msg"]:
                data["text_msg"][section] = {}
            if message not in data["text_msg"][section]:
                data["text_msg"][section][message] = {
                    "senderData": [],
                    "similarMessages": [],
                    "isDownloaded": tmp_data["text_msg"][section][key]["isDownloaded"]
                }
            data["text_msg"][section][message]["senderData"].extend(tmp_data["text_msg"][section][key]["senderData"])
            data["text_msg"][section][message]["similarMessages"].append({
                "string": key, 
                "timestamp": [x["timestamp"] for x in tmp_data["text_msg"][section][key]["senderData"]]
            }) 

    print("Clustered messages successfully")
    
    time_log["message clustering"] = time.time() - start_time
    
    start_time = time.time()
    
    print("Dumping the data to database")

    def remove_redundant_copies(arr):
        return list({(entry["timestamp"]["$date"], entry["chatname"]): entry for entry in arr}.values())

    data_list = {}
    for key in data:
        try:
            if key not in data_list:
                data_list[key] = []
            if key == "text_msg":
                for section in data[key]:
                    for message in data[key][section]:
                        data_list[key].append({"content": message, "senderData":  remove_redundant_copies(data[key][section][message]["senderData"]), "platform": "whatsapp", "section": section, "flags": [], "isDownloaded": data[key][section][message]["isDownloaded"], "uuid": text_message_uuid_map[replace_unencodable_characters(message)], "similarMessages": data[key][section][message]["similarMessages"]})
            elif key == "video":
                for section in data[key]:
                    for message in data[key][section]:
                        data_list[key].append({"content": message, "senderData":  remove_redundant_copies(data[key][section][message]["senderData"]), "platform": "whatsapp", "section": section, "flags": [], "isDownloaded": data[key][section][message]["isDownloaded"], "isExplicit": data[key][section][message]["isExplicit"], "altText": replace_unencodable_characters(get_file_data_from_redis_video(redis_conn_2, message))})
            elif key == "image":
                for section in data[key]:
                    for message in data[key][section]:
                        data_list[key].append({"content": message, "senderData":  remove_redundant_copies(data[key][section][message]["senderData"]), "platform": "whatsapp", "section": section, "flags": [], "isDownloaded": data[key][section][message]["isDownloaded"], "isExplicit": data[key][section][message]["isExplicit"], "altText": replace_unencodable_characters(get_file_data_from_redis(redis_conn, message))})
            else:
                for section in data[key]:
                    for message in data[key][section]:
                        data_list[key].append({"content": message, "senderData":  remove_redundant_copies(data[key][section][message]["senderData"]), "platform": "whatsapp", "section": section, "flags": [], "isDownloaded": data[key][section][message]["isDownloaded"]})
        except:
            data_list[key] = {}
    print()
    
    # fix for unknown character
    for index, _ in enumerate(data_list["text_msg"]):
        if data_list["text_msg"][index]['content']:
            data_list["text_msg"][index]['content'] = replace_unencodable_characters(data_list["text_msg"][index]['content'])
        if data_list["text_msg"][index]['similarMessages']:
            data_list["text_msg"][index]['similarMessages'] = [
                {
                    'string': replace_unencodable_characters(sm['string']) if sm['string'] is not None else None,
                    'timestamp': sm['timestamp']
                }
                for sm in data_list["text_msg"][index]['similarMessages']
            ]
        if data_list["text_msg"][index]['section']:
            data_list["text_msg"][index]['section'] = replace_unencodable_characters(data_list["text_msg"][index]['section'])
        
    for index, _ in enumerate(data_list["link"]):
        if data_list["link"][index]['content']:
            data_list["link"][index]['content'] = replace_unencodable_characters(data_list["link"][index]['content'])
        if data_list["link"][index]['section']:
            data_list["link"][index]['section'] = replace_unencodable_characters(data_list["link"][index]['section'])
    
    time_log["misc fixes"] = time.time() - start_time
    
    start_time = time.time()
    
    with open("{}/text_msg_uuid_wa.json".format(temp_directory), "w", encoding='utf8') as outfile:
        json.dump([{'message': message, 'uuid': uid} for message, uid in text_message_uuid_map.items()], outfile, ensure_ascii=False)
    with open("{}/image_wa.json".format(temp_directory), "w", encoding='utf8') as outfile:
        json.dump(data_list["image"], outfile, ensure_ascii=False)
    with open("{}/video_wa.json".format(temp_directory), "w", encoding='utf8') as outfile:
        json.dump(data_list["video"], outfile, ensure_ascii=False)
    with open("{}/text_msg_wa.json".format(temp_directory), "w", encoding='utf8') as outfile:
        json.dump(data_list["text_msg"], outfile, ensure_ascii=False)
    with open("{}/link_wa.json".format(temp_directory), "w", encoding='utf8') as outfile:
        json.dump(data_list["link"], outfile, ensure_ascii=False)
    
    time_log["data dump"] = time.time() - start_time

    return True

status = whatsapp()
check = False

if status == True:
    
    start_time = time.time()
    
    # import the data to db
    database="testDb5"

    temp_directory_wa="./temp_data"
    platform_str = "{'platform': 'whatsapp'}"

    if run_command('mongo {} --eval "db.messagesUuidMap.deleteMany({{}})"'.format(database)) == 0:
        run_command("mongoimport --jsonArray --db {} --collection messagesUuidMap --file {}/text_msg_uuid_wa.json --legacy".format(database, temp_directory_wa))
    
    if run_command('mongo {} --eval "db.links.deleteMany({})"'.format(database, platform_str)) == 0:
        run_command("mongoimport --jsonArray --db {} --collection links --file {}/link_wa.json --legacy".format(database, temp_directory_wa))
    
    if run_command('mongo {} --eval "db.messages.deleteMany({})"'.format(database, platform_str)) == 0:
        run_command("mongoimport --jsonArray --db {} --collection messages --file {}/text_msg_wa.json --legacy".format(database, temp_directory_wa))
    
    if run_command('mongo {} --eval "db.images.deleteMany({})"'.format(database, platform_str)) == 0:
        run_command("mongoimport --jsonArray --db {} --collection images --file {}/image_wa.json --legacy".format(database, temp_directory_wa))
    
    if run_command('mongo {} --eval "db.videos.deleteMany({})"'.format(database, platform_str)) == 0:
        run_command("mongoimport --jsonArray --db {} --collection videos --file {}/video_wa.json --legacy".format(database, temp_directory_wa))
    
    run_command('mongo {} --eval "db.logs.insert({{date: new Date()}})"'.format(database))

    print("Data imported successfully")
    
    time_log["database import"] = time.time() - start_time
    
    start_time = time.time()
    
    print("Running dataindexer")
    if run_command('/home/kg766/dataIndexer/dataIndexer > {}/output.log &'.format(temp_directory_wa)) == 0:
        print("Dataindexer finished")
    else:
        print("Dataindexer failed")
        
    time_log["dataindexer"] = time.time() - start_time
    
    check = True
    
if check:
    send_notification("Whatsapp data synced successfully.")
else:
    print("error")
    # send_notification("Error, whatsapp data sync script crashed.")

with open('time_log.json', 'w') as f:
    json.dump(time_log, f)