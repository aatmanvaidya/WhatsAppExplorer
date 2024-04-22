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

def run_command(command):
    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True, shell=True)
    # print(result)
    if result.stderr:
        print(result.stderr)
    return result.stdout
    
with open('exceptions.json', 'r') as f:
    # Load the data from the file using the json module
    group_exceptions = json.load(f)

def facebook():
    res = {}
    # read messages file
    # print("Reading Messages File")
    messages_list = {}

    directory_path = '../facebook/messages_dump/'    
    section = "test"
    
    if "facebook" in group_exceptions:
        if section in group_exceptions["facebook"]:
            if group_name in group_exceptions["facebook"][section]:
                return

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
                        if post["account"]["name"] not in res:
                            res[post["account"]["name"]] = 0
                        res[post["account"]["name"]]+=1
    # print(res)
    res = dict(sorted(res.items(), key=lambda item: item[1], reverse=True))

    for key in res:
        print(key, res[key])

    # with open('analyse_fb_db.json', 'w') as fp:
    #     json.dump(res, fp)

facebook()