import os
import datetime
import requests
import telegram
import asyncio

bot_token = '6247430765:AAFopDsTtzDEWUFeWPHVKzSVUYxSNZ4nNYg'
chat_id = '-998212744'

url_frontend = 'https://whatsapp.whats-viral.me/'
url_backend = 'https://wapi.whats-viral.me/client-logs'


# specify the directory path
directory_path = '/home/kg766/whatsappMonitor/data'

# get a list of all directories in the specified directory path
directories = [d for d in os.listdir(directory_path) if os.path.isdir(os.path.join(directory_path, d))]

# get the latest modified directory by sorting the directories by modification time and selecting the last one
latest_modified_directory = sorted(directories, key=lambda x: os.path.getmtime(os.path.join(directory_path, x)), reverse=True)[0]

# print the name of the latest modified directory
print(latest_modified_directory)




response1 = requests.get(url_frontend)
response2 = requests.get(url_backend)


bot = telegram.Bot(token=bot_token)

async def send_telegram_message():
    await bot.send_message(chat_id=chat_id, text="Last logged : " + str(latest_modified_directory))

loop = asyncio.get_event_loop()
loop.run_until_complete(send_telegram_message())
