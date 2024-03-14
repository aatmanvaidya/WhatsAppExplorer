const mongoose = require("mongoose");

const contact = new mongoose.Schema({
  phoneNumber: String,
  address: String,
  email: String,
});

const participants = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  clientId: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  clientInfo: {
    type: Object,
    default: {}
  },
  contactInfo: {
    type: contact,
    // required: true,
  },
  whatsAppNumber: {
    type: String,
    // required: true,
    trim: true,
  },
  bio: {
    type: String,
    // required: true,
    trim: true,
  },
  dateOfRegistration: {
    type: Date,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Surveyors",
  },
  addedByName: {
    type: String,
  },
  consentedChatUsers: {
    type: [],
  },
  daysLeft : {
    type : Number,
    default : 14,
  },
  isLogging : {
    type: Boolean,
    default: false
  },
  clientStatus : {
    type: String,
    default: "CONNECTED"
  },
  autoforward : {
    type: Boolean,
    default: false
  },
  autoforward_sender : {
    type: String,
    default: ""
  },
  autoforward_receiver : {
    type: String,
    default: ""
  },
  isRevoked : {
    type: Boolean,
    default: false
  },
  revokeTime : {
    type: Date,
    default: null
  },
  surveyDisabled: {
    type: Boolean,
    default: false
  },
  consentedUsersChanged: {
    type: Boolean,
    default: false
  },
  disconnectedPrematurely: {
    type: Boolean,
    default: false
  },
  deselectedChats: {
    type: Boolean,
    default: false
  },
  location: {},
});

const Participants = mongoose.model("Participants", participants);

module.exports = Participants;
