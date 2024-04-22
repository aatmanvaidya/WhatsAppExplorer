import os
import subprocess 

def run_command(command):
    try:
        result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True, shell=True)
        if result.returncode != 0:  
            print(result)
            print(f"Command failed with exit code {result.returncode}")
            print(result.stderr)  
            return result.returncode 
        else:
            return 0 
    except Exception as e:
        print(f"An error occurred: {e}")
        return 1 

def compute_video_clusters():
    if not os.path.exists("/home/kg766/dataVisualiser/routine/temp_data/vid_tmk"):
        os.makedirs("/home/kg766/dataVisualiser/routine/temp_data/vid_tmk")
    os.chdir("/home/kg766/dataVisualiser/routine/temp_data/vid_tmk")
    
    cluster_file = "../vidstack_tmp.clu"

    command = "ls | ../../tmk/cpp/tmk-clusterize --c1 0.9 --c2 0.9 -s -i > {}".format(cluster_file)
    if run_command(command) != 0:
        print("Video clustering failed. Terminating")
        return 1
        
    print("Videos clustered successfully")
    
    os.chdir("/home/kg766/dataVisualiser/routine")
    
    return 0

compute_video_clusters()