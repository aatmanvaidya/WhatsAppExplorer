# import json
# with open('exceptions.json', 'r') as f:
#     # Load the data from the file using the json module
#     group_exceptions = json.load(f)
# print(group_exceptions)

import pymongo
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["whatsappLogs"]
participants_collection = db["participants"]
participants = participants_collection.find()

participant_map = {}
for participant in participants:
    participant_map[participant["name"]] = participant["addedByName"]
print(participant_map)