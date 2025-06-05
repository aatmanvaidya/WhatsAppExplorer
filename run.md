# Running WhatsAppExplorer on Docker

This guide explains how to run the WhatsAppExplorer application on Docker and scrape data from a WhatsApp chat.

## Prerequisites

- Docker and Docker Compose installed on your machine.
- A WhatsApp account and a chat you want to scrape.

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd WhatsAppExplorer
```

## Step 2: Build and Run the Docker Containers

1. **Build the Docker image and start the containers**:
   ```bash
   docker-compose up --build
   ```
   This will start the application and MongoDB.

2. **Verify the containers are running**:
   ```bash
   docker-compose ps
   ```

## Step 3: Register a WhatsApp Client

1. **Connect to MongoDB**:
   ```bash
   docker exec -it whatsappexplorer_mongodb_1 mongo
   ```

2. **Create a participant record**:
   ```javascript
   use whatsappLogs
   db.participants.insertOne({
       clientId: "your_unique_client_id",
       name: "Your Name",
       dateOfRegistration: new Date(),
       isLogging: false,
       clientStatus: "DISCONNECTED",
       consentedChatUsers: ["chat_id_1", "chat_id_2"] // IDs of chats you want to scrape
   });
   ```

## Step 4: Connect to WhatsApp and Scrape Data

1. **Access the application**:
   Open your browser and go to `http://localhost:3000`.

2. **Scan the QR code**:
   - The application will generate a QR code. Scan it with your WhatsApp mobile app to authenticate.

3. **Data scraping**:
   - Once authenticated, the application will automatically scrape messages, contacts, and media from the consented chats and store them in MongoDB.

## Step 5: Verify the Scraped Data

1. **Connect to MongoDB**:
   ```bash
   docker exec -it whatsappexplorer_mongodb_1 mongo
   ```

2. **Check the data**:
   ```javascript
   use whatsappLogs
   db.messages.find({ chatID: "chat_id_1" });
   db.contacts.find({});
   db.chatusers.find({});
   ```

## Step 6: Export Data (Optional)

1. **Run the downloader script**:
   ```bash
   docker exec -it whatsappexplorer_app_1 node downloader/downloader.js
   ```

2. **Check the output**:
   The script will create a directory (e.g., `ddmmyy`) in `storagePath/data/` containing:
   - `messages.json`: All messages.
   - `contacts.json`: All contacts.
   - `chatusers.json`: All chat metadata.
   - Media files in `downloaded-media/`.

## Troubleshooting

- **Container issues**: Check logs with `docker-compose logs`.
- **MongoDB connection**: Ensure MongoDB is running and accessible.
- **QR code not appearing**: Restart the application with `docker-compose restart app`.

## Security Notes

- Keep your MongoDB credentials and WhatsApp session data secure.
- Ensure you have consent to scrape the WhatsApp chats you target.

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [WhatsApp Web API Documentation](https://docs.whatsapp.com/) 