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
import requests
import pymongo

with open('exceptions.json', 'r') as f:
    # Load the data from the file using the json module
    group_exceptions = json.load(f)
def check_grouped_section(section):
    section_group_map = {
        "wsurveyor1": "up_data_collection",
        "wsurveyor2": "up_data_collection",
        "wsurveyor3": "up_data_collection",
        "wsurveyor4": "up_data_collection",
        "wsurveyor6": "up_data_collection",
    }
    if section in section_group_map.keys():
        return section_group_map[section]
    return section

def whatsapp():
    # get participant names
    client = pymongo.MongoClient("mongodb://localhost:27017/")
    db = client["whatsappLogs"]
    participants_collection = db["participants"]
    participants = participants_collection.find()


    participant_map = {}
    for participant in participants:
        participant_map[participant["name"]] = participant["addedByName"]
    print(participant_map)

    # init
    extractor = URLExtract()
    data = {"text_msg": {}, "video": {}, "image": {}, "link": {}}
    tmp_data = {"text_msg": {}} # for storing temporary message data
    date_wise_total_count = {}
    date_wise_section_count = {}

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
    tmp_users = []

    directory_path = '../../whatsappMonitor/data/'
    directories = [d for d in os.listdir(directory_path) if os.path.isdir(os.path.join(directory_path, d))]
    latest_modified_directory = sorted(directories, key=lambda x: os.path.getmtime(os.path.join(directory_path, x)), reverse=True)[0]
    # latest_modified_directory = "090623"
    print('../../whatsappMonitor/data/{}/messages.json'.format(latest_modified_directory))
    # cnt = 0
    # for messages_path in glob.iglob('../../whatsappMonitor/data/*/messages.json', recursive=True):
    for messages_path in glob.iglob('../../whatsappMonitor/data/{}/messages.json'.format(latest_modified_directory), recursive=True):
        print(messages_path)
        # cnt+=1
        # if cnt > 2:
        #     break
        with open(messages_path, 'r') as json_file:
            json_list = list(json_file)
        i = 0
        for json_str in json_list:
            # i+=1 
            # if i > 10:
            #     break
            messages_row = json.loads(json_str)
            # if messages_row["chatName"] != "Indian Journalists":
            #     continue
            for message in messages_row["messages"]:
                
                # temporary fix to store data from new people
                if messages_row["userName"] not in participant_map:
                    participant_map[messages_row["userName"]] = "test" # future fix
                    tmp_users.append(messages_row["userName"])
                    # continue
                section = check_grouped_section(participant_map[messages_row["userName"]])
                # print(section)
                # continue
                # if not (section == "bharat"):
                #     continue
                
                # print()
                # i+=1 
                # if i > 10000:
                #     return
                
                print("--")
                print(section)
                print(message["type"])
                print(messages_row["userName"])
                print(message["timestamp"])
                
                print("--")

                if "whatsapp" in group_exceptions:
                    if section in group_exceptions["whatsapp"]:
                        if messages_row["chatName"] in group_exceptions["whatsapp"][section]:
                            continue

                metadata = {
                    "from": message["from"],
                    "to": message["to"] if "to" in message else "",
                    "timestamp": {"$date": datetime.datetime.fromtimestamp(message["timestamp"]).strftime("%Y-%m-%dT%H:%M:%S.000Z")},
                    "chatname": messages_row["chatName"],
                    "forwardingScore": message["forwardingScore"]
                }
                day = datetime.datetime.fromtimestamp(message["timestamp"]).strftime("%Y-%m-%d")
                if day not in date_wise_total_count:
                    date_wise_total_count[day] = 0
                date_wise_total_count[day]+=1

                if section not in date_wise_section_count:
                    date_wise_section_count[section] = {"message": {}, "link": {}, "image": {}, "video": {}}
                for typ in date_wise_section_count[section]:
                    if day not in date_wise_section_count[section][typ]:
                        date_wise_section_count[section][typ][day] = 0

                if message["type"] == "chat":
                    if "body" not in message.keys():
                        continue
                    if message["body"] == "MEDIA":
                        continue
                    date_wise_section_count[section]["message"][day]+=1
                    # store urls
                #     # print(message)message["body"])
                    urls_calc = get_urls(message["body"])
                    urls_stored = list(itertools.chain.from_iterable([get_urls(x["link"]) for x in message["links"]]))
                    urls = list(set([*urls_calc, *urls_stored]))
                    
                    date_wise_section_count[section]["link"][day]+=1

                #     if section not in data["link"]:
                #         data["link"][section] = {}

                    # for url in urls:
                #         if url not in data["link"][section]:
                #             data["link"][section][url] = {
                #                 "senderData": []
                #             }
                #         data["link"][section][url]["senderData"].append(metadata)
                    
                #     #store text messages for clustering section wise
                #     if section not in messages_list:
                #         messages_list[section] = []
                #     messages_list[section].append(message["body"])
                    
                #     if section not in tmp_data["text_msg"]:
                #         tmp_data["text_msg"][section] = {}

                #     if message["body"] not in tmp_data["text_msg"][section]:
                #         tmp_data["text_msg"][section][message["body"]] = {
                #             "senderData": [],
                #             # "frequency": 0
                #         }

                #     if not any(d["timestamp"] == metadata["timestamp"] and d["chatname"] == metadata["chatname"] for d in tmp_data["text_msg"][section][message["body"]]["senderData"]):
                #         tmp_data["text_msg"][section][message["body"]]["senderData"].append(metadata)
                #         # tmp_data["text_msg"][message["body"]]["frequency"]+=1

                elif message["type"] == "image":
                    if "mediaData" not in message: # future
                        continue
                    date_wise_section_count[section]["image"][day]+=1
                elif message["type"] == "video":
                    if "mediaData" not in message: # future
                        continue
                    date_wise_section_count[section]["video"][day]+=1

                # elif message["type"] == "video":
                #     if "mediaData" not in message: # future
                #         continue
                #     video_name = message["mediaData"]["filename"]+"."+ message["mediaData"]["mimetype"][6:]
                #     found = True #tbd
                #     # extracting similar video from cluster
                #     if video_name in video_map:
                #         video_name = video_map[video_name]
                #     else:
                #         found = False

                #     if section not in data["video"]:
                #         data["video"][section] = {}

                #     if video_name not in data["video"][section]:
                #         data["video"][section][video_name] = {
                #             "senderData": [],
                #             "isPresent": found
                #         }
                #     data["video"][section][video_name]["senderData"].append(metadata)

    
whatsapp()