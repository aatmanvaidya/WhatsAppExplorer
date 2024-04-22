import subprocess
import os
import csv
import re
import json
from urlextract import URLExtract
import validators
import datetime
from text_clusterer import get_clusters
from langdetect import detect, LangDetectException
import pymongo
from urllib.parse import urlparse

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

def facebook():

    ##################################################################################################################
    
    corrupt_images = set()

    # copying media
    media_directory = "../backend/media_fb"
    if not os.path.exists(media_directory):
        os.makedirs(media_directory)
        
    bash_script = 'find /mnt/storage/kg766/facebookData/media/ -type f \( -name "*.jpg" -o -name "*.jpeg" \) -print0 | xargs -0 ln -s -t {}'.format(media_directory)

    if run_command(bash_script) != 0:
        print("Crashed while copying media to {}. Terminating!".format(media_directory))
        return False

    ##################################################################################################################

    temp_directory = "./temp_data_fb"
    if not os.path.exists(temp_directory):
        os.makedirs(temp_directory)

    ##################################################################################################################

    # compute photo clusters

    print("Computing Image Hashes...")
    
    haystack_file_path = "{}/haystack.hsh".format(temp_directory)

    existing_hashes = set()
    if os.path.exists(haystack_file_path):
        with open(haystack_file_path, 'r') as haystack_file:
            for line in haystack_file:
                try:
                    file_name = line.split("filename=")[-1].strip()
                    existing_hashes.add(file_name)
                except:
                    print("Error while reading {}: {}".format(haystack_file_path, line))
                    return False
    
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
                    corrupt_images.add(file)
    
    print("Computed Image Hashes. Running Clusterisation...")
        
    response = run_command("./pdq/bin/clusterize256-tool -d 63 {}/haystack.hsh > {}/haystack.clu".format(temp_directory, temp_directory))
    if response != 0:
        print("Image Cluster Crashed. Terminating!")
        return False
        
    print("Computed Image Clusters")
    print("Corrupt images: ", corrupt_images)
    
    ##################################################################################################################

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

    ##################################################################################################################

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
        return urls

    # read messages file
    print("Reading Messages File")
    messages_list = {}

    directory_path = '/mnt/storage/kg766/facebookData/messages_dump/'    
    section = "test"

    for filename in os.listdir(directory_path):
        file_path = os.path.join(directory_path, filename)

        if filename.endswith(".jsonl"):
            with open(file_path, "r") as file:
                for line in file:
                    try:
                        json_data = json.loads(line)
                    except:
                        continue
                    posts = json_data["result"]["posts"]

                    for post in posts:
                        metadata = {
                            "timestamp": {"$date": datetime.datetime.strptime(post["date"], "%Y-%m-%d %H:%M:%S").strftime("%Y-%m-%dT%H:%M:%S.000Z")},
                            "chatname": post["account"]["name"],
                            "forwardingScore": post["statistics"]["actual"]["likeCount"],
                            "captionOf": "__NONE__"
                        }
                        
                        if "facebook" in group_exceptions:
                            if section in group_exceptions["facebook"]:
                                if post["account"]["name"] in group_exceptions["facebook"][section]:
                                    break

                        if section not in data["link"]:
                            data["link"][section] = {}

                        if "expandedLinks" in post:
                            for link in post["expandedLinks"]:
                                url = link["original"]
                                if url not in data["link"][section]:
                                    data["link"][section][url] = {
                                        "senderData": [],
                                        "isDownloaded": True,
                                    }
                                # todo: position
                                data["link"][section][url]["senderData"].append(metadata)
            
                        if section not in tmp_data["text_msg"]:
                            tmp_data["text_msg"][section] = {}

                        if "message" in post:
                            message_body = post["message"]

                            if section not in messages_list:
                                messages_list[section] = []
                            messages_list[section].append(message_body)
                            
                            if message_body not in tmp_data["text_msg"][section]:
                                tmp_data["text_msg"][section][message_body] = {
                                    "senderData": [],
                                    "isDownloaded": True,
                                }
                                tmp_data["text_msg"][section][message_body]["senderData"].append(metadata)

                        if "media" in post:
                            for media in post["media"]:
                                media_type = media["type"]
                                if media_type == "video":
                                    continue

                                media_url = media["url"]
                                file_name = os.path.basename(urlparse(media_url).path)
                                if not os.path.splitext(file_name)[1]:
                                    file_name += ".jpg"
                                        
                                if file_name == ".jpg": # bug fix
                                    continue

                                if media_type == "photo":
                                    
                                    if file_name in image_map:
                                        file_name = image_map[file_name]

                                    if section not in data["image"]:
                                        data["image"][section] = {}
                                    if file_name not in data["image"][section]:
                                        data["image"][section][file_name] = {
                                            "senderData": [],
                                        }

                                    data["image"][section][file_name]["senderData"].append(metadata)
                                
    print("Clustering Messages")

    messages_map = {}
    for section in messages_list:
        print("Section : {}".format(section))
        print(len(messages_list[section]))
        messages_list[section] = list(set(messages_list[section]))
        print(len(messages_list[section]))
        messages_list[section] = list(filter(lambda item: item is not None, messages_list[section]))
        print(len(messages_list[section]))

        tmp = []
        for message in messages_list[section]:   
            try:
                if detect(message) == 'en':   # cluster only if language is english
                    if not is_url(message):
                        tmp.append(message)
            except LangDetectException as e:
                if not is_url(message):
                    tmp.append(message)
        messages_list[section] = tmp
        print(len(messages_list[section]))

        num_clusters, cluster_messages = get_clusters(messages_list[section], len(messages_list[section]))
        tmpp = []
    
        messages_map[section] = {}
        for i in range(num_clusters):
            for message in cluster_messages[i]:     
                try:
                    if detect(message) == 'en':   # cluster only if language is english
                        if not is_url(message):
                            messages_map[section][message] = cluster_messages[i][0]
                except LangDetectException as e:
                    if not is_url(message):
                        messages_map[section][message] = cluster_messages[i][0]
                    if message not in tmpp:
                        tmpp.append(message)
        # print(tmpp)
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
                }
            data["text_msg"][section][message]["senderData"].extend(tmp_data["text_msg"][section][key]["senderData"])
            data["text_msg"][section][message]["similarMessages"].append({
                "string": key, 
                "timestamp": [x["timestamp"] for x in tmp_data["text_msg"][section][key]["senderData"]]
            }) 

    print("Clustered messages successfully")
    print("Dumping the data to database")

    data_list = {}
    for key in data:
        try:
            if key not in data_list:
                data_list[key] = []
            if key == "text_msg":
                for section in data[key]:
                    for message in data[key][section]:
                        data_list[key].append({"content": message, "senderData":  data[key][section][message]["senderData"], "similarMessages": data[key][section][message]["similarMessages"], "flagCount": 0, "platform": "facebook", "section": section})
            else:
                for section in data[key]:
                    for message in data[key][section]:
                        data_list[key].append({"content": message, "senderData":  data[key][section][message]["senderData"], "flagCount": 0, "platform": "facebook", "section": section})
        except:
            data_list[key] = {}
    print()

    with open("{}/text_msg_fb.json".format(temp_directory), "w", encoding='utf8') as outfile:
        json.dump(data_list["text_msg"], outfile, ensure_ascii=False)
    with open("{}/link_fb.json".format(temp_directory), "w", encoding='utf8') as outfile:
        json.dump(data_list["link"], outfile, ensure_ascii=False)
    with open("{}/image_fb.json".format(temp_directory), "w", encoding='utf8') as outfile:
        json.dump(data_list["image"], outfile, ensure_ascii=False)

facebook()

# import the data to db
database="testDb5"

temp_directory_fb="./temp_data_fb"
platform_str = "{'platform': 'facebook'}"

run_command('mongo {} --eval "db.links.deleteMany({})"'.format(database, platform_str))
run_command('mongo {} --eval "db.messages.deleteMany({})"'.format(database, platform_str))
run_command('mongo {} --eval "db.images.deleteMany({})"'.format(database, platform_str))
run_command("mongoimport --jsonArray --db {} --collection links --file {}/link_fb.json --legacy".format(database, temp_directory_fb))
run_command("mongoimport --jsonArray --db {} --collection messages --file {}/text_msg_fb.json --legacy".format(database, temp_directory_fb))
run_command("mongoimport --jsonArray --db {} --collection images --file {}/image_fb.json --legacy".format(database, temp_directory_fb))
run_command('mongo {} --eval "db.logs.insert({{date: new Date()}})"'.format(database))

print("Data imported successfully")
