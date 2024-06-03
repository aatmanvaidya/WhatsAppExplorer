const fs = require("fs");
const path = require("path");
const participants = require("../models/participants");
const config = require('config');

function getDirectories(dir) {
    return fs.readdirSync(dir).filter(function (file) {
        return fs.statSync(path.join(dir, file)).isDirectory() && file.startsWith("session");
    });
}

const clearUnusedSessions = async () => {
    const dir = config.get('auth.path');
    const sessions = getDirectories(dir);
    sessions.forEach(async session => {
        const clientId = session.substring(8);
        const p = await participants.find({ clientId: clientId });
        if (p.length == 0 || p[0].isRevoked) {
            clearSession(clientId);
        }
    });
};

const clearSession = (clientId) => {
    console.log(`Clearing session ${clientId}`);
    const dir = config.get('auth.path');

    fs.readlink(path.join(dir, `session-${clientId}`), (err, linkString) => {
        if (err) {
            // console.log("Error reading link", err);
            fs.rm(path.join(dir, `session-${clientId}`), { recursive: true }, (err) => {
                if (err) {
                    console.log("Error clearing session", err);
                }
                console.log(`Session ${clientId} cleared normally`);
            });
            return;
        }
        const link = path.resolve(linkString);
        fs.rm(link, { recursive: true }, (err) => {
            console.log("Removing link: ", link);
            if (err) {
                console.log("Error clearing session source", err);
                return;
            }

            fs.rm(path.join(dir, `session-${clientId}`), { recursive: true }, (err) => {
                if (err) {
                    console.log("Error clearing session symlink", err);
                } else {
                    console.log(`Session ${clientId} cleared`);
                }
            });
        });
    });
};

module.exports = {
    clearUnusedSessions,
    clearSession
}
