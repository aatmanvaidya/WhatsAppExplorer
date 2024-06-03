# Whatsapp Explorer: Dashboard

This is the code for the dashboard of WhatsApp Explorer. The dashboard is built using Streamlit and is used to monitor the data collection process. The dashboard provides various visualizations and insights into the data collected from WhatsApp.

### Configuration
```conf
PORT=8501
BASE_URL=monitoring
```
1. `PORT`: The port on which the dashboard will run.
2. `BASE_URL`: The base URL of the dashboard. This is used to access the dashboard from the frontend.

```yml
# Survey Data
survey: "path/to/backend/formResponse"

# WhatsApp Data
download_paths: [
    'download/storage/path1',
    'download/storage/path2',
    'download/storage/path3'
]
```
1. `survey`: The path to the survey responses collected during the data collection process. This is present in the 'formResponse' folder in the backend directory by default.
2. `download_paths`: The paths to the downloaded WhatsApp data. These are the paths to the folders where the WhatsApp data is downloaded. This is the data path specified to the download tool where all the media and chat data is stored.

