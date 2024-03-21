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
  similarMessages: {
    type: [
      {
        string: { type: String },
        timestamp: [{ type: Date }]
      }
    ],
    default: undefined
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
  captionOf: {
    type: String,
  },
  uuid: {
    type: String,
  }
});

module.exports = mongoose.model("message", schema);
