const { logStream, logClientInfo } = require("./Logger");
const { logData } = require("./Data");

const participants = require("../../models/participants");
const pipeline = require("../../models/pipeline");
const { connectToWhatsappClient } = require("./Connection");
const config = require('config');

async function autoLogging() {
  logStream.write(
    "\n\n================================\nPerforming auto logging at " +
    new Date() +
    " \n================================\n"
  );

  const newPipeline = await pipeline.create({
    startTime: new Date(),
    status: "running",
  });
  const oID = newPipeline._id;
  // get all client ids
  const all_participants = await participants.find({ 'isRevoked': { $ne: true }, 'clientStatus': { $ne: "AUTOLOGGING" }, 'isLogging': false });
  const particpant_alwaysActive = {};
  const client_ids = [];
  for (let i = all_participants.length - 1; i >= 0; i--) {
    client_ids.push(all_participants[i].clientId);
    particpant_alwaysActive[all_participants[i].clientId] =
      all_participants[i].autoforward;
    all_participants[i].clientStatus = "DISCONNECTED";
    all_participants[i].isLogging = false;
    await all_participants[i].save();
  }
  const connecting_clients = [];
  for (let clientId of client_ids) {
    let connect = false;
    if (whatsappSessions.has(clientId)) {
      // check client is authenticated
      let client = whatsappSessions.get(clientId);
      let state;
      try {
        state = await client.getState();
      } catch (err) {
        console.log("Error in pipeline autolog: ", err);
        state = "NOT_CONNECTED";
      }
      if (state !== "CONNECTED") {
        connect = true;
        await client.clear();
        whatsappSessions.remove(clientId);
        await logClientInfo("Client destroyed", clientId);
      } else {
        connect = false;
      }
    } else {
      connect = true;
    }

    if (!connect) {
      let client = whatsappSessions.get(clientId);
      await logData(clientId);

      if (particpant_alwaysActive[clientId] == false) {
        // disconnect client
        await client.clear();
        whatsappSessions.remove(clientId);
        await logClientInfo(
          "Disconnected from client after autologging",
          clientId
        );
      }
    } else {
      connecting_clients.push(clientId);
    }
  }
  // parallely running 8 loggers
  const loggerCount = config.get("autologger.parallel");
  const queue = [...connecting_clients];
  const results = {
    "logged": 0,
    "revoked": 0,
    "timedOut": 0,
  };
  async function processNextClient() {
    while (queue.length > 0) {
      const obj = queue.shift();
      try {
        const res = await connectToWhatsappClient(obj, particpant_alwaysActive);
        if (res['result'] === "revoked")
          results["revoked"]++;
        else if (res['result'] === "timedOut")
          results["timedOut"]++;
        else
          results["logged"]++;

        await pipeline.updateOne({ _id: oID }, {
          $push: {
            records: res
          }
        });
      } catch (e) {
        const userRecord = {
          userId: obj,
          result: "failed",
        }
        console.log(e);
        await pipeline.updateOne({ _id: oID }, {
          $push: {
            records: userRecord
          }
        });
      }
    }
  }
  const tasks = Array.from({ length: loggerCount }, () => processNextClient());
  await Promise.all(tasks);
  await pipeline.updateOne({ _id: oID }, {
    status: "completed",
    endTime: new Date(),
  });
  console.log("Autologging complete with following stats: ", results);
}

module.exports = {
  autoLogging
}
