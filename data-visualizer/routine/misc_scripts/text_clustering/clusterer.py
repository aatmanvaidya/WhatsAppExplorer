import json
from sentence_transformers import SentenceTransformer, util
import numpy as np
from tqdm import tqdm
import csv

def group_similar_sentences(sentences, threshold=0.5):
    model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')

    sentence_embeddings = model.encode(sentences, convert_to_tensor=True)

    similarity_matrix = util.pytorch_cos_sim(sentence_embeddings, sentence_embeddings)

    clusters = []
    visited = set()

    for i in tqdm(range(len(sentences)), desc="Processing Sentences"):
        if i not in visited:
            # for gpu
            similar_indices = np.where(similarity_matrix[i].cpu().numpy() > threshold)[0]
            # for cpu
            # similar_indices = np.where(similarity_matrix[i] > threshold)[0]
            cluster = [sentences[j] for j in similar_indices]
            clusters.append(cluster)
            visited.update(similar_indices)

    return clusters

def save_clusters_to_csv(result_clusters, output_file='clusters.csv'):
    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        csv_writer = csv.writer(csvfile)
        csv_writer.writerow(['Cluster', 'Sentence'])

        for i, cluster in enumerate(result_clusters):
            for sentence in cluster:
                csv_writer.writerow([i + 1, sentence])

if __name__ == "__main__":
    with open('sentences_all.json', 'r') as file:
        sentences = json.load(file)
    similarity_threshold = 0.5
    result_clusters = group_similar_sentences(sentences, similarity_threshold)
    save_clusters_to_csv(result_clusters, output_file='clusters_0_5.csv')
    similarity_threshold = 0.6
    result_clusters = group_similar_sentences(sentences, similarity_threshold)
    save_clusters_to_csv(result_clusters, output_file='clusters_0_6.csv')
    similarity_threshold = 0.7
    result_clusters = group_similar_sentences(sentences, similarity_threshold)
    save_clusters_to_csv(result_clusters, output_file='clusters_0_7.csv')
    similarity_threshold = 0.8
    result_clusters = group_similar_sentences(sentences, similarity_threshold)
    save_clusters_to_csv(result_clusters, output_file='clusters_0_8.csv')
    similarity_threshold = 0.9
    result_clusters = group_similar_sentences(sentences, similarity_threshold)
    save_clusters_to_csv(result_clusters, output_file='clusters_0_9.csv')
