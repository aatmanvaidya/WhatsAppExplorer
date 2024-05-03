const fs = require("fs");
const path = require("path");
const participants = require("../models/participants");

function getDirectories(dir) {
    return fs.readdirSync(dir).filter(function (file) {
        return fs.statSync(path.join(dir, file)).isDirectory() && file.startsWith("session");
    });
}

const clearUnusedSessions = async () => {
    const dir = path.resolve(path.join(__dirname, '..', '.wwebjs_auth'));
    // check if path exists
    if (!fs.existsSync(dir)) {
        return;
    }
    const sessions = getDirectories(dir);
    sessions.forEach(async session => {
        const clientId = session.substring(8);
        const p = await participants.find({ clientId: clientId }).count() > 0;
        if (!p) {
            clearSession(clientId);
        }
    });
};

const clearSession = (clientId) => {
    const dir = path.resolve(path.join(__dirname, '..', '.wwebjs_auth'));
    if (!fs.existsSync(dir)) {
        return;
    }
    fs.rm(path.join(dir, `session-${clientId}`), { recursive: true }, (err) => {
        if (err) {
            console.log("Error clearing session", err);
        }
    });
};

module.exports = {
    clearUnusedSessions,
    clearSession
}
