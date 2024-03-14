const mongoose = require("mongoose");

const contact = new mongoose.Schema({
    phoneNumber: String,
    address: String,
    email: String,
});

const admins = new mongoose.Schema({

    username : {
        type: String,
        required: true,
        unique: true,
    },
    password : {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    last_name: {
        type: String,
        required: true,
        trim: true
    },
    contactInfo: {
        type: contact,
        required: true,
    },
    bio: {
        type: String,
        required: true,
        trim: true
    },
    surveyorsAdded: {
        type: {
            count: Number,
            ids: {
                type: [mongoose.Schema.Types.ObjectId],
                ref: "Surveyors"
            },
            default: 0
        }
    },
    dateOfRegistration: {
        type: Date,
        required: true,
        default: Date.now
    },
    lastActiveAt: {
        type: Date,
        default: Date.now
    },
    refreshToken: String

})

const Admins = mongoose.model("Admins", admins);

module.exports = Admins;
