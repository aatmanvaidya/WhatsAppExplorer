const mongoose = require("mongoose");

const id = new mongoose.Schema({
    server: String,
    user: String,
    _serialized: String,
});

const contacts = new mongoose.Schema({

    userID : String,
    participantID : mongoose.Schema.Types.ObjectId,
    userName : String,
    contacts : {},
    lastUpdated : {
        type : Date,
        default : Date.now
    }

})

const Contacts = mongoose.model("Contacts", contacts);

module.exports = Contacts;
