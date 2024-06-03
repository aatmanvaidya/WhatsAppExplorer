const { ClientConnection } = require("../WhatsappClient");
const participants = require("../../models/participants");
const pipeline = require("../../models/pipeline");
const { clearSession } = require("../../helpers/clearUnusedClients");
const { logClientInfo } = require("./Logger");
const { logData } = require("./Data");


async function connectToWhatsappClient(clientId, particpant_alwaysActive) {
  let participant = await participants.findOne({ clientId: clientId });
  let doj = participant.dateOfRegistration;
  const client = new ClientConnection(clientId, false, false, doj);
  whatsappSessions.put(clientId, client);
  const userData = {
    userId: clientId,
  }
  await logClientInfo("Auto logging started for client", clientId);
  return new Promise((resolve, reject) => {
    client.once("connected", async () => {
      userData['connectionTime'] = new Date();
      userData['result'] = "connected";
      let result = await logData(clientId);
      userData['messagesDownloaded'] = result[0];
      userData['mediaDownloaded'] = result[1];
      if (particpant_alwaysActive === false) {
        // disconnect client
        await client.clear();
        whatsappSessions.remove(clientId);
        await logClientInfo(
          "Disconnected from client after autologging",
          clientId
        );
        userData['disconnectionTime'] = new Date();
      }
      resolve(userData);
    });
    client.once("qr", async (qr) => {
      userData['result'] = "revoked";
      await logClientInfo("User revoked access, skipping...", clientId);
      await participants.findOneAndUpdate({ clientId: clientId }, {
        $set: {
          isRevoked: true,
          revokeTime: new Date()
        }
      });
      await client.clearRevoked();
      clearSession(clientId);
      whatsappSessions.remove(clientId);
      await logClientInfo("Client destroyed", clientId);
      resolve(userData);
    });
    client.once("auth_failure", async () => {
      userData['result'] = "timedOut";
      await client.clear();
      whatsappSessions.remove(clientId);
      resolve(userData);
    });
    client.connect();
  });
}

async function connectAutoForwardingClients() {
  // get all client ids for autoforwarding clients
  const all_participants = await participants.find({ autoforward: true, 'isRevoked': { $ne: true } });
  const client_ids = [];
  for (let i = 0; i < all_participants.length; i++) {
    client_ids.push(all_participants[i].clientId);
  }

  // connect
  for (let i = 0; i < client_ids.length; i++) {
    let p = await participants.findOne({ clientId: client_ids[i] });
    const client = new ClientConnection(client_ids[i], true, false, p.dateOfRegistration);
    whatsappSessions.put(client_ids[i], client);
    client.once("qr", async (qr) => {
      await logClientInfo("Autoforwarding User revoked access, skipping...", client_ids[i]);
      await client.clear();
      clearSession(client_ids[i]);
      whatsappSessions.remove(client_ids[i]);
      await logClientInfo("Client destroyed", client_ids[i]);
    });

    client.once("connected", async () => {
      await logClientInfo("Autoforwarding User connected", client_ids[i]);
    });

    client.connect();
  }
}

const resetClientStatus = async () => {
  const all_participants = await participants.find({});
  for (let i = 0; i < all_participants.length; i++) {
    all_participants[i].isLogging = false;
    all_participants[i].clientStatus = "DISCONNECTED";
    await all_participants[i].save();
  }

  const all_running_pipelines = await pipeline.find({ status: "running" });
  for (let i = 0; i < all_running_pipelines.length; i++) {
    all_running_pipelines[i].status = "failed";
    await all_running_pipelines[i].save();
  }
};

module.exports = {
  connectToWhatsappClient,
  connectAutoForwardingClients,
  resetClientStatus,
} 