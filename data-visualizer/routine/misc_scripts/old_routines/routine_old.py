import subprocess 
import glob
import cv2
import os
import csv
import re
import json
from urlextract import URLExtract
import validators
from polyfuzz import PolyFuzz
import datetime
import itertools
from text_clusterer import get_clusters
from langdetect import detect, LangDetectException
import requests
import pymongo

def is_url(string):
    if validators.url(string):
        return True
    else:
        return False

def run_command(command):
    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True, shell=True)
    # print(result)
    if result.stderr:
        print(result.stderr)
    return result.stdout

def telegram():
    # get participant names
    participant_map_path="./participant_map.jsonl"
    with open(participant_map_path, 'r') as participant_map_file:
        participant_map_list = list(participant_map_file)
    participant_map = {}
    for participant_data in participant_map_list:
        participant_data =  json.loads(participant_data)
        participant_map[participant_data['userId']] = participant_data['sections']
    print(participant_map)

    # group to id map
    url = "https://tapi.whats-viral.me/get_channels" 
    
    response = requests.get(url)
    group_id_name_map = {}

    if response.status_code == 200: 
        data = response.json()
        group_id_name_map = {item["telegram_id"]: item["title"] for item in data}
    else:
        print("Request failed with status code:", response.status_code)

    # copying media
    media_directory = "../backend/media_tel"
    run_command("rm -rf {}".format(media_directory))
    run_command("mkdir {}".format(media_directory))
    run_command('find /home/paras/telegram-backend/media/ -type f \( -name "*.jpg" -o -name "*.jpeg" \) -print0 | xargs -0 cp -t {}'.format(media_directory))

    temp_directory = "./temp_data_tel"
    if not os.path.exists(temp_directory):
        os.makedirs(temp_directory)

    print("Computing Image Clusters...")
    # run_command("make -C ./pdq")
    run_command("(find {} -type f -name '*.*g' -print0   | xargs -0 ./pdq/bin/pdq-photo-hasher-tool --details) > {}/haystack.hsh".format(media_directory, temp_directory))
    run_command("./pdq/bin/clusterize256-tool -d 40 {}/haystack.hsh > {}/haystack.clu".format(temp_directory, temp_directory))
    print("Computed Image Clusters")

    # store image cluster map
    print("Mapping image clusters to common image...")
    image_map = {}
    with open("{}/haystack.clu".format(temp_directory)) as csvfile:
        spamreader = csv.reader(csvfile)
        cnt = 1
        tmp = []
        for row in spamreader:
            clid = int(row[0].split('=')[1])
            clusz = int(row[1].split('=')[1])
            name = row[9].split('=')[1].split('/')[-1]
            tmp.append(name)
            name2 = name[:11]+name[18:] # fix to remove id from between
            tmp.append(name2)
            if clusz == cnt:
                for nm in tmp:
                    image_map[nm] = name
                tmp.clear()
                cnt = 1
            else:
                cnt+=1
    print("Image mapping done")

    # init
    extractor = URLExtract()
    data = {"text_msg": {}, "image": {}, "link": {}}
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
    print("Reading Messages File")
    messages_list = []

    # messages_path="./messages_data/messages.jsonl"
    # cnt = 0
    for messages_path in glob.iglob('/home/paras/telegram-backend/chats/*', recursive=True):
        group_name = group_id_name_map[os.path.basename(messages_path)]
        if group_name == "":
            group_name = os.path.basename(messages_path)
        print(group_name)
        print(messages_path)
        # cnt+=1
        # if cnt > 2:
        #     break
        with open(messages_path, 'r') as json_file:
            json_list = list(json_file)
        for json_str in json_list:
            messages_row = json.loads(json_str)
            if messages_row["_"] == "Message":
                # print(messages_row["message"])
                # print(messages_row["from_id"]["user_id"])
                # print(messages_row["date"])
                # print(messages_row["media_path"])
                # print(messages_row["peer_id"]["channel_id"])
    #         for message in messages_row["messages"]:
                
    #             # temporary fix to avoid data from new people
    #             if messages_row["userName"] not in participant_map:
    #                 continue

                metadata = {
                    "from": (messages_row["from_id"]["user_id"] if "user_id" in messages_row["from_id"] else "None") if messages_row["from_id"] is not None else "None" ,
                    "to": messages_row["peer_id"]["channel_id"], # doubt is chatname and to same
                    "timestamp": {"$date": datetime.datetime.strptime(messages_row["date"], '%Y-%m-%dT%H:%M:%S%z').strftime("%Y-%m-%dT%H:%M:%S.000Z")},
                    "chatname": group_name,
                    "section": "test",
                }
                
                message_body = messages_row["message"]
                urls_calc = get_urls(message_body)
                urls = list(set(urls_calc))

                for url in urls:
                    if url not in data["link"].keys():
                        data["link"][url] = {
                            "senderData": []
                        }
                    data["link"][url]["senderData"].append(metadata)
                    
                messages_list.append(message_body)
                if message_body not in tmp_data["text_msg"].keys():
                    tmp_data["text_msg"][message_body] = {
                        "senderData": [],
                        "frequency": 0
                    }
                if not any(d["timestamp"] == metadata["timestamp"] and d["chatname"] == metadata["chatname"] for d in tmp_data["text_msg"][message_body]["senderData"]):
                    tmp_data["text_msg"][message_body]["senderData"].append(metadata)
                    tmp_data["text_msg"][message_body]["frequency"]+=1


                if "media_path" in messages_row and messages_row["media_path"] is not None:
                    image_name = os.path.basename(messages_row["media_path"])
                    extension = os.path.splitext(image_name)[1]

                    if extension in [".jpg", ".jpeg"]:
                        found = True #tbd
                        # extracting similar image from cluster
                        if image_name in image_map:
                            image_name = image_map[image_name]
                        else:
                            found = False
                        if image_name not in data["image"].keys():
                            data["image"][image_name] = {
                                "senderData": [],
                                "isPresent": found
                            }
                        data["image"][image_name]["senderData"].append(metadata)
                    
    #             elif message["type"] == "video":
    #                 if "mediaData" not in message: # future
    #                     continue
    #                 video_name = message["mediaData"]["filename"]+"."+ message["mediaData"]["mimetype"][6:]
    #                 found = True #tbd
    #                 # extracting similar video from cluster
    #                 if video_name in video_map:
    #                     video_name = video_map[video_name]
    #                 else:
    #                     found = False
    #                 if video_name not in data["video"].keys():
    #                     data["video"][video_name] = {
    #                         "senderData": [],
    #                         "isPresent": found
    #                     }
    #                 data["video"][video_name]["senderData"].append(metadata)

    # clustering text data
    print("Clustering Messages")
    print(len(messages_list))
    messages_list = list(set(messages_list))
    print(len(messages_list))
    messages_list = list(filter(lambda item: item is not None, messages_list))
    print(len(messages_list))


    messages_map = {}
    # num_clusters, cluster_messages = get_clusters(messages_list, len(messages_list))
    # for i in range(num_clusters):
    #     for message in cluster_messages[i]:        
    #         messages_map[message] = cluster_messages[i][0]

    # model = PolyFuzz("TF-IDF")
    # model.match(messages_list)
    # model.group()
    # # print(messages_list)

    # messages_map = {}
    # clusters = model.get_clusters()

    # for cluster_id in clusters:
    #     head = clusters[cluster_id][0]
    #     for message in clusters[cluster_id]:
    #         messages_map[message] = head

    for key in tmp_data["text_msg"]:
        message = key
        if key in messages_map:
            message = messages_map[key]
        if message not in data["text_msg"].keys():
            data["text_msg"][message] = {
                "senderData": [],
                "similarMessages": []
            }
        data["text_msg"][message]["senderData"].extend(tmp_data["text_msg"][key]["senderData"])
        # if key not in data["text_msg"][message]["similarMessages"]:
        #     data["text_msg"][message]["similarMessages"].append(key)
        data["text_msg"][message]["similarMessages"].append({
            "string": key, 
            "frequency": tmp_data["text_msg"][key]["frequency"]
        }) 

    print("Clustered messages successfully")
    print("Dumping the data to database")

    def remove_redundant_copies(arr):
        return list({(entry["timestamp"]["$date"], entry["chatname"]): entry for entry in arr}.values())

    data_list = {}
    for key in data:
        try:
            if key == "text_msg":
                data_list[key] = [{"content": k, "senderData":  remove_redundant_copies(v["senderData"]), "similarMessages": v["similarMessages"], "flagCount": 0, "platform": "telegram"} for k, v in data[key].items()]
            else:
                data_list[key] = [{"content": k, "senderData":  remove_redundant_copies(v["senderData"]), "flagCount": 0, "platform": "telegram"} for k, v in data[key].items()]
        except:
            data_list[key] = {}
    print()

    with open("{}/text_msg_tel.json".format(temp_directory), "w", encoding='utf8') as outfile:
        json.dump(data_list["text_msg"], outfile, ensure_ascii=False)
    with open("{}/link_tel.json".format(temp_directory), "w", encoding='utf8') as outfile:
        json.dump(data_list["link"], outfile, ensure_ascii=False)
    with open("{}/image_tel.json".format(temp_directory), "w", encoding='utf8') as outfile:
        json.dump(data_list["image"], outfile, ensure_ascii=False)
    # with open("{}/video.json".format(temp_directory), "w", encoding='utf8') as outfile:
    #     json.dump(data_list["video"], outfile, ensure_ascii=False)



def whatsapp():
    # get participant names
    # participant_map_path="./participant_map.jsonl"
    # with open(participant_map_path, 'r') as participant_map_file:
    #     participant_map_list = list(participant_map_file)
    # participant_map = {}
    # for participant_data in participant_map_list:
    #     participant_data =  json.loads(participant_data)
    #     participant_map[participant_data['userId']] = participant_data['sections']
    # print(participant_map)

    client = pymongo.MongoClient("mongodb://localhost:27017/")
    db = client["whatsappLogs"]
    participants_collection = db["participants"]
    participants = participants_collection.find()

    participant_map = {}
    for participant in participants:
        # if participant["addedByName"] not in addedBy:
        #     addedBy[participant["addedByName"]] = []
        # addedBy[participant["addedByName"]].append(participant["name"])
        participant_map[participant["name"]] = [participant["addedByName"]] # breaking assumption, a username should be unique to one group
    print(participant_map)

    def extract_thumbnails(folder_path):
        thumbnail_path = "{}/thumbnails".format(folder_path)
        run_command("mkdir {}/".format(thumbnail_path))

        for filename in os.listdir(folder_path):
            # Skip if the file is not a video file
            if not filename.endswith(".mp4") and not filename.endswith(".avi") and not filename.endswith(".mkv"):
                continue
            
            # Open the video file
            video = cv2.VideoCapture(os.path.join(folder_path, filename))
            
            # Read the first frame
            success, frame = video.read()
            
            # Check if the video was opened successfully
            if success:
                # Save the frame as a thumbnail
                thumbnail_file = os.path.splitext(filename)[0] + ".jpg"
                cv2.imwrite(os.path.join(thumbnail_path, thumbnail_file), frame)
            
            # Release the video file
            video.release()

    # copying media
    media_directory = "../backend/media"
    run_command("rm -rf {}".format(media_directory))
    run_command("mkdir {}".format(media_directory))
    run_command("cp ~/whatsappMonitor/downloaded-media/*/* {}".format(media_directory))
    extract_thumbnails(media_directory)


    temp_directory = "./temp_data"
    if not os.path.exists(temp_directory):
        os.makedirs(temp_directory)

    temp_tmk_directory = "{}/vid_tmk".format(temp_directory)
    if not os.path.exists(temp_tmk_directory):
        os.makedirs(temp_tmk_directory)

    print("Computing Video Clusters...")
    # run_command("make -C ./pdq")
    run_command("""
    for v in {}/*.mp4; do
      ./tmk/cpp/tmk-hash-video -f /usr/bin/ffmpeg -i $v -d {}
    done
    """.format(media_directory, temp_tmk_directory))
    run_command("./tmk/cpp/tmk-clusterize --c1 0.75 --c2 0.75 -s {}/*.tmk > {}/vidstack.clu".format(temp_tmk_directory, temp_directory))
    print("Computed Video Clusters")

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

    # compute photo clusters

    print("Computing Image Clusters...")
    # run_command("make -C ./pdq")
    run_command("./pdq/bin/pdq-photo-hasher-tool --details {}/*g > {}/haystack.hsh".format(media_directory, temp_directory))
    run_command("./pdq/bin/clusterize256-tool -d 63 {}/haystack.hsh > {}/haystack.clu".format(temp_directory, temp_directory))
    print("Computed Image Clusters")

    # store image cluster map
    print("Mapping image clusters to common image...")
    image_map = {}
    with open("{}/haystack.clu".format(temp_directory)) as csvfile:
        spamreader = csv.reader(csvfile)
        cnt = 1
        tmp = []
        for row in spamreader:
            clid = int(row[0].split('=')[1])
            clusz = int(row[1].split('=')[1])
            name = row[9].split('=')[1].split('/')[-1]
            tmp.append(name)
            name2 = name[:11]+name[18:] # fix to remove id from between
            tmp.append(name2)
            if clusz == cnt:
                for nm in tmp:
                    image_map[nm] = name
                tmp.clear()
                cnt = 1
            else:
                cnt+=1
    print("Image mapping done")

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
    print("Reading Messages File")
    messages_list = []
    tmp_users = []

    # messages_path="./messages_data/messages.jsonl"

    directory_path = '../../whatsappMonitor/data/'
    directories = [d for d in os.listdir(directory_path) if os.path.isdir(os.path.join(directory_path, d))]
    latest_modified_directory = sorted(directories, key=lambda x: os.path.getmtime(os.path.join(directory_path, x)), reverse=True)[0]
    # cnt = 0
    # for messages_path in glob.iglob('../../whatsappMonitor/data/*/messages.json', recursive=True):
    for messages_path in glob.iglob('../../whatsappMonitor/data/{}/messages.json'.format(latest_modified_directory), recursive=True):
        print(messages_path)
        # cnt+=1
        # if cnt > 5:
        #     break
        with open(messages_path, 'r') as json_file:
            json_list = list(json_file)
        for json_str in json_list:
            messages_row = json.loads(json_str)
            for message in messages_row["messages"]:
                
                # temporary fix to store data from new people
                if messages_row["userName"] not in participant_map:
                    participant_map[messages_row["userName"]] = ["test"] # future fix
                    tmp_users.append(messages_row["userName"])
                    # continue

                metadata = {
                    "from": message["from"],
                    "to": message["to"] if "to" in message else "",
                    "timestamp": {"$date": datetime.datetime.fromtimestamp(message["timestamp"]).strftime("%Y-%m-%dT%H:%M:%S.000Z")},
                    "chatname": messages_row["chatName"],
                    "section": participant_map[messages_row["userName"]]
                }

                if message["type"] == "chat":
                    if "body" not in message.keys():
                        continue
                    if message["body"] == "MEDIA":
                        continue
                    # store urls
                    # print(message)message["body"])
                    urls_calc = get_urls(message["body"])
                    urls_stored = list(itertools.chain.from_iterable([get_urls(x["link"]) for x in message["links"]]))
                    urls = list(set([*urls_calc, *urls_stored]))
                    for url in urls:
                        if url not in data["link"].keys():
                            data["link"][url] = {
                                "senderData": []
                            }
                        data["link"][url]["senderData"].append(metadata)
                    #store text messages
                    messages_list.append(message["body"])
                    if message["body"] not in tmp_data["text_msg"].keys():
                        tmp_data["text_msg"][message["body"]] = {
                            "senderData": [],
                            "frequency": 0
                        }

                    if not any(d["timestamp"] == metadata["timestamp"] and d["chatname"] == metadata["chatname"] for d in tmp_data["text_msg"][message["body"]]["senderData"]):
                        tmp_data["text_msg"][message["body"]]["senderData"].append(metadata)
                        tmp_data["text_msg"][message["body"]]["frequency"]+=1

                elif message["type"] == "image":
                    if "mediaData" not in message: # future
                        continue
                    image_name = message["mediaData"]["filename"]+"."+ message["mediaData"]["mimetype"][6:]
                    found = True #tbd
                    # extracting similar image from cluster
                    if image_name in image_map:
                        image_name = image_map[image_name]
                    else:
                        found = False
                    if image_name not in data["image"].keys():
                        data["image"][image_name] = {
                            "senderData": [],
                            "isPresent": found
                        }
                    data["image"][image_name]["senderData"].append(metadata)
                    
                elif message["type"] == "video":
                    if "mediaData" not in message: # future
                        continue
                    video_name = message["mediaData"]["filename"]+"."+ message["mediaData"]["mimetype"][6:]
                    found = True #tbd
                    # extracting similar video from cluster
                    if video_name in video_map:
                        video_name = video_map[video_name]
                    else:
                        found = False
                    if video_name not in data["video"].keys():
                        data["video"][video_name] = {
                            "senderData": [],
                            "isPresent": found
                        }
                    data["video"][video_name]["senderData"].append(metadata)

    print(tmp_users)
    # clustering text data
    print("Clustering Messages")
    print(len(messages_list))

    messages_list = list(set(messages_list))
    print(len(messages_list))
    messages_list = list(filter(lambda item: item is not None, messages_list))
    print(len(messages_list))

    messages_map = {}
    num_clusters, cluster_messages = get_clusters(messages_list, len(messages_list)*50//100)
    tmpp = []
    
    for i in range(num_clusters):
        for message in cluster_messages[i]:     
            try:
                if detect(message) == 'en':   # cluster only if language is english
                    if not is_url(message):
                        messages_map[message] = cluster_messages[i][0]
            except LangDetectException as e:
                if not is_url(message):
                    messages_map[message] = cluster_messages[i][0]
                if message not in tmpp:
                    tmpp.append(message)
    print(tmpp)

    # for cluster_id in clusters:
    #     head = clusters[cluster_id][0]
    #     for message in clusters[cluster_id]:
    #         messages_map[message] = head

    for key in tmp_data["text_msg"]:
        message = key
        if key in messages_map:
            message = messages_map[key]
        if message not in data["text_msg"].keys():
            data["text_msg"][message] = {
                "senderData": [],
                "similarMessages": []
            }
        data["text_msg"][message]["senderData"].extend(tmp_data["text_msg"][key]["senderData"])
        data["text_msg"][message]["similarMessages"].append({
            "string": key, 
            "frequency": tmp_data["text_msg"][key]["frequency"]
        }) 


    print("Clustered messages successfully")
    print("Dumping the data to database")

    def remove_redundant_copies(arr):
        return list({(entry["timestamp"]["$date"], entry["chatname"]): entry for entry in arr}.values())

    data_list = {}
    for key in data:
        try:
            # if key == "image" or key == "video":
            #     data_list[key] = [{"content": k, "senderData":  v["senderData"], "isPresent": v["isPresent"], "flagCount": 0} for k, v in data[key].items()]
            # else:
            if key == "text_msg":
                data_list[key] = [{"content": k, "senderData":  remove_redundant_copies(v["senderData"]), "similarMessages": v["similarMessages"], "flagCount": 0, "platform": "whatsapp"} for k, v in data[key].items()]
            else:
                data_list[key] = [{"content": k, "senderData":  remove_redundant_copies(v["senderData"]), "flagCount": 0, "platform": "whatsapp"} for k, v in data[key].items()]
        except:
            data_list[key] = {}
    print()

    with open("{}/text_msg_wa.json".format(temp_directory), "w", encoding='utf8') as outfile:
        json.dump(data_list["text_msg"], outfile, ensure_ascii=False)
    with open("{}/link_wa.json".format(temp_directory), "w", encoding='utf8') as outfile:
        json.dump(data_list["link"], outfile, ensure_ascii=False)
    with open("{}/image_wa.json".format(temp_directory), "w", encoding='utf8') as outfile:
        json.dump(data_list["image"], outfile, ensure_ascii=False)
    with open("{}/video_wa.json".format(temp_directory), "w", encoding='utf8') as outfile:
        json.dump(data_list["video"], outfile, ensure_ascii=False)

os.chdir("/home/kg766/dataVisualiser/routine")

whatsapp()
# telegram()

# import the data to db
database="testDb4"

temp_directory_wa="./temp_data"
temp_directory_tel="./temp_data_tel"

# run_command('mongo {} --eval "db.dropDatabase()"'.format(database))
run_command('mongo {} --eval "db.links.drop()"'.format(database))
run_command('mongo {} --eval "db.messages.drop()"'.format(database))
run_command('mongo {} --eval "db.images.drop()"'.format(database))
run_command('mongo {} --eval "db.videos.drop()"'.format(database))
run_command("mongoimport --jsonArray --db {} --collection links --file {}/link_wa.json --legacy".format(database, temp_directory_wa))
run_command("mongoimport --jsonArray --db {} --collection messages --file {}/text_msg_wa.json --legacy".format(database, temp_directory_wa))
run_command("mongoimport --jsonArray --db {} --collection images --file {}/image_wa.json --legacy".format(database, temp_directory_wa))
run_command("mongoimport --jsonArray --db {} --collection videos --file {}/video_wa.json --legacy".format(database, temp_directory_wa))
run_command("mongoimport --jsonArray --db {} --collection links --file {}/link_tel.json --legacy".format(database, temp_directory_tel))
run_command("mongoimport --jsonArray --db {} --collection messages --file {}/text_msg_tel.json --legacy".format(database, temp_directory_tel))
run_command("mongoimport --jsonArray --db {} --collection images --file {}/image_tel.json --legacy".format(database, temp_directory_tel))
# run_command("mongoimport --jsonArray --db {} --collection videos --file {}/video_tel.json --legacy".format(database, temp_directory))
run_command('mongo {} --eval "db.logs.insert({{date: new Date()}})"'.format(database))

print("Data imported successfully")