import json
import csv

with open('analyse_tel_db.json', 'r') as json_file:
    data = json.load(json_file)

# Create a set to store the keys from the CSV
keys_to_filter = set()

# Read the keys from the CSV file
with open('ana_channels.csv', 'r') as csv_file:
    csv_reader = csv.reader(csv_file)
    for row in csv_reader:
        keys_to_filter.add(row[0])

# print(keys_to_filter)
# print(len(data.keys()))
# # Filter the JSON object
filtered_data = {key: value for key, value in data.items() if key in keys_to_filter}
for key in keys_to_filter:
    if key not in filtered_data:
        filtered_data[key] = 0
# print(len(keys_to_filter))
# print(len(filtered_data))
# # Print the filtered JSON object
# print(json.dumps(filtered_data, indent=4))
# Sort the JSON object by values in decreasing order
sorted_data = dict(sorted(filtered_data.items(), key=lambda item: item[1], reverse=True))

# Print the sorted JSON object
for key in sorted_data:
    print(key, sorted_data[key])
