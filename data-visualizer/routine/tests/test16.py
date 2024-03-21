import subprocess
import os

def run_command(command):
    subprocess.run(command, shell=True)

# temp_directory = "./temp_data"
# if not os.path.exists(temp_directory):
#     os.makedirs(temp_directory)

# temp_tmk_directory = "{}/vid_tmk".format(temp_directory)
# if not os.path.exists(temp_tmk_directory):
#     os.makedirs(temp_tmk_directory)
# run_command("rm -rf {}/*".format(temp_tmk_directory))

media_directory = "../backend/media"
if not os.path.exists(media_directory):
        os.mkdir(media_directory)

bash_script = """
source_folder=~/whatsappMonitor/downloaded-media
destination_folder={}
for folder in "$source_folder"/*; do
    for file in "$folder"/*; do
        file_name=$(basename "$file")
        if [ ! -e "$destination_folder/$file_name" ]; then  # Check if the link doesn't already exist
            ln -s "$file" "$destination_folder/$file_name"
        fi
    done
done
""".format(media_directory)

run_command(bash_script)


# # # media_directory = "../backend/media_tel"
# # # if not os.path.exists(media_directory):
# # #     os.mkdir(media_directory)
# # # # run_command("rm -rf {}".format(media_directory))
# # # # run_command("mkdir {}".format(media_directory))
# # # run_command('find /home/paras/telegram-backend/media/ -type f \( -name "*.jpg" -o -name "*.jpeg" \) -print0 | xargs -0 ln -s -t {}'.format(media_directory))

# media_directory = "../backend/media"
# # if not os.path.exists(media_directory):
# #     os.mkdir(media_directory)
# # # run_command("rm -rf {}".format(media_directory))
# # # run_command("mkdir {}".format(media_directory))
# # # run_command("cp ../facebook/media/* {}".format(media_directory))
# # run_command('find ../facebook/media/ -type f \( -name "*.jpg" -o -name "*.jpeg" \) -print0 | xargs -0 ln -s -t {}'.format(media_directory))

# temp_directory = "./temp_data_fb2"
# if not os.path.exists(temp_directory):
#     os.makedirs(temp_directory)

# # compute photo clusters

# print("Computing Image Clusters...")
# # run_command("make -C ./pdq")
# # run_command("(find -L {} -name '*.*g' -print0   | xargs -0 ./pdq/bin/pdq-photo-hasher-tool --details) > {}/haystack.hsh".format(media_directory, temp_directory))
# # run_command("(find -L {} -name '*.*g' -print0 | xargs -0 readlink -f | xargs -0 ./pdq/bin/pdq-photo-hasher-tool --details) > {}/haystack.hsh".format(media_directory, temp_directory))
# # run_command("(find -L {} -name '*.*g' -print0 | xargs -0 ls -l | awk '{{print $NF}}' | xargs -0 ./pdq/bin/pdq-photo-hasher-tool --details) > {}/haystack.hsh".format(media_directory, temp_directory))
# # run_command("(find -L {} -name '*.*g' -print0 | xargs -0 ls -l | awk '{{print $NF}}' ) > {}/haystack.hsh".format(media_directory, temp_directory))
# # run_command("(find -L {} -name '*.*g' -print0 | xargs -0 ls -l | awk '{{print $NF}}' | xargs -I{} -0 ./pdq/bin/pdq-photo-hasher-tool --details) > {}/haystack.hsh".format(media_directory, temp_directory))
# # run_command("(find -L {} -name '*.*g' -print0 | xargs -0 ls -l | awk '{{printf \"%s\\0\", $NF}}' | xargs -0 ./pdq/bin/pdq-photo-hasher-tool --details) > {}/haystack.hsh".format(media_directory, temp_directory))

# # run_command("./pdq/bin/clusterize256-tool -d 63 {}/haystack.hsh > {}/haystack.clu".format(temp_directory, temp_directory))
# print("Computed Image Clusters")
# # find -L ../backend/media_fb -name '*.*g' -print0 | xargs -0 ls -l | awk '{{printf \"%s\\0\", $NF}}'
# # run_command("""
# #             for v in {}/*.mp4; do
# #             ./tmk/cpp/tmk-hash-video -f /usr/bin/ffmpeg -i $v -d {}
# #             done
# #             """.format(media_directory, temp_directory))