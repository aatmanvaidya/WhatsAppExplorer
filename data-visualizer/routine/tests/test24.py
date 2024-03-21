[import os

temp_directory = "./temp_data"
haystack_file_path = "{}/haystack.hsh".format(temp_directory)

t = set()
if os.path.exists(haystack_file_path):
    with open(haystack_file_path, 'r') as haystack_file:
        for line in haystack_file:
            try:
                hash_name = line.split(",norm")[0].strip().split("hash=")[-1]
                if(len(hash_name) != 64):
                    print(line)
            except:
                print("Error while reading {}: {}".format(haystack_file_path, line))
                
print(t)