import time
import json

# Initialize an empty dictionary to store execution times
time_log = {}

# Function or block of code to measure execution time
def data_dump():
    start_time = time.time()

    # Your few lines of code here (data dump)
    time.sleep(1)  # Example delay

    # Log the execution time of "data dump" in milliseconds
    time_log["data_dump"] = (time.time() - start_time)

    # Print the execution time
    print("Execution time of 'data_dump':", time_log["data_dump"], "seconds")

# Call the function or block of code to measure execution time
data_dump()

# Store the time log in a JSON file
with open('time_log.json', 'w') as f:
    json.dump(time_log, f)
