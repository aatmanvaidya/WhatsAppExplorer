import subprocess
import os
from collections import defaultdict

def run_command(command):
    subprocess.run(command, shell=True)

def test():

    temp_directory = "./temp_data"
    if not os.path.exists(temp_directory):
        os.makedirs(temp_directory)

    ##################################################################################################################

    temp_tmk_directory = "{}/vid_tmk".format(temp_directory)
    if not os.path.exists(temp_tmk_directory):
        os.makedirs(temp_tmk_directory)

    # Directory containing the .mp4 files for size comparison
    media_directory = "../backend/media_wp/"
    
    cluster_file = "{}/vidstack.clu".format(temp_directory)

    # Get a list of .tmk files in the source directory
    tmk_files = [file for file in os.listdir(temp_tmk_directory) if file.endswith(".tmk")]

    # Dictionary to store files grouped by size
    files_by_size = defaultdict(list)

    # Group files by size
    for tmk_file in tmk_files:
        tmk_path = os.path.join(temp_tmk_directory, tmk_file)
        mp4_file = os.path.splitext(tmk_file)[0] + ".mp4"
        mp4_path = os.path.join(media_directory, mp4_file)
        
        # Get file size in bytes
        mp4_size = os.path.getsize(mp4_path)
        
        # Group files by their size
        files_by_size[mp4_size].append(tmk_path)
        
    files_by_size = dict(sorted(files_by_size.items(), key=lambda x: x[0]))

    # Process files in batches
    batch_count = 0
    batch_tmk_paths = ""
    threshold = 130000

    with open(cluster_file, "w") as file:
        pass
    
    for mp4_size, tmk_paths in files_by_size.items():
        tmk_paths_str = " ".join(tmk_paths) 
        # print(len)
        
        if len(batch_tmk_paths) + len(tmk_paths_str) > threshold:
            # run clustering
            command = "./tmk/cpp/tmk-clusterize --c1 0.9 --c2 0.9 -s {} >> {} ".format(batch_tmk_paths, cluster_file)
            run_command(command)
            
            batch_count += 1
            batch_tmk_paths = ""
        
        batch_tmk_paths = (batch_tmk_paths + " " + tmk_paths_str).strip()
        
        if len(batch_tmk_paths) > threshold:
            print("Threshold upper limit reached")
            return False
    
    if len(batch_tmk_paths) > 0:
        # run clustering
        command = "./tmk/cpp/tmk-clusterize --c1 0.9 --c2 0.9 -s {} >> {} ".format(batch_tmk_paths, cluster_file)
        run_command(command)
            
        batch_count += 1
        batch_tmk_paths = ""
        
    print(batch_count)
    
print(test())