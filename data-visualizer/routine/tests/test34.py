import re
import os

pattern = re.compile(r'clidx=(\d+).*filename=(.+)')

file_clusters = {}
with open('temp_data/output.txt', 'r') as file:
    for line in file:
        match = pattern.search(line)
        if match:
            clidx = match.group(1)
            filename_basename = os.path.basename(match.group(2))
            file_clusters.setdefault(clidx, []).append(filename_basename)


image_map = {}
for clidx, filenames in file_clusters.items():
    head_filename = filenames[0] 
    for filename in filenames:
        image_map[filename] = head_filename
        alt_filename = filename[:11]+filename[18:]
        image_map[alt_filename] = head_filename
del file_clusters
print(len(image_map))