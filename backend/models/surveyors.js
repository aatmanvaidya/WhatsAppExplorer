const mongoose = require("mongoose");

const contact = new mongoose.Schema({
    phoneNumber: String,
    address: String,
    email: String,
});

const surveyors = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
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
    participantsAdded: {
        type: [mongoose.Schema.Types.ObjectId]
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
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    refreshToken: String,
    surveyDisabled: {
        type: Boolean,
        default: false
    },
    isIndividual: {
        type: Boolean,
        default: false
    },
    region: {
        type: String,
        required: false,
        default: 'en',
        trim: true
    },
})

const Surveyors = mongoose.model("Surveyors", surveyors);

module.exports = Surveyors;
