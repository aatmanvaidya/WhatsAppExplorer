const mongoose = require("mongoose");

let schema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  senderData: [
    {
      from: {
        type: String,
      },
      to: {
        type: String,
      },
      timestamp: {
        type: Date,
      },
      section: [
        {
          type: String,
        },
      ],
    },
  ],
  platform: {
    type: String,
  },
  section: {
    type: String,
  },
  isExplicit: {
    type: Boolean,
    required: true,
    default: false
  },
  flags: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User who flagged
      feedback: String, // Feedback or reason for flagging
    },
  ],
});

module.exports = mongoose.model("video", schema);
