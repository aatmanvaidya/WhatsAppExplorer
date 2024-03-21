import requests
from datetime import datetime

def send_notification(message, chat_id):
    telegram_token = '6499270319:AAFOd6wDr7GqciizSKAb1lFi_QyIm3-z1js'

    current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    formatted_message = f"{message}\n\nCurrent Date and Time: {current_time}"
    
    api_url = f'https://api.telegram.org/bot{telegram_token}/sendMessage'
    params = {
        'chat_id': '-4068837293',
        'text': formatted_message
    }

    response = requests.post(api_url, data=params)
    return response.json()

# Replace 'YOUR_GROUP_CHAT_ID' with the actual group chat ID where you want to send notifications
group_chat_id = 'YOUR_GROUP_CHAT_ID'

message = "Error: Your daily running script has crashed!"
send_notification(message, group_chat_id)
