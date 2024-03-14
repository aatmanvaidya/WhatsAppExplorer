## WhatsApp Explorer: Frontend

This is the code for the frontend of WhatsApp Explorer. The frontend is built using React. The frontend is to be used by the surveyors to add WhatsApp accounts, fill up surveys and take consent from the participants.

### Configuration
```.env
PORT=3000
REACT_APP_API_URL=http://localhost:8000/ 
# Features
REACT_APP_INDIVIDUAL_USER=true
REACT_APP_DAILY_REPORT=true
REACT_APP_INDIVIDUAL_CHAT=false
```
1. `PORT`: The port on which the frontend will run.
2. `REACT_APP_API_URL`: The URL of the backend service.
3. `REACT_APP_INDIVIDUAL_USER`: Set to `true` if you want to enable the individual user feature. This feature enables a user to add themselves as a participant in the survey.
4. `REACT_APP_DAILY_REPORT`: Set to `true` if you want to enable the daily report feature. The daily report is accessible to the admin only.
5. `REACT_APP_INDIVIDUAL_CHAT`: Set to `true` if you want to enable the individual chat feature. This feature enables a user to donate bilateral chats alongwith the default group chats.
