import csv
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client['testDb5']

def get_cluster(cluster_type, file_name):
    collection = db[cluster_type]

    # Query to find messages on the 'whatsapp' platform
    query = {"platform": "whatsapp"}

    # Fetch documents based on the query
    cursor = collection.find(query)
    # Initialize lists to store message_id and cluster_id
    message_ids = []
    cluster_ids = []
    contents = []

    cluster_counter = 1

    for document in cursor:
        msg_ids = [sender_data.get('msg_id') for sender_data in document.get('senderData', [])]
        
        cluster_id = cluster_counter
        cluster_ids.extend([cluster_id] * len(msg_ids))
        
        content = document['content']
        contents.extend([content] * len(msg_ids))
        
        message_ids.extend(msg_ids)
        
        cluster_counter += 1

    print(len(contents))
    print(len(message_ids))
    print(len(cluster_ids))
    # # Create a list of tuples containing message_id and contents
    result_data = list(zip(message_ids, cluster_ids, contents))
    print(len(result_data))

    # Write the result to a CSV file
    csv_file_path = file_name
    with open(csv_file_path, 'w', newline='') as csv_file:
        csv_writer = csv.writer(csv_file)
        csv_writer.writerow(['message_id', 'cluster_id', 'content'])
        csv_writer.writerows(result_data)

    print(f'Data written to {csv_file_path}')


get_cluster("images", "file_msg_id_images.csv")
get_cluster("videos", "file_msg_id_videos.csv")
get_cluster("messages", "file_msg_id_messages.csv")