const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const passportConfig = require("./lib/passportConfig");
const fs = require('fs');
const path = require('path');

// MongoDB
mongoose.connect("mongodb://localhost:27017/testDb5", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to DB");
}).catch(err => {
  console.log(err);
});

const app = express();
const port = 3334;

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

// Routing
app.use("/auth", require("./routes/authRoutes"));
app.use("/messages", require("./routes/messageRoutes"));
app.use("/links", require("./routes/linkRoutes"));
app.use("/images", require("./routes/imageRoutes"));
app.use("/videos", require("./routes/videoRoutes"));
app.use("/forwarded", require("./routes/forwardRoutes"));
app.use("/flags", require("./routes/flagRoutes"));
app.use("/logs", require("./routes/logRoutes"));
app.use("/misc", require("./routes/miscRoutes"));

// Serve static files for WhatsApp thumbnails
app.use("/whatsapp/thumbnail", express.static(path.resolve(__dirname, "./media_wp/thumbnails")));

// Serve static files for WhatsApp
app.use("/whatsapp", express.static(path.resolve(__dirname, "./media")));

// Serve static files for Telegram  
app.use("/telegram", express.static(path.resolve(__dirname, "./media_tel")));

// Serve static files for Facebook
app.use("/facebook", express.static(path.resolve(__dirname, "./media_fb")));

// Start server
app.listen(port, () => {
  console.log(`Server started on port ${port}!`);
});
