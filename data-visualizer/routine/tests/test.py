from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity

# Load messages
messages = ['Hello, how are you?', 'Hey there, how are you doing?', 'Good morning, how are you today?', 'Hi, how are you feeling?', 'What’s up?', 'Howdy!']

# Define similarity metric (cosine similarity)
tfidf_vectorizer = TfidfVectorizer()
tfidf = tfidf_vectorizer.fit_transform(messages)
similarity_matrix = cosine_similarity(tfidf)

# Cluster messages using k-means algorithm
num_clusters = 8
kmeans = KMeans(n_clusters=num_clusters, random_state=0).fit(similarity_matrix)

# Print cluster labels and messages
for i in range(num_clusters):
    print("Cluster", i, "messages:")
    for j in range(len(messages)):
        if kmeans.labels_[j] == i:
            print("-", messages[j])
