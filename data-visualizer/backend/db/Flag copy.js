const mongoose = require("mongoose");

let schema = new mongoose.Schema({
  contentId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  message: {
    type: String,
  },
});

// future change: assuming contentId is unique, else we need to store content type as well

schema.index({ contentId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("flag", schema);
