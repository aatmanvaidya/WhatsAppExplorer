## WhatsApp Explorer: Backend

This is the code for the backend of WhatsApp Explorer. The backend is built using Node.js and Express. The backend also consists of image anonymization pipeline which is based on Python and OpenCV. The names in the messages are anonymized using the Google DLP API.

### Configuration
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
1. `port`: The port on which the backend will run.
2. `IS_HTTPS`: Set to `true` if your server is accessible over HTTPS.
3. `mongodb.uri`: The URI of the MongoDB database.
4. `allowed_origins`: The list of allowed origins for CORS. This usually includes the frontend URL.
5. `autologger`: The configuration for the autologger service. 
    - The `cron` field is the cron expression for the time at which the autologger will run. 
    - The `parallel` field is the number of accounts to connect parallelly while auto-logging.
6. `messages`: The configuration for the messages service.
    - The `limit` field is the maximum number of messages to store. 
    - The `daysOld` field is the number of days old messages to store. 
    - The `recent` field is the number of days old messages to categorize as recent. 
    - The `status` field is whether to store message status or not. Message status includes the read and delivered status of the message.
    - The `retries` field is the number of tries to get message status or reactions.
7. `timeouts`: The configuration for the timeouts of different services. This describes how much time the application will wait for a service to respond before timing out.
8. `audio`: The configuration for the audio service. 
    - The `enabled` field determines whether we are downloading audio files or not.
9. `video`: The configuration for the video service.
    - The `enabled` field determines whether we are downloading video files or not.
    - The `maxDuration` field is the maximum duration of the video we can download.
    - The `forwardingScore` field is minimum number of times a video has to be forwarded to be stored in the database. (Considered as viral)

```conf
GCLOUD_KEY_PATH=/path/to/gcloud-key.json/
```
10. 'GCLOUD_KEY_PATH': The path to the Google Cloud key file. This is required for name anonymization using the google DLP library. The file should be stored in `backend/keys` directory. You will have to generate your own key from the Google Cloud Console.