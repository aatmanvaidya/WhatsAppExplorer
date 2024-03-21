import csv
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client['testDb5']
collection = db['images']

# Query to find messages on the 'whatsapp' platform
query = {"platform": "whatsapp"}

# Fetch documents based on the query
cursor = collection.find(query)
# Initialize lists to store message_id and cluster_id
message_ids = []
# cluster_ids = []
contents = []

# # Initialize cluster_id counter
# cluster_counter = 1

# Iterate over the documents
for document in cursor:
    # Extract msg_id values from senderData
    msg_ids = [sender_data.get('msg_id') for sender_data in document.get('senderData', [])]
    
    # # Assign cluster_id and append to the lists
    # cluster_id = cluster_counter
    # cluster_ids.extend([cluster_id] * len(msg_ids))
    
    content = document['content']
    contents.extend([content] * len(msg_ids))
    
    message_ids.extend(msg_ids)
    
    # # Increment the cluster_id counter
    # cluster_counter += 1
    

# # Create a list of tuples containing message_id and cluster_id
# result_data = list(zip(message_ids, cluster_ids))

# # Write the result to a CSV file
# csv_file_path = 'msg_id_videos.csv'
# with open(csv_file_path, 'w', newline='') as csv_file:
#     csv_writer = csv.writer(csv_file)
#     csv_writer.writerow(['message_id', 'cluster_id'])
#     csv_writer.writerows(result_data)

# print(f'Data written to {csv_file_path}')


# Create a list of tuples containing message_id and contents
result_data = list(zip(contents, message_ids))

# Write the result to a CSV file
csv_file_path = 'file_msg_id_images.csv'
with open(csv_file_path, 'w', newline='') as csv_file:
    csv_writer = csv.writer(csv_file)
    csv_writer.writerow(['content', 'message_id'])
    csv_writer.writerows(result_data)

print(f'Data written to {csv_file_path}')
