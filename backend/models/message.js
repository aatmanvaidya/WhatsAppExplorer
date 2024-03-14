const mongoose = require("mongoose");


const message = new mongoose.Schema({
    userID : String,
    participantID : mongoose.Schema.Types.ObjectId,
    userName : String,
    chatName : String,
    chatID : {
        server : String,
        user : String,
        _serialized : String
    },
    isGroup : Boolean,
    timestamp : Number,
    messages : {},
    lastUpdated : {
        type : Date,
        default : Date.now
    },
})

const Message = mongoose.model("Message", message);

module.exports = Message;