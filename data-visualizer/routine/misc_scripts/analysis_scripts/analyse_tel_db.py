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
j.,
pattern = r'[^\w\s]|[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF]'

os.chdir("/home/kg766/dataVisualiser/routine")

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
    res = {}
    # group to id map
    url = "https://tapi.whats-viral.me/get_channels" 
    
    response = requests.get(url)
    group_id_name_map = {}

    if response.status_code == 200: 
        data = response.json()
        group_id_name_map = {item["telegram_id"]: item["title"] for item in data}
    else:
        print("Request failed with status code:", response.status_code)

    # init
    extractor = URLExtract()
    data = {"text_msg": {}, "image": {}, "link": {}}
    tmp_data = {"text_msg": {}} # for storing temporary message data

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
        if group_name not in res:
            res[group_name] = 0
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
                res[group_name]+=1
    # print(res)
    cnt = 0
    for g in res:
        if res[g] == 0:
            cnt+=1
    res = sorted(res.keys(), reverse=True)

    print(cnt)
    with open('analyse_tel_db2.json', 'w') as fp:
        json.dump(res, fp)

telegram()

