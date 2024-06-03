const { logStream, logClientInfo } = require("./Logger");
const { logData } = require("./Data");
const participants = require("../../models/participants");
const pipeline = require("../../models/pipeline");
const { connectToWhatsappClient } = require("./Connection");
const config = require('config');

let autoLoggingOngoing = false;

function isInBusinessHours() {
  const now = new Date();
  const hours = now.getHours();
  // Returns true between 8:30 AM IST to 8:30 PM IST
  return hours >= 3 && hours < 15;
}

function waitForOffPeakHours() {
  return new Promise(resolve => {
    const now = new Date();
    now.setHours(15, 2, 0, 0); // Set time to 8:30 PM IST
    const msUntilOffPeak = now.getTime() - Date.now();
    setTimeout(resolve, msUntilOffPeak > 0 ? msUntilOffPeak : msUntilOffPeak + 86400000); // Wait until 7 PM or next 7 PM
  });
}

async function autoLogging() {

  if (autoLoggingOngoing) {
    console.log("Auto logging already in progress");
    logStream.write(
      "\n\n================================\nAuto logging already in progress at " +
      new Date() +
      " \n================================\n"
    );
    return;
  }
  autoLoggingOngoing = true;
  logStream.write(
    "\n\n================================\nPerforming auto logging at " +
    new Date() +
    " \n================================\n"
  );

  
  let all_participants = await participants.find({ 'isRevoked': { $ne: true }, 'clientStatus': { $ne: "AUTOLOGGING" }, 'isLogging': false });
  // all_participants = all_participants.reverse();
  const client_ids = all_participants.map(p => p.clientId);
  const particpant_alwaysActive = Object.fromEntries(all_participants.map(p => [p.clientId, p.autoforward]));
  
  all_participants.forEach(async p => {
    p.clientStatus = "DISCONNECTED";
    p.isLogging = false;
    await p.save();
  });
  
  const connecting_clients = client_ids.filter(clientId => !(whatsappSessions.has(clientId) && whatsappSessions.get(clientId).getState() === "CONNECTED"));
  
  const newPipeline = await pipeline.create({
    startTime: new Date(),
    status: "running",
    totalRecords: connecting_clients.length,
  });
  const oID = newPipeline._id;
  // parallely running 4 loggers
  const loggerCount = config.get("autologger.parallel");
  const queue = [...connecting_clients];
  const results = { "logged": 0, "revoked": 0, "timedOut": 0 };

  async function processNextClient() {
    while (queue.length > 0) {
      // if (isInBusinessHours()) {
      //   console.log("Pausing due to business hours...", " at ", new Date());
      //   await waitForOffPeakHours();
      //   console.log("Resuming after business hours...", " at ", new Date());
      // }
      const obj = queue.shift();
      try {
        const res = await connectToWhatsappClient(obj, particpant_alwaysActive[obj]);
        results[res.result]++;
        await pipeline.updateOne({ _id: oID }, { $push: { records: res } });
      } catch (e) {
        console.log(e);
        await pipeline.updateOne({ _id: oID }, {
          $push: {
            records: { userId: obj, result: "failed" }
          }
        });
      }
    }
  }
  const tasks = Array.from({ length: loggerCount }, processNextClient);
  await Promise.all(tasks);

  await pipeline.updateOne({ _id: oID }, {
    status: "completed",
    endTime: new Date(),
  });
  console.log("Autologging complete with following stats: ", results);
  autoLoggingOngoing = false;
}

module.exports = {
  autoLogging
}
