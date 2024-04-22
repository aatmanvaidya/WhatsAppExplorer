import glob
import json
import os
import datetime
import pymongo

client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["whatsappLogs"]
participants_collection = db["participants"]
participants = participants_collection.find()

participant_map = {}
for participant in participants:
    participant_map[participant["name"]] = [participant["addedByName"]] # breaking assumption, a username should be unique to one group
print(participant_map)

tmp = []

directory_path = '../../whatsappMonitor/data/'
directories = [d for d in os.listdir(directory_path) if os.path.isdir(os.path.join(directory_path, d))]
latest_modified_directory = sorted(directories, key=lambda x: os.path.getmtime(os.path.join(directory_path, x)), reverse=True)[0]

for messages_path in glob.iglob('../../whatsappMonitor/data/{}/messages.json'.format(latest_modified_directory), recursive=True):
    
    with open(messages_path, 'r') as json_file:
        json_list = list(json_file)
    for json_str in json_list:
        messages_row = json.loads(json_str)
        for message in messages_row["messages"]:
            
            # temporary fix to store data from new people
            if messages_row["userName"] not in participant_map:
                participant_map[messages_row["userName"]] = ["test"] # future fix
                # continue
            if "bharat" not in participant_map[messages_row["userName"]]:
                continue
            metadata = {
                "from": message["from"],
                "to": message["to"] if "to" in message else "",
                "timestamp": {"$date": datetime.datetime.fromtimestamp(message["timestamp"]).strftime("%Y-%m-%dT%H:%M:%S.000Z")},
                "chatname": messages_row["chatName"],
                "section": participant_map[messages_row["userName"]]
            }

            if message["type"] == "image":
                if "mediaData" not in message: # future
                    continue
                image_name = message["mediaData"]["filename"]+"."+ message["mediaData"]["mimetype"][6:]
                tmp.append((image_name, int(message["timestamp"]), metadata["timestamp"]))

sorted_list = sorted(tmp, key=lambda x: x[1])
print(sorted_list)
