import sys,os,time,json,random,codecs,requests
from urllib.parse import quote, urlparse
from datetime import datetime, timedelta

def scrape(start_date, end_date):
    API_TOKEN = "sIsk6bYTj3wY6CGDU61ExUAahFOCnG1UnjtGCo9S" # diasporawatch dashboard
    list_ids = ["1773643","1773642"]#all_political_{pages,groups}.txt
    command = "curl -s 'https://api.crowdtangle.com/posts?token=" + API_TOKEN + "&listIds=" + (",").join(list_ids) + "&count=100&startDate=" + start_date + "&endDate=" + end_date + "' > /tmp/1"

    directory_path = "/mnt/storage/kg766/facebookData/messages_dump"
    if not os.path.exists(directory_path):
        os.makedirs(directory_path)

    filename = directory_path + "/posts_" + start_date + "_" + end_date + ".jsonl"
    # if os.path.exists(filename):
    #     print(f"Skipping {filename} (already scraped)")
    #     return filename
    out = open(filename,"w")

    while (True):
        os.system(command)
        f = open("/tmp/1")
        linex = f.read().strip()
        out.write(linex + "\n")
        f.close()
        try:
            json_data = json.loads(linex)
            break
        except:
            print("error1 sleeping", file=sys.stderr)
            time.sleep(20)
            pass

    time.sleep(20)
    if("nextPage" in json_data["result"]["pagination"]):
        nextQuery = json_data["result"]["pagination"]["nextPage"]
    else:
        print("only one page", file=sys.stderr)
        sys.exit()

    """
    for result in json_data["result"]["posts"]:
        groupid = result["account"]["url"]
        name = result["account"]["name"]
        print(groupid + "\t" + name)
    """

    while(nextQuery):
        command = "curl -s '" + nextQuery + "' > /tmp/1"
        print(command,file=sys.stderr)
        os.system(command)

        #command2 = "cat /tmp/1 >> posts_bihar.txt"
        #os.system(command2)
        f1 = open("/tmp/1")
        linex = f1.read().strip()
        out.write(linex + "\n")
        f1.close()
        try:
            json_data = json.loads(linex)
        except:
            print("error2", file=sys.stderr)
            continue

        if("nextPage" in json_data["result"]["pagination"]):
            nextQuery = json_data["result"]["pagination"]["nextPage"]
        else:
            nextQuery = ""
        
        """
        for result in json_data["result"]["posts"]:
            groupid = result["account"]["url"]
            name = result["account"]["name"]
            print(groupid + "\t" + name)
        """

        rand_int = random.randint(20,25)
        time.sleep(rand_int)
    #    except:
    #        print("query missed",query,file=sys.stderr)
    #        time.sleep(10)
    #        pass

    #    break
    out.close()
    return filename

def download_media_files(jsonl_file):
    media_dir = "/mnt/storage/kg766/facebookData/media"
    os.makedirs(media_dir, exist_ok=True)

    with open(jsonl_file, "r") as file:
        for line in file:
            data = json.loads(line)

            posts = data["result"]["posts"]

            for post in posts:
                if "media" in post:
                    media_list = post["media"]

                    for media in media_list:
                        media_url = media["url"]
                        media_type = media["type"]
                        file_name = os.path.basename(urlparse(media_url).path)

                        if not os.path.splitext(file_name)[1]:
                            if media_type == "video":
                                # file_name += ".mp4"
                                continue
                            else:
                                file_name += ".jpg"
                                
                        file_path = os.path.join(media_dir, file_name)

                        if os.path.exists(file_path):
                            print(f"Skipping {media_type} file (already downloaded): {file_name}")
                            continue

                        response = requests.get(media_url)
                        if response.status_code == 200:
                            with open(os.path.join("media", file_name), "wb") as f:
                                f.write(response.content)
                            print(f"Downloaded {media_type}: {file_name}")
                        else:
                            print(f"Failed to download {media_type}: {file_name}")
os.chdir("/home/kg766/dataVisualiser/facebook")
today = datetime.now().date()
# today = today - timedelta(days=1)
one_day_before = today - timedelta(days=1)
filename = scrape(str(one_day_before), str(today))
# filename = "messages_dump/posts_2023-06-03_2023-06-04.jsonl"
download_media_files(filename)
