# Whatsapp Explorer: Downloader

This is the code for the downloader of WhatsApp Explorer. The downloader is responsible for backing up all data and shifting the media files to the file system for easy access.

### Configuration

```conf
DOWNLOADER_TIME="0 17 * * *"
```
1. `DOWNLOADER_TIME`: The cron expression for the time at which the downloader will run. The downloader is responsible for backing up all data and shifting the media files to the file system for easy access.

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
2. `mailer`: The configuration for the mailer service. 
    - The `enabled` field determines whether the mailer service is enabled or not.
    - The `email` field is the email to which the report will be sent.
3. `services`: The configuration for the services.
    - The `frontend` and `backend` fields are the names of the frontend and backend services respectively. Do not change these.
    - The `mongodb.uri` field is the URI of the MongoDB database.
4. `data`: The configuration for the data. The `path` field is the path to the directory where the data will be stored.
5. `backup`: The configuration for the backup. The `duration` field is the number of days after which the backup will be createde e.g. `5` means the backup will be created every 5 days. (Note that for the recent 1 week, the backup will be created every day)