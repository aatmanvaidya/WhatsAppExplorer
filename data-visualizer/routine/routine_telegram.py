import subprocess 
import glob
import os
import csv
import re
import json
from urlextract import URLExtract
import validators
import datetime
from text_clusterer import get_clusters
from langdetect import detect, LangDetectException
import requests

pattern = r'[^\w\s]|[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF]'

os.chdir("/home/kg766/dataVisualiser/routine")

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
    
with open('exceptions.json', 'r') as f:
    # Load the data from the file using the json module
    group_exceptions = json.load(f)

def telegram():
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
    # media_directory = "/home/paras/telegram-backend/media/"
    # run_command("rm -rf {}".format(media_directory))
    # run_command("mkdir {}".format(media_directory))
    run_command('find /home/paras/telegram-backend/media/ -type f \( -name "*.jpg" -o -name "*.jpeg" \) -print0 | xargs -0 ln -s -t {}'.format(media_directory))

    temp_directory = "./temp_data_tel"
    if not os.path.exists(temp_directory):
        os.makedirs(temp_directory)

    print("Computing Image Clusters...")
    # run_command("make -C ./pdq")
    run_command("(find -L {} -name '*.*g' -print0 | xargs -0 ls -l | awk '{{printf \"%s\\0\", $NF}}' | xargs -0 ./pdq/bin/pdq-photo-hasher-tool --details) > {}/haystack.hsh".format(media_directory, temp_directory))
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
    messages_list = {}

    # messages_path="./messages_data/messages.jsonl"
    # cnt = 0
    for messages_path in glob.iglob('/home/paras/telegram-backend/chats/*', recursive=True):
        group_name = ""
        if os.path.basename(messages_path) in group_id_name_map:
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
                section = "test"
                
                if "telegram" in group_exceptions:
                    if section in group_exceptions["telegram"]:
                        if group_name in group_exceptions["telegram"][section]:
                            continue

                metadata = {
                    "from": (messages_row["from_id"]["user_id"] if "user_id" in messages_row["from_id"] else "None") if messages_row["from_id"] is not None else "None" ,
                    "to": messages_row["peer_id"]["channel_id"], # doubt is chatname and to same
                    "timestamp": {"$date": datetime.datetime.strptime(messages_row["date"], '%Y-%m-%dT%H:%M:%S%z').strftime("%Y-%m-%dT%H:%M:%S.000Z")},
                    "chatname": group_name,
                    "forwardingScore": messages_row["forwards"]
                }
                
                message_body = messages_row["message"]
                urls_calc = get_urls(message_body)
                urls = list(set(urls_calc))

                if section not in data["link"]:
                    data["link"][section] = {}

                for url in urls:
                    if url not in data["link"][section]:
                        data["link"][section][url] = {
                            "senderData": []
                        }
                    data["link"][section][url]["senderData"].append(metadata)
                    
                if section not in messages_list:
                        messages_list[section] = []
                messages_list[section].append(message_body)
                
                if section not in tmp_data["text_msg"]:
                    tmp_data["text_msg"][section] = {}

                if message_body not in tmp_data["text_msg"][section]:
                    tmp_data["text_msg"][section][message_body] = {
                        "senderData": [],
                        # "frequency": 0
                    }

                if not any(d["timestamp"] == metadata["timestamp"] and d["chatname"] == metadata["chatname"] for d in tmp_data["text_msg"][section][message_body]["senderData"]):
                    tmp_data["text_msg"][section][message_body]["senderData"].append(metadata)
                    # tmp_data["text_msg"][message_body]["frequency"]+=1

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

                        if section not in data["image"]:
                            data["image"][section] = {}

                        if image_name not in data["image"][section]:
                            data["image"][section][image_name] = {
                                "senderData": [],
                                "isPresent": found
                            }
                        data["image"][section][image_name]["senderData"].append(metadata)
                    
    # clustering text data
    print("Clustering Messages")
    
    messages_map = {}
    for section in messages_list:
        # print("Section : {}".format(section))
    #     print(len(messages_list[section]))
    #     messages_list[section] = list(set(messages_list[section]))
    #     print(len(messages_list[section]))
    #     messages_list[section] = list(filter(lambda item: item is not None, messages_list[section]))
    #     print(len(messages_list[section]))

    #     num_clusters, cluster_messages = get_clusters(messages_list[section], len(messages_list[section])*50//100)
    #     tmpp = []
    
        messages_map[section] = {}
    #     for i in range(num_clusters):
    #         for message in cluster_messages[i]:     
    #             try:
    #                 if detect(message) == 'en':   # cluster only if language is english
    #                     if not is_url(message):
    #                         messages_map[section][message] = cluster_messages[i][0]
    #             except LangDetectException as e:
    #                 if not is_url(message):
    #                     messages_map[section][message] = cluster_messages[i][0]
    #                 if message not in tmpp:
    #                     tmpp.append(message)
    #     # print(tmpp)

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
                        data_list[key].append({"content": message, "senderData":  remove_redundant_copies(data[key][section][message]["senderData"]), "similarMessages": data[key][section][message]["similarMessages"], "flagCount": 0, "platform": "telegram", "section": section})
            else:
                for section in data[key]:
                    for message in data[key][section]:
                        data_list[key].append({"content": message, "senderData":  remove_redundant_copies(data[key][section][message]["senderData"]), "flagCount": 0, "platform": "telegram", "section": section})
        except:
            data_list[key] = {}
    print()

    with open("{}/text_msg_tel.json".format(temp_directory), "w", encoding='utf8') as outfile:
        json.dump(data_list["text_msg"], outfile, ensure_ascii=False)
    with open("{}/link_tel.json".format(temp_directory), "w", encoding='utf8') as outfile:
        json.dump(data_list["link"], outfile, ensure_ascii=False)
    with open("{}/image_tel.json".format(temp_directory), "w", encoding='utf8') as outfile:
        json.dump(data_list["image"], outfile, ensure_ascii=False)

telegram()

# import the data to db
database="testDb5"

temp_directory_tel="./temp_data_tel"
platform_str = "{'platform': 'telegram'}"

run_command('mongo {} --eval "db.links.deleteMany({})"'.format(database, platform_str))
run_command('mongo {} --eval "db.messages.deleteMany({})"'.format(database, platform_str))
run_command('mongo {} --eval "db.images.deleteMany({})"'.format(database, platform_str))
run_command("mongoimport --jsonArray --db {} --collection links --file {}/link_tel.json --legacy".format(database, temp_directory_tel))
run_command("mongoimport --jsonArray --db {} --collection messages --file {}/text_msg_tel.json --legacy".format(database, temp_directory_tel))
run_command("mongoimport --jsonArray --db {} --collection images --file {}/image_tel.json --legacy".format(database, temp_directory_tel))
run_command('mongo {} --eval "db.logs.insert({{date: new Date()}})"'.format(database))

print("Data imported successfully")
