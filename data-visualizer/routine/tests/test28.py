# import os
# import redis
# import json

# redis_host = "localhost"
# redis_port = 6379
# redis_password = "" 
# r = redis.StrictRedis(host=redis_host, port=redis_port, password=redis_password, decode_responses=True)

# def get_file_data_from_redis(key):
#     try:
#         key_without_extension = os.path.splitext(key)[0]
#         json_string = r.get(key_without_extension)
#         if(json_string):
#             data = json.loads(json_string)
#             return data.get("FileData")
#         else:
#             return ""
#     except Exception as e:
#         print(f"Error: {e}")
#         return ""

# key = input()
# file_data = get_file_data_from_redis(key)
# print(file_data)
import os
import redis
import json

def get_redis_connection():
    redis_host = "localhost"
    redis_port = 6379
    redis_password = "" 

    try:
        connection = redis.StrictRedis(
            host=redis_host,
            port=redis_port,
            password=redis_password,
            decode_responses=True,
            db=1
        )
        connection.ping()  # Check if the connection is alive
        return connection
    except redis.exceptions.ConnectionError as e:
        print(f"Error: Unable to connect to Redis - {e}")
        return None

def get_file_data_from_redis(redis_conn, key):
    try:
        key_without_extension = os.path.splitext(key)[0]
        json_string = redis_conn.get(key_without_extension)
        if json_string:
            data = json.loads(json_string)
            return data.get("FileData")
        else:
            return ""
    except Exception as e:
        print(f"Error: {e}")
        return ""

# Establish a connection to Redis
with get_redis_connection() as redis_conn:
    if redis_conn:
        key = input("Enter the key: ")
        file_data = get_file_data_from_redis(redis_conn, key)
        print(file_data)
