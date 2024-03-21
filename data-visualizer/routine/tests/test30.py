import csv
import os

input_file_path = './temp_data/haystack.clu'
output_file_path = 'dump_img.csv'

csv_data = []

with open(input_file_path, 'r') as file:
    for line in file:
        cluster = line.split('clidx=')[1].split(',')[0]
        hash_value = line.split('hash=')[1].split(',')[0]
        filename = line.split('filename=')[1].split('/')[-1].strip()        # print(filename)
        csv_data.append([cluster, filename])

with open(output_file_path, 'w', newline='') as csv_file:
    csv_writer = csv.writer(csv_file)
    csv_writer.writerow(['cluster_id', 'file_id'])
    csv_writer.writerows(csv_data)

print(f"CSV file '{output_file_path}' generated successfully.")
# import csv

# input_file_path = './temp_data/vidstack.clu'
# output_file_path = 'dump_vid.csv'

# csv_data = []

# with open(input_file_path, 'r') as file:
#     for line in file:
#         if line != "\n":
#             clidx = line.split('clidx=')[1].split(',')[0]
#             filename = line.split('filename=')[1].strip()um
#             filename = filename.replace('.tmk', '.mp4')
#             csv_data.append([clidx, filename])

# with open(output_file_path, 'w', newline='') as csv_file:
#     csv_writer = csv.writer(csv_file)
#     csv_writer.writerow(['cluster_id', 'file_id'])
#     csv_writer.writerows(csv_data)

# print(f"CSV file '{output_file_path}' generated successfully.")

