const mongoose = require('mongoose');

const connections = new mongoose.Schema({
    clientId: {
        type: String,
        required: true,
        unique: true,
    },
    connectionTime: {
        type: Date,
        required: true,
        default: Date.now
    },
});

const Connections = mongoose.model('Connections', connections);

module.exports = Connections;