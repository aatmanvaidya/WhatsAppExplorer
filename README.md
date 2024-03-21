# WhatsApp Explorer : A WhatsApp Data Collection Tool
Code for WhatsApp Explorer https://whatsapp.whats-viral.me/

## Introduction
Whatsapp Explorer is an end-to-end data collection tool for WhatsApp. It is designed to collect data from WhatsApp groups and individual chats for research purposes. The tool manages the data collection process, including consent of chats for donation, anonymization of media and messages, and storage of the data. The tool also provides a monitoring dashboard to monitor the data collection process. The tool is designed to be scalable and can be used to collect data from multiple WhatsApp accounts simultaneously.

### Tech Stack
The tool is built using the following technologies:
1. Frontend: React
2. Backend: Node.js and Python
3. Database: MongoDB
4. Monitoring Dashboard: Streamlit Python
5. Downloader: Python

## System Requirements
To setup an instance of WhatsApp Explorer, researchers will need the following system requirements:
1. A server with following minimum specifications per parallelly connected WhatsApp account:
    - 1 GB RAM
    - 2 CPU cores
2. Hence, if we plan to add 8 accounts simultaneously, we will need a server with at least 8 GB RAM and 16 CPU cores.
3. The storage requirements depends on the number of accounts we add and the activity of the accounts. 
4. We tested the tool on an Amazon AWS EC2 instance with 16GB RAM, 16 core CPU and 2 terabytes storage. The instance does not use much RAM though to enable parallel data downloads, multiple CPU cores would help.

## Pre-requisites
1. Ports: You will need to open the following ports on your server:
    - 3000: For the frontend
    - 8000: For the backend
    - 8501: For the monitoring dashboard


## Setup
1. Clone the repository - `git clone ...`
2. You will have to set up the config files of the project manually. The process is described below.
3. Edit the file `run.conf` in the cloned directory.
```conf
DOWNLOADER_TIME="0 17 * * *"
BACKEND_FOLDER="./api/whatsappWebApi" # The path to the backend folder
FRONTED_FOLDER="./frontend/WhatsappMonitorFrontend" # The path to the frontend folder
DASHBOARD_FOLDER="./WMDash" # The path to the monitoring dashboard folder
DOWNLOADER_FOLDER="./downloadTool" # The path to the downloader folder
```

### Downloader
1. Open the file `run.conf` in the cloned directory.
```conf
DOWNLOADER_TIME="0 17 * * *"
```
2. `DOWNLOADER_TIME`: The cron expression for the time at which the downloader will run. The downloader is responsible for backing up all data and shifting the media files to the file system for easy access.
3. Open the file `main.yaml` in the `downloader/config` directory.
```yaml
mailer:
  enabled: true
  email: yourmail@gmail.com
services:
  frontend:
    name: wm-frontend
  backend:
    name: wm-backend
  mongodb:
    uri: mongodb://127.0.0.1:27017/whatsappLogs

data:
  path: /path/to/store/data

backup:
  duration: 5
```
4. `mailer`: The configuration for the mailer service. 
    - The `enabled` field determines whether the mailer service is enabled or not.
    - The `email` field is the email to which the report will be sent.
5. `services`: The configuration for the services.
    - The `frontend` and `backend` fields are the names of the frontend and backend services respectively. Do not change these.
    - The `mongodb.uri` field is the URI of the MongoDB database.
6. `data`: The configuration for the data. The `path` field is the path to the directory where the data will be stored.
7. `backup`: The configuration for the backup. The `duration` field is the number of days after which the backup will be createde e.g. `5` means the backup will be created every 5 days. (Note that for the recent 1 week, the backup will be created every day)


### Frontend
1. Open the file `.env` in the `frontend` directory.
```env
PORT=3000
REACT_APP_API_URL=http://localhost:8000/ 
# Features
REACT_APP_INDIVIDUAL_USER=true
REACT_APP_DAILY_REPORT=true
REACT_APP_INDIVIDUAL_CHAT=false
```
2. `PORT`: The port on which the frontend will run.
3. `REACT_APP_API_URL`: The URL of the backend service.
4. `REACT_APP_INDIVIDUAL_USER`: Set to `true` if you want to enable the individual user feature. This feature enables a user to add themselves as a participant in the survey.
5. `REACT_APP_DAILY_REPORT`: Set to `true` if you want to enable the daily report feature. The daily report is accessible to the admin only.
6. `REACT_APP_INDIVIDUAL_CHAT`: Set to `true` if you want to enable the individual chat feature. This feature enables a user to donate bilateral chats alongwith the default group chats.

### Backend
1. Open the file `prod.yml` in the `backend/config` directory.
```yml
port: 8000

IS_HTTPS: true

mongodb:
  uri: mongodb://127.0.0.1:27017/whatsappLogs

allowed_origins:
    - https://www.whatsapp.whats-viral.me
    - https://whatsapp.whats-viral.me
    - http://whatsapp.whats-viral.me

autologger:
  cron: "0 2 * * *" # 8:05 PM
  parallel: 8 # Number of parallel instances to run

messages:
  limit: "Infinity" # Can be any number or "Infinity"
  daysOld: 60 # Number of days old messages to store
  recent: 14 # Number of days old messages to categorize as recent
  status: false # Whether to store message status or not, currently facing bugs
  retries: 10 # Number of tries to get message status or reactions

timeouts:
  chat: 600000 # 10 minutes
  message: 300000 # 5 minutes
  contact: 300000 # 5 minutes
  media: 300000 # 5 minutes
  numMessages: 300000 # 5 minutes
  reactions: 300000 # 5 minutes
  messageStatus: 300000 # 5 minutes
  connection: 300000 # 5 minutes

audio:
  enabled: true

video:
  enabled: true
  maxDuration: "Infinity" # can be 60 seconds
  forwardingScore: 0
```
2. `port`: The port on which the backend will run.
3. `IS_HTTPS`: Set to `true` if your server is accessible over HTTPS.
4. `mongodb.uri`: The URI of the MongoDB database.
5. `allowed_origins`: The list of allowed origins for CORS. This usually includes the frontend URL.
6. `autologger`: The configuration for the autologger service. 
    - The `cron` field is the cron expression for the time at which the autologger will run. 
    - The `parallel` field is the number of accounts to connect parallelly while auto-logging.
7. `messages`: The configuration for the messages service.
    - The `limit` field is the maximum number of messages to store. 
    - The `daysOld` field is the number of days old messages to store. 
    - The `recent` field is the number of days old messages to categorize as recent. 
    - The `status` field is whether to store message status or not. Message status includes the read and delivered status of the message.
    - The `retries` field is the number of tries to get message status or reactions.
8. `timeouts`: The configuration for the timeouts of different services. This describes how much time the application will wait for a service to respond before timing out.
9. `audio`: The configuration for the audio service. 
    - The `enabled` field determines whether we are downloading audio files or not.
10. `video`: The configuration for the video service.
    - The `enabled` field determines whether we are downloading video files or not.
    - The `maxDuration` field is the maximum duration of the video we can download.
    - The `forwardingScore` field is minimum number of times a video has to be forwarded to be stored in the database. (Considered as viral)
11. Open the file `run.conf` in the `backend` directory.
```conf
GCLOUD_KEY_PATH=/path/to/gcloud-key.json/
```
12. `GCLOUD_KEY_PATH`: The path to the Google Cloud key file. This is required for name anonymization using the google DLP library. The file should be stored in `backend/keys` directory.

### Monitoring Dashboard
1. Open the file `run.conf` in the `monitoring` directory.
```conf
PORT=8501
BASE_URL=monitoring
```
2. `PORT`: The port on which the monitoring dashboard will run.
3. `BASE_URL`: The base URL of the monitoring dashboard.


## Running the application
1. Run the script `run.sh` in the root directory of the project. This will start the frontend, backend and downloader services.
2. Check that no errors occurred during the setup process. Logs are available at `./<current_date>.log`
3. The frontend will be accessible at `http://localhost:3000/` by default.
4. The default admin credentials are:
    - Username: `admin`
    - Password: `12345`
5. To add surveyors, go to the add surveyor page in the admin dashboard.
6. Login with the surveyor credentials to access the surveyor dashboard. A surveyor can then add participants to the survey.
7. You can monitor the application data in the monitoring dashboard. The monitoring dashboard is accessible at `http://<your_ip>:<port>/<base_url>` as set in the `run.conf` file in the monitoring directory.

## Data visualizer code
You can also find the code for the frontend, backend and pipelines required for building a dashboard to visualize the data. The dashboard provides an easy way to summarize the collected data and can be easily setup based on the pipelines provided by WhatsApp Explorer. You can find the code for the visualizer in the `data_visualizer` folder. Please refer to the README in that folder for details.
