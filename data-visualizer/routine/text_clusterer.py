import numpy as np
from scipy.sparse import vstack
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import MiniBatchKMeans
from sklearn.metrics.pairwise import cosine_similarity
import re

def get_clusters(messages, num_clusters=600):
    # pattern = r'[^\w\s]|[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF]'
    # messages = [re.sub(pattern, '', message) for message in messages]

    # Define batch size and number of batches dynamically
    total_messages = len(messages)
    batch_size = 10000
    num_batches = int(np.ceil(total_messages / batch_size))

    # Define similarity metric (cosine similarity)
    vectorizer = TfidfVectorizer(max_features=50000, stop_words='english')
    similarity_matrix = vectorizer.fit_transform(messages)

    # Cluster messages using mini-batch k-mechinese_tokenizerans algorithm
    num_clusters = min(num_clusters, len(messages))
    kmeans = MiniBatchKMeans(n_clusters=num_clusters, batch_size=batch_size, random_state=0, n_init=3).fit(similarity_matrix)

    # Print cluster labels and messages
    cluster_messages = [[] for i in range(num_clusters)]
    for i in range(num_batches):
        start_index = i * batch_size
        end_index = min((i+1) * batch_size, total_messages)
        batch_messages = messages[start_index:end_index]
        tfidf = vectorizer.transform(batch_messages)
        batch_similarity = cosine_similarity(tfidf, kmeans.cluster_centers_)
        batch_labels = np.argmax(batch_similarity, axis=1)
        for j in range(len(batch_messages)):
            cluster_messages[batch_labels[j]].append(batch_messages[j])
    
    return num_clusters, cluster_messages
