import subprocess 
import os

def run_command(command):
    try:
        result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True, shell=True)
        if result.returncode != 0:  
            print(f"Command failed with exit code {result.returncode}")
            print(result.stderr)  
            print(result)
            return result.returncode 
        else:
            return 0 
    except Exception as e:
        print(f"An error occurred: {e}")
        return 1 

def copier():
    # copying media along with older media
    media_directory_old = "../backend/media"
    if not os.path.exists(media_directory_old):
        os.mkdir(media_directory_old)
        
    bash_script = """
    source_folder=/mnt/storage-2tb/kg766/WhatsappMfonitorData/downloaded-media
    destination_folder={}
    for folder in "$source_folder"/*; do
        for file in "$folder"/*; do
            file_name=$(basename "$file")
            if [ ! -e "$destination_folder/$file_name" ]; then  
                ln -s "$file" "$destination_folder/$file_name" 2>/dev/null
            fi
        done
    done
    """.format(media_directory_old)
    if run_command(bash_script) != 0:
        print("Crashed while copying media to {}. Terminating!".format(media_directory_old))
        return False
    
    # copying media 
    media_directory = "../backend/media_wp"
    if not os.path.exists(media_directory):
        os.mkdir(media_directory)
        
    bash_script = """
    source_folder=/mnt/storage-2tb/kg766/WhatsappMonitorData/downloaded-media
    destination_folder={}
    for folder in "$source_folder"/*; do
        for file in "$folder"/*; do
            file_name=$(basename "$file")
            if [ ! -e "$destination_folder/$file_name" ]; then  
                ln -s "$file" "$destination_folder/$file_name" 2>/dev/null
            fi
        done
    done
    """.format(media_directory)
    if run_command(bash_script) != 0:
        print("Crashed while copying media to {}. Terminating!".format(media_directory))
        return False
    
print(copier())