const mongoose = require('mongoose');

const userRecords = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    result: {
        type: String,
        required: true,
        enum: ['connected', 'revoked', 'timedOut', 'failed']
    },
    connectionTime: {
        type: Date,
        required: false,
    },
    disconnectionTime: {
        type: Date,
        required: false,
    },
    messagesDownloaded: {
        type: Number,
        required: false,
        default: 0
    },
    mediaDownloaded: {
        type: Number,
        required: false,
        default: 0
    },
})

const pipeline = new mongoose.Schema({
    
    startTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    status: {
        type: String,
        required: true,
        enum: ['running', 'completed']
    },
    endTime: {
        type: Date,
        required: false,
    },
    records: {
        type: [userRecords],
        required: false,
        default: []
    },   
});

const Pipeline = mongoose.model('Pipeline', pipeline);

module.exports = Pipeline;