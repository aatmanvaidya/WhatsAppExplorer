import numpy as np
from scipy.sparse import vstack
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import MiniBatchKMeans
from sklearn.metrics.pairwise import cosine_similarity
import re

def get_clean_message(message):
    # Remove special characters and emojis from message
    clean_message = re.sub('[^A-Za-z0-9\s]+', '', message)
    return clean_message.strip()

def get_clusters(messages, num_clusters=600):
    # Define batch size and number of batches dynamically
    total_messages = len(messages)
    batch_size = 10000
    num_batches = int(np.ceil(total_messages / batch_size))

    # Clean messages
    cleaned_messages = [get_clean_message(message) for message in messages]

    # Define similarity metric (cosine similarity)
    vectorizer = TfidfVectorizer(max_features=50000, stop_words='english')
    similarity_matrix = vectorizer.fit_transform(cleaned_messages)

    # Cluster messages using mini-batch k-means algorithm
    num_clusters = min(num_clusters, len(messages))
    kmeans = MiniBatchKMeans(n_clusters=num_clusters, batch_size=batch_size, random_state=0, n_init=3).fit(similarity_matrix)

    # Print cluster labels and messages
    cluster_messages = [[] for i in range(num_clusters)]
    for i in range(num_batches):
        start_index = i * batch_size
        end_index = min((i+1) * batch_size, total_messages)
        batch_messages = cleaned_messages[start_index:end_index]
        tfidf = vectorizer.transform(batch_messages)
        batch_similarity = cosine_similarity(tfidf, kmeans.cluster_centers_)
        batch_labels = np.argmax(batch_similarity, axis=1)
        for j in range(len(batch_messages)):
            original_message_index = start_index + j
            original_message = messages[original_message_index]
            cluster_messages[batch_labels[j]].append((original_message, batch_messages[j]))
    
    return num_clusters, cluster_messages
