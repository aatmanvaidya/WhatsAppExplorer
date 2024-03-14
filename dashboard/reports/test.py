# import pandas as pd

# # Load data from f1.csv and f2.csv
# f1 = pd.read_csv('Report-121023.csv')
# f2 = pd.read_csv('political_data.csv')

# # Perform a left join on 'clientId' column
# result = f1.merge(f2, left_on='ID', right_on='clientId', how='left')

# # Save the result to new.csv
# result.to_csv('new.csv', index=False)

# # Print the list of client IDs from f2 that were not found in f1
# unmatched_client_ids = f2[~f2['clientId'].isin(result['ID'])]['clientId']
# print("Client IDs from f2 not found in f1:")
# print(unmatched_client_ids)

import pandas as pd
import matplotlib.pyplot as plt

# Load data from new.csv
data = pd.read_csv('Report-181023.csv')

# Filter out rows where political data is available
data_with_political_data = data.dropna(subset=['INC', 'ApnaDal', 'SP', 'RLD', 'BJP', 'BSP'])

# Count the political inclination of participants
political_counts = data_with_political_data[['INC', 'ApnaDal', 'SP', 'RLD', 'BJP', 'BSP']].apply(pd.Series.value_counts)

# Plot a pie chart
labels = political_counts.index
sizes = political_counts.sum(axis=1)
plt.figure(figsize=(8, 8))
plt.pie(sizes, labels=labels, autopct='%1.1f%%')
plt.title('Political Inclination of Participants')

# Save the figure as a file (e.g., as a PNG)
plt.savefig('political_inclination_pie_chart.png')

# Show the plot
plt.show()
