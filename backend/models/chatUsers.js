const mongoose = require("mongoose");

const id = new mongoose.Schema({
    server: String,
    user: String,
    _serialized: String,
});

const chatUsers = new mongoose.Schema({

    userID : String,
    participantID : mongoose.Schema.Types.ObjectId,
    userName : String,
    chats : {},
    lastUpdated : {
        type : Date,
        default : Date.now
    }

})

const ChatUsers = mongoose.model("ChatUsers", chatUsers);

module.exports = ChatUsers;
