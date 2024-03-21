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
from gridfs import GridFS
from gridfs.errors import NoFile
from collections import defaultdict

with open('exceptions.json', 'r') as f:
    # Load the data from the file using the json module
    group_exceptions = json.load(f)
    
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
        "max": "brown"
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
    print("Reading Messages Database")
    messages_list = {}
    tmp_users = []

    messages_collection = db['messages']
    gridfs = GridFS(db, collection='largeFiles')

    messages = messages_collection.find()
    # cnt = 0
    # for messages_path in glob.iglob('../../whatsappMonitor/data/*/messages.json', recursive=True):

    for messages_row in messages:
        try:
            if messages_row["messages"]['length'] > 0:
                file_object = gridfs.find_one({'filename': messages_row['messages']['filename']})
                content = file_object.read().decode('utf-8')
                messages_row['messages'] = json.loads(content)
        except:
            continue
        
        for message in messages_row["messages"]:
            
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
            print()
            print(message)
            # print(message["msg_id"])
            metadata = {
                "from": message["author"],
                "to": message["to"] if "to" in message else "",
                "timestamp": {"$date": datetime.datetime.fromtimestamp(message["timestamp"]).strftime("%Y-%m-%dT%H:%M:%S.000Z")},
                "chatname": messages_row["chatName"],
                "forwardingScore": message["forwardingScore"],
            }
            if "msg_id" in message.keys():
                metadata["msg_id"] = message["msg_id"]
            else:
                metadata["msg_id"] = message["id"]["_serialized"]
            print(metadata)
            
#             day = datetime.datetime.fromtimestamp(message["timestamp"]).strftime("%Y-%m-%d")
#             if day not in date_wise_total_count:
#                 date_wise_total_count[day] = 0
#             date_wise_total_count[day]+=1

#             if section not in date_wise_section_count:
#                 date_wise_section_count[section] = {"message": {}, "link": {}, "image": {}, "video": {}}
#             for typ in date_wise_section_count[section]:
#                 if day not in date_wise_section_count[section][typ]:
#                     date_wise_section_count[section][typ][day] = 0

#             if message["type"] == "chat":
#                 if "body" not in message.keys():
#                     continue
#                 if message["body"] == "MEDIA":
#                     continue
#                 date_wise_section_count[section]["message"][day]+=1
#                 # store urls
#             #     # print(message)message["body"])
#                 urls_calc = get_urls(message["body"])
#                 urls_stored = list(itertools.chain.from_iterable([get_urls(x["link"]) for x in message["links"]]))
#                 urls = list(set([*urls_calc, *urls_stored]))
                
#                 date_wise_section_count[section]["link"][day]+=1

#             #     if section not in data["link"]:
#             #         data["link"][section] = {}

#                 # for url in urls:
#             #         if url not in data["link"][section]:
#             #             data["link"][section][url] = {
#             #                 "senderData": []
#             #             }
#             #         data["link"][section][url]["senderData"].append(metadata)
                
#             #     #store text messages for clustering section wise
#             #     if section not in messages_list:
#             #         messages_list[section] = []
#             #     messages_list[section].append(message["body"])
                
#             #     if section not in tmp_data["text_msg"]:
#             #         tmp_data["text_msg"][section] = {}

#             #     if message["body"] not in tmp_data["text_msg"][section]:
#             #         tmp_data["text_msg"][section][message["body"]] = {
#             #             "senderData": [],
#             #             # "frequency": 0
#             #         }

#             #     if not any(d["timestamp"] == metadata["timestamp"] and d["chatname"] == metadata["chatname"] for d in tmp_data["text_msg"][section][message["body"]]["senderData"]):
#             #         tmp_data["text_msg"][section][message["body"]]["senderData"].append(metadata)
#             #         # tmp_data["text_msg"][message["body"]]["frequency"]+=1

#             elif message["type"] == "image":
#                 if "mediaData" not in message: # future
#                     continue
#                 date_wise_section_count[section]["image"][day]+=1
#             elif message["type"] == "video":
#                 if "mediaData" not in message: # future
#                     continue
#                 date_wise_section_count[section]["video"][day]+=1

#             # elif message["type"] == "video":
#             #     if "mediaData" not in message: # future
#             #         continue
#             #     video_name = message["mediaData"]["filename"]+"."+ message["mediaData"]["mimetype"][6:]
#             #     found = True #tbd
#             #     # extracting similar video from cluster
#             #     if video_name in video_map:
#             #         video_name = video_map[video_name]
#             #     else:
#             #         found = False

#             #     if section not in data["video"]:
#             #         data["video"][section] = {}

#             #     if video_name not in data["video"][section]:
#             #         data["video"][section][video_name] = {
#             #             "senderData": [],
#             #             "isPresent": found
#             #         }
#             #     data["video"][section][video_name]["senderData"].append(metadata)
#     print(date_wise_total_count)
#     sorted_dates = sorted(date_wise_total_count.keys(), reverse=True)

#     for date in sorted_dates:
#         print(date, date_wise_total_count[date])

#     print()
#     print("---------")
#     print()
#     for section in date_wise_section_count:
#         print(section)
#         overall_total  = 0
#         for typ in date_wise_section_count[section]:
#             print("# " + typ)
#             sorted_dates = sorted(date_wise_section_count[section][typ].keys(), reverse=True)
#             total = 0
#             for date in sorted_dates:
#                 print(date, date_wise_section_count[section][typ][date])
#                 total += date_wise_section_count[section][typ][date]
#             print()
#             print("TOTAL: ", total)
#             print()
#             overall_total += total
#         print()
#         print("OVERALL TOTAL: ", overall_total)
#         print()
#         print("---------")
#         print()

    
whatsapp()