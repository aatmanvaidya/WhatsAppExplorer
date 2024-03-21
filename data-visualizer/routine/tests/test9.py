from text_clusterer import get_clusters


messages = [
    "Hey, how's it going? 😃",
    "I'm doing well, thanks for asking. How about you? 🤔",
    "Not too bad. Just trying to get some work done. 💻",
    "Yeah, I hear you. I have a lot to do too. 📚",
    "Well, good luck with your work. Have a great day! 👋",
    "Well, good luck with your work Have a great day! ",
    "Thank you so much ",
    "Thank you ",
    "Thank you!",
]

num_clusters, cluster_messages = get_clusters(messages, num_clusters=5)

for i, cluster in enumerate(cluster_messages):
    print(f"Cluster {i+1}:")
    for original_message in cluster:
        print(f"- Original message: {original_message}")
        # print(f"  Cleaned message: {cleaned_message}")
