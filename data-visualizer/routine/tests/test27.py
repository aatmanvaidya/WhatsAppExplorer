import os
import csv
import pymongo
import uuid
import json

# csv_file_path = "./temp_data/text_message_unique_id.csv"
# csv_file_check = os.path.exists(csv_file_path)
# text_message_uid_map = {}

# # Load existing data from the CSV file into a map
# if csv_file_check:
#     with open(csv_file_path, 'r') as csvfile:
#         reader = csv.DictReader(csvfile)
#         for row in reader:
#             text_message_uid_map[row['message']] = row['uuid']

# try:
#     with open(csv_file_path, 'a', newline='') as csvfile:
#         fieldnames = ['message', 'uuid']
#         writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

#         if not csv_file_check:
#             writer.writeheader()
            
#         for message in messages:
#             if message not in text_message_uid_map:
#                 text_message_uid_map[message] = str(uuid.uuid4())
#                 writer.writerow({'message': message, 'uuid': text_message_uid_map[message]})
messages = ["hi", "helloe world", "hi"]

client = pymongo.MongoClient("mongodb://localhost:27017/")
  
db_main = client["testDb5"]
collection = db_main["messagesUuidMap"]
text_message_uuid_map = {doc['message']: doc['uuid'] for doc in collection.find()}

print(text_message_uuid_map)

for message in messages:
    if message not in text_message_uuid_map:
        uid = str(uuid.uuid4())
        text_message_uuid_map[message] = uid
        # collection.insert_one({'message': message, 'uuid': uid})
print(text_message_uuid_map)

with open("./uuid.json", "w", encoding='utf8') as outfile:
    json.dump([{'message': message, 'uuid': uid} for message, uid in text_message_uuid_map.items()], outfile, ensure_ascii=False)

# mongoimport --db testDb5 --collection messagesUuidMap --file ./uuid.json --legacy
mongoimport --jsonArray --db testDb5 --collection messagesUuidMap --file ./uuid.json --legacy