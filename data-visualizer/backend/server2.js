const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require('fs');
const https = require('https');

const passportConfig = require("./lib/passportConfig");

// MongoDB
mongoose
  .connect("mongodb://localhost:27017/testDb5", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
  })
  .then((res) => console.log("Connected to DB"))
  .catch((err) => console.log(err));

const app = express();
const port = 3334;

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Setting up middlewares
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
app.use("/whatsapp/thumbnail", express.static("./media_wp/thumbnails")); // for hosting just new media and its clustering
app.use("/whatsapp", express.static("./media")); // for hosting both old and new media
app.use("/telegram", express.static("./media_tel"));
// app.use("/facebook/thumbnail", express.static("./media_fb/thumbnails"));
app.use("/facebook", express.static("./media_fb"));

// HTTPS options
const options = {
  key: fs.readFileSync('/home/kg766/dataVisualiser/certs/privkey1.pem'),
  cert: fs.readFileSync('/home/kg766/dataVisualiser/certs/cert1.pem')
};

// Create HTTPS server
const server = https.createServer(options, app);

// Start server
server.listen(port, () => {
  console.log(`Server started on port ${port}!`);
});
// ln -s /etc/letsencrypt/live/analysis-backend.whats-viral.me/privkey.pem /home/kg766/dataVisualiser/certs/privkey.pem
// ln -s /etc/letsencrypt/live/analysis-backend.whats-viral.me/cert.pem /home/kg766/dataVisualiser/certs/cert.pem
