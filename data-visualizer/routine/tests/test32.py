from sentence_transformers import SentenceTransformer, util
import numpy as np
from pymongo import MongoClient
from gridfs import GridFS
import json
import datetime

def group_similar_sentences(sentences, threshold=0.5):
    # Load pre-trained Sentence Transformer model with Hindi support
    model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')

    # Encode sentences to get embeddings
    sentence_embeddings = model.encode(sentences, convert_to_tensor=True)

    # Compute cosine similarity matrix
    similarity_matrix = util.pytorch_cos_sim(sentence_embeddings, sentence_embeddings)

    # Initialize clusters
    clusters = []
    visited = set()

    # Group similar sentences based on threshold
    for i in range(len(sentences)):
        if i not in visited:
            similar_indices = np.where(similarity_matrix[i] > threshold)[0]
            cluster = [sentences[j] for j in similar_indices]
            clusters.append(cluster)
            visited.update(similar_indices)

    return clusters

def get_sentences_from_mongodb():
    client = MongoClient("mongodb://localhost:27017/")
    db = client["whatsappLogs"]
    messages_collection = db['messages']
    gridfs = GridFS(db, collection='largeFiles')

    messages = messages_collection.find()

    sentences = []

    for messages_row in messages:
        try:
            if messages_row["messages"]['length'] > 0:
                file_object = gridfs.find_one({'filename': messages_row['messages']['filename']})
                content = file_object.read().decode('utf-8')
                messages_row['messages'] = json.loads(content)
        except:
            continue

        for message in messages_row["messages"]:

            if "author" not in message:
                continue

            # Add your logic to extract sentences from messages
            # For example, you can add sentences from the 'body' field of text messages
            if message["type"] in ["chat"] and "body" in message:
                sentences.append(message["body"])

    return sentences

if __name__ == "__main__":
    # Get sentences from MongoDB
    example_sentences = get_sentences_from_mongodb()
    with open('sentences_all.json', 'w') as file:
        json.dump(example_sentences, file)

    # # Set similarity threshold
    # similarity_threshold = 0.8

    # # Group similar sentences
    # result_clusters = group_similar_sentences(example_sentences, similarity_threshold)

    # # Print the result
    # for i, cluster in enumerate(result_clusters):
    #     print(f"Cluster {i + 1}:")
    #     for sentence in cluster:
    #         print(f"  - {sentence}")
