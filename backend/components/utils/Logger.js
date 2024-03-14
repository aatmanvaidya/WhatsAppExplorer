const fs = require("fs");
const path = require("path");
const participants = require("../../models/participants");
// Create fs write stream for logging
const logStream = fs.createWriteStream(path.resolve("client-logs.txt"), { flags: "a" });

async function logClientInfo(message, clientId) {
    // get particpant name from db using clientId
    const p = await participants.findOne({ clientId: clientId });
  
    let participantName = clientId;
  
    if (p) {
      participantName = p.name;
      // add last 4 digits of clientId to participant name
      participantName += ` (${clientId.slice(-4)})`;
    }
  
    // get current date and time dd-mm-yyyy hh:mm:ss
    const date = new Date();
    const dateTime = date.toLocaleString();
  
    // write to log file with format [dd-mm-yyyy hh:mm:ss] <participantName> : <message> with equal width
    logStream.write(
      `[${dateTime}] ${participantName.padEnd(30, " ")} : ${message} \n`
    );
}

module.exports = {
    logStream,
    logClientInfo
};