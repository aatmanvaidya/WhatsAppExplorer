const mongoose = require("mongoose");

let schema = new mongoose.Schema({
  date: {
    type: Date,
  },
});

module.exports = mongoose.model("log", schema);
