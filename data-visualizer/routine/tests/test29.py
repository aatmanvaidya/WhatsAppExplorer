from pymongo import MongoClient
from gridfs import GridFS
from gridfs.errors import NoFile
import json

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['whatsappLogs']
messages_collection = db['messages']
gridfs = GridFS(db, collection='largeFiles')

# Retrieve documents from the messages collection
messages = messages_collection.find()

# Iterate through the messages and fetch actual values from GridFS
for message in messages[:5]:
    file_id = message['messages']['filename']
    print(message)
    try:
        if message["messages"]['length'] > 0:
            file_object = gridfs.find_one({'filename': file_id})
            # Assuming the content is text, you can decode it appropriately
            content = file_object.read().decode('utf-8')
            # Replace the 'messages' field in the document with actual content
            message['messages'] = json.loads(content)
            # Print the updated message document
            # print(len(message['messages']))
            print(message)
        
    except NoFile:
        print(f"No file found in GridFS with _id: {file_id}")
