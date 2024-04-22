const mongoose = require("mongoose");

let schema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  contentId: {
    type: String,
  },
  from: {
    type: String,
  },
  to: {
    type: String,
  },
  timestamp: {
    type: Date,
  },
  platform: {
    type: String,
  },
  section: {
    type: String,
  },
  flags: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User who flagged
      feedback: String, // Feedback or reason for flagging
    },
  ],
});

module.exports = mongoose.model("link", schema);
