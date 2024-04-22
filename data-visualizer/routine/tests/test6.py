import pymongo

# Connect to the MongoDB instance
client = pymongo.MongoClient("mongodb://localhost:27017/")

# Get the "whatsappLogs" database
db = client["whatsappLogs"]

# Get the "participants" collection
participants_collection = db["participants"]

# Find all documents in the "participants" collection
participants = participants_collection.find()

addedBy = {}
for participant in participants:
    if participant["addedByName"] not in addedBy:
        addedBy[participant["addedByName"]] = []
    addedBy[participant["addedByName"]].append(participant["name"])

print(addedBy)