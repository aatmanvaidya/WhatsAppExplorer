// const keys = require("./keys/core-depth-355012-98c6dbdcb90c.json");
const mongodb = require("mongodb");
const express = require("express");
const qrcode = require("qrcode");
const http = require("http");
const fs = require("fs");
const mime = require("mime-types");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verifyJWT = require("./middleware/verifyJWT");
const cookieParser = require("cookie-parser");
const credentials = require("./middleware/credentials");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const { decryptContact } = require("./middleware/hashing");
const { inspectString, DeidentifyMessage } = require("./middleware/identification");
var shell = require("shelljs");
require("dotenv").config();
var cron = require("node-cron");
const path = require('path');
const config = require('config');

// get values from config
const port = config.has('port') ? config.get('port') : 8000;
const IS_HTTPS = config.has('IS_HTTPS') ? config.get('IS_HTTPS') : true;
const mongoUrl = config.get('mongodb.uri');

//models
const contacts = require("./models/contacts");
const chatUsers = require("./models/chatUsers");
const message = require("./models/message");
const participants = require("./models/participants");
const Admins = require("./models/admins");
const Surveyors = require("./models/surveyors");

// components
const { logStream, logClientInfo } = require("./components/utils/Logger");
const { addDefaultAdmin, checkIfConsentedChatsUpdated } = require("./components/utils/Utils");

// const MongoClient = require('mongodb').MongoClient;
const mongoose = require("mongoose");
const { clearUnusedSessions } = require("./helpers/clearUnusedClients");
const { ClientConnection, ClientSessions } = require("./components/WhatsappClient");
const { connectToWhatsappClient, resetClientStatus, connectAutoForwardingClients } = require("./components/utils/Connection");
const { logAllChatNames, logAllContacts, logMessages, anonymizeData, downloadMedia } = require("./components/utils/Data");
const { autoLogging } = require("./components/utils/Pipeline");
const { getJSONLogs } = require("./components/utils/GridFS");

global.whatsappSessions = new ClientSessions();

// minimum date limit for message logs
const minDate = new Date();
minDate.setDate(minDate.getDate() - config.get('messages.daysOld'));
minDate.setHours(0, 0, 0, 0);



const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(credentials);
app.use(cors(corsOptions));
app.use(cookieParser());

// get consented chat users for a given user
app.post("/consented-users", verifyJWT, async (req, res) => {
  const user = await participants.findOne({ clientId: req.body.clientId });
  if (user) {
    res.send(user.consentedChatUsers);
  } else {
    console.log("No user found");
    res.sendStatus(404);
  }
});

// app.get("/autolog", async (req, res) => {
//   downloadFile();
//   res.send("done");
// });

async function getChatNamesbyId(clientID, chatIDs) {
  const client = whatsappSessions.get(clientID);
  const chats = [];
  for (const chatID of chatIDs) {
    const decryptedId =
      decryptContact(chatID.split("@")[0]) + "@" + chatID.split("@")[1];
    let chat = await client.getChatById(decryptedId);
    chats.push(chat.name);
  }
  return chats;
}

// logging all messages from consented chats : stores in different files
app.post("/consented-chats", verifyJWT, async (req, res) => {
  let consentedChats = req.body.consentedChats;
  // Saving consented chat users
  // Finding in participants model by clientId
  const clientId = req.body.clientId;
  await logClientInfo("Logging all messages from consented chats", clientId);
  const participant = await participants.findOne({ clientId: clientId });
  if (participant) {

    // compare consented chat users with existing consented chat users
    if (participant.consentedChatUsers.length > 0 && checkIfConsentedChatsUpdated(participant.consentedChatUsers, consentedChats)) {
      await logClientInfo("NOTE: CONSENTED CHATS UPDATED!", clientId);
      participant.consentedUsersChanged = true;
    }

    participant.consentedChatUsers = consentedChats;

    // check if participant is busy
    if (participant.isLogging) {
      res.status(200).send("busy");
      return;
    }

    if (req.body.deselectedChats) {
      participant.deselectedChats = req.body.deselectedChats;
    }
    participant.isLogging = true;
    participant.clientStatus = "LOGGING MESSAGES";
    await participant.save();
    // console.log("Consented chats saved!", participant);
  } else {
    console.log("Error while updating consented chats. Participant not found");
    await logClientInfo("Not found while updating consented chats", clientId);
    res.sendStatus(404);
    return;
  }

  // console.log(all_chats);
  // res.setHeader(all_chats, "all");
  res.setHeader("Content-Type", "text/html");
  // for (const chatID in consentedChats) {
  //   console.log(chatID);
  // }
  try {
    let msgresult = await logMessages(consentedChats, 0, req.body.clientId, req.body.participantId, req.body.clientName, minDate);
  } catch (err) {
    console.log(err);
    participant.disconnectedPrematurely = true;
    await participant.save();
  }

  let uncheckedChats = [];
  let checkedChats = [];
  if (req.body.checked_chatids) {
    checkedChats = await getChatNamesbyId(clientId, req.body.checked_chatids);
  }
  if (req.body.unchecked_chatids) {
    uncheckedChats = await getChatNamesbyId(clientId, req.body.unchecked_chatids);
  }

  if (checkedChats.length > 0 || uncheckedChats.length > 0) {
    const response = {
      "checked": checkedChats,
      "unchecked": uncheckedChats
    }
    res.status(200).send(response);
  }
  else {
    res.status(200).send("done");
  }

  await logClientInfo("Downloading media", clientId);
  participant.clientStatus = "DOWNLOADING MEDIA";
  await participant.save();
  try {
    let mediaresult = await downloadMedia(clientId);
  }
  catch (err) {
    console.log(err);
    participant.disconnectedPrematurely = true;
    await participant.save();
  }

  // remove client after logging
  const client = whatsappSessions.get(clientId);
  if (client && participant.autoforward == false) {
    await logClientInfo(
      "Disconnecting client after sucessfully logging messages and media",
      clientId
    );
    await client.clear();
    whatsappSessions.remove(clientId);
  }

  await logClientInfo("Anonymizing data", clientId);
  participant.clientStatus = "ANONYMIZING DATA";
  await participant.save();
  await anonymizeData(clientId);

  if (participant) {
    participant.isLogging = false;
    participant.clientStatus = "DISCONNECTED";
    await participant.save();
  }

  // const chat = await client.getChatById(number);
});

// get client-logs.txt
app.get("/client-logs", async (req, res) => {
  // fetch client logs
  // get only last 100 lines
  const data = shell.exec("tail -n 1000 client-logs.txt", { silent: true });
  res.send(data.stdout);
});

// refresh token api
app.get("/refresh", async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    console.log("No cookies found");
    return res.sendStatus(401);
  }
  const refreshToken = cookies.jwt;
  let role = "admin";
  let foundUser = await Admins.findOne({ refreshToken }).exec();
  if (!foundUser) {
    foundUser = await Surveyors.findOne({ refreshToken }).exec();
    if (!foundUser) return res.sendStatus(403); //Forbidden
    role = foundUser.isIndividual ? "individual" : "surveyor";
  }
  let surveyDisabled = true;
  if (role === "surveyor" || role === "individual") {
    surveyDisabled = foundUser.surveyDisabled;
  }
  // evaluate jwt
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || foundUser.username !== decoded.username)
      return res.sendStatus(403);

    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: decoded.username,
          role: role,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "900s" }
    );
    res.json({
      username: decoded.username,
      role: role,
      accessToken: accessToken,
      surveyDisabled: surveyDisabled,
    });
  });
});

//Register
app.post("/register-admin", async (req, res) => {
  // console.log(req);
  const { user, password } = req.body;
  if (!user || !password)
    return res
      .status(400)
      .json({ message: "Username and password are required." });

  // check for duplicate usernames in the db
  const duplicate = await Admins.findOne({ username: user }).exec();
  if (duplicate) return res.sendStatus(409); //Conflict

  try {
    //encrypt the password
    const hashedPwd = await bcrypt.hash(password, 10);

    //create and store the new user
    const result = await Admins.create({
      username: user,
      password: hashedPwd,
      bio: req.body.bio,
      contactInfo: req.body.contactInfo,
      last_name: req.body.last_name,
      name: req.body.name,
    });

    // console.log(result);

    res.status(201).json({ success: `New user ${user} created!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/register-surveyor", async (req, res) => {
  // console.log(req);
  const { user, password, admin } = req.body;
  if (!user || !password)
    return res
      .status(400)
      .json({ message: "Username and password are required." });

  // check for duplicate usernames in the db
  const duplicate = await Surveyors.findOne({ username: user }).exec();
  if (duplicate) return res.sendStatus(409); //Conflict
  const adminId = await Admins.findOne({ username: admin }).exec();
  try {
    //encrypt the password
    const hashedPwd = await bcrypt.hash(password, 10);
    // console.log(adminId._id);
    //create and store the new user
    const result = await Surveyors.create({
      username: user,
      password: hashedPwd,
      bio: req.body.bio,
      contactInfo: req.body.contactInfo,
      name: req.body.name,
      addedBy: adminId._id,
      isIndividual: req.body.isIndividual ? req.body.isIndividual : false,
      surveyDisabled: req.body.surveyDisabled ? req.body.surveyDisabled : false,
      region: req.body.region ? req.body.region : 'en',
    });

    // console.log(result);

    res.status(201).json({ success: `New user ${user} created!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// login
app.post("/login", async (req, res) => {
  const { user, password } = req.body;
  if (!user || !password)
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  let curRole = "admin";
  let foundUser = await Admins.findOne({ username: user }).exec();
  if (!foundUser) {
    foundUser = await Surveyors.findOne({ username: user }).exec();
    if (!foundUser) return res.sendStatus(401); //Unauthorized
    curRole = foundUser.isIndividual ? "individual" : "surveyor";
  }
  foundUser.lastActiveAt = new Date();
  await foundUser.save();
  // evaluate password
  const match = await bcrypt.compare(password, foundUser.password);
  if (match) {
    const role = curRole;
    // create JWTs
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          role: role,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "900s" }
    );
    const refreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );
    // Saving refreshToken with current user
    foundUser.refreshToken = refreshToken;
    const result = await foundUser.save();
    // console.log(result);
    // console.log(role);

    // Creates Secure Cookie with refresh token
    if (IS_HTTPS === true) {
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        secure: true,
        sameSite: "None",
      });
    } else {
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
    }

    // Send authorization roles and access token to user
    let surveyDisabled = true;
    let region = 'en';
    if (role === "surveyor" || role === "individual") {
      surveyDisabled = foundUser.surveyDisabled;
      region = foundUser.region;
    }

    res.json({ role, accessToken, surveyDisabled, region });
  } else {
    res.sendStatus(401);
  }
});
// app.use(verifyJWT);

// logout
app.get("/logout", async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  const refreshToken = cookies.jwt;

  // Is refreshToken in db?
  let foundUser = await Admins.findOne({ refreshToken }).exec();
  if (!foundUser) {
    foundUser = await Surveyors.findOne({ refreshToken }).exec();
  }
  if (!foundUser) {
    if (IS_HTTPS === true)
      res.clearCookie("jwt", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      });
    else res.clearCookie("jwt", { httpOnly: true });
    return res.sendStatus(204);
  }

  // Delete refreshToken in db
  foundUser.refreshToken = "";
  const result = await foundUser.save();
  // console.log(result);

  if (IS_HTTPS === true)
    res.clearCookie("jwt", { httpOnly: true, secure: true, sameSite: "None" });
  else res.clearCookie("jwt", { httpOnly: true });
  res.sendStatus(204);
});

// get participant id from clientId
app.post("/get-pid", async (req, res) => {
  const clientId = req.body.clientId;
  const foundUser = await participants.findOne({ clientId: clientId }).exec();
  if (!foundUser) return res.sendStatus(404); //Not found
  res.json({ participantId: foundUser._id });
});

// get dashboard data
// res = { key = clientId, value = {clientName, no. of msgs logged, last upd time, last actual message logged} }
app.post("/dashboard-info", verifyJWT, async (req, res) => {
  const dashboard_info = {};
  const role = req.body.role;
  const username = req.body.username;

  let message_logs = [];
  if (role === "surveyor" || role === "individual") {
    const user = await Surveyors.findOne({ username: username }).exec();
    // console.log(user._id);
    const p = await participants.find({ addedBy: user._id }).exec();
    // for each participant in p, get the message logs
    for (let participant of p) {
      const message_log = await message
        .find({ participantID: participant._id })
        .exec();
      message_logs.push(...message_log);
    }
  } else if (role === "admin") {
    message_logs = await message.find({}).exec();
  }

  // reading message logs
  for (const message_log of message_logs) {
    const file_name = message_log.messages.filename;
    const logs = await getJSONLogs(file_name);
    const modified_time = message_log.lastUpdated;
    message_log.messages = logs;

    if (message_log.userID in dashboard_info) {
      dashboard_info[message_log.userID].no_of_msgs_logged +=
        message_log.messages.length;
      dashboard_info[message_log.userID].message_from[message_log.chatID.user] =
        message_log.chatName;
      dashboard_info[message_log.userID].top_chats.push([
        message_log.chatName,
        message_log.messages.length,
      ]);
      if (modified_time > dashboard_info[message_log.userID].last_upd_time) {
        dashboard_info[message_log.userID].last_upd_time = modified_time;
      }
      if (
        dashboard_info[message_log.userID].last_activity < message_log.timestamp
      ) {
        dashboard_info[message_log.userID].last_activity =
          message_log.timestamp;
        dashboard_info[message_log.userID].last_actual_message_logged =
          message_log.messages[message_log.messages.length - 1];
      }
    } else {
      dashboard_info[message_log.userID] = {};
      dashboard_info[message_log.userID].message_from = {};
      dashboard_info[message_log.userID].top_chats = [];
      dashboard_info[message_log.userID].message_from[message_log.chatID.user] =
        message_log.chatName;
      dashboard_info[message_log.userID].top_chats.push([
        message_log.chatName,
        message_log.messages.length,
      ]);
      dashboard_info[message_log.userID].userName = message_log.userName;
      dashboard_info[message_log.userID].no_of_msgs_logged =
        message_log.messages.length;
      dashboard_info[message_log.userID].last_upd_time = modified_time;
      dashboard_info[message_log.userID].last_activity = message_log.timestamp;
      dashboard_info[message_log.userID].last_actual_message_logged =
        message_log.messages[message_log.messages.length - 1];
    }
    // dashboard_info[filename] = file;
  }

  let chat_logs = [];
  if (role === "surveyor" || role === "individual") {
    const user = await Surveyors.findOne({ username: username }).exec();
    const p = await participants.find({ addedBy: user._id }).exec();
    // for each participant in p, get the message logs
    for (let participant of p) {
      const chat_log = await chatUsers
        .find({ participantID: participant._id })
        .exec();
      chat_logs.push(...chat_log);
    }
  } else if (role === "admin") {
    chat_logs = await chatUsers.find({}).exec();
  }

  // reading chat logs
  for (const chat_log of chat_logs) {
    const file_name = chat_log.chats.filename;
    const logs = await getJSONLogs(file_name);
    chat_log.chats = logs;
    if (chat_log.userID in dashboard_info === false) {
      dashboard_info[chat_log.userID] = {};
      dashboard_info[chat_log.userID].userName = chat_log.userName;
    }
    if ("top_chats" in dashboard_info[chat_log.userID] === false) {
      dashboard_info[chat_log.userID].top_chats = [];
    }
    dashboard_info[chat_log.userID].no_of_chat_users = chat_log.chats.length;
    dashboard_info[chat_log.userID].chat_users = {};
    for (chat of chat_log.chats) {
      dashboard_info[chat_log.userID].chat_users[chat.id._serialized] =
        chat.name;
    }
    // sorting top_chats list and getting top 5 chat users
    dashboard_info[chat_log.userID].top_chats.sort((a, b) => {
      return b[1] - a[1];
    });
    dashboard_info[chat_log.userID].top_chats = dashboard_info[
      chat_log.userID
    ].top_chats.slice(0, 5);
    // dashboard_info[filename] = file;
  }

  let contact_logs = [];
  if (role === "surveyor" || role === "individual") {
    const user = await Surveyors.findOne({ username: username }).exec();
    const p = await participants.find({ addedBy: user._id }).exec();
    // for each participant in p, get the message logs
    for (let participant of p) {
      const contact_log = await contacts
        .find({ participantID: participant._id })
        .exec();
      contact_logs.push(...contact_log);
    }
  } else if (role === "admin") {
    contact_logs = await contacts.find({}).exec();
  }

  // reading contact logs
  for (const contact_log of contact_logs) {
    const file_name = contact_log.contacts.filename;
    const logs = await getJSONLogs(file_name);
    const modified_time = contact_log.lastUpdated;
    contact_log.contacts = logs;

    if (contact_log.userID in dashboard_info === false) {
      dashboard_info[contact_log.userID] = {};
      dashboard_info[contact_log.userID].userName = contact_log.userName;
    }
    dashboard_info[contact_log.userID].no_of_contacts =
      contact_log.contacts.length;
    dashboard_info[contact_log.userID].last_contact_upd_time = modified_time;
  }

  res.send(dashboard_info);
});

app.post("/all-chatName", verifyJWT, async (req, res) => {
  const clientId = req.body.clientId;
  const participantId = req.body.participantId;
  const clientName = req.body.clientName;
  await logClientInfo("Logging all chat names", clientId);

  // check if the participant is busy
  const participant = await participants.findOne({ clientId: clientId }).exec();
  if (participant.isLogging) {
    res.status(200).send("busy");
    return;
  }
  participant.isLogging = true;
  participant.clientStatus = "LOGGING CHATS";
  await participant.save();

  if (!whatsappSessions.has(clientId)) {
    await logClientInfo("Client not found", clientId);
    res.status(200).send("err");
    return;
  }

  const chat_logs = await logAllChatNames(clientId, participantId, clientName);

  participant.isLogging = false;
  participant.clientStatus = "CONNECTED";
  await participant.save();

  res.status(200).send({
    chats: chat_logs
  });
});

// logging all contacts
app.post("/all-contacts", verifyJWT, async (req, res) => {
  const clientId = req.body.clientId;
  await logClientInfo("Logging all contacts", clientId);
  // check if participant is busy
  const participant = await participants.findOne({ clientId: clientId }).exec();
  if (participant.isLogging) {
    res.status(200).send("busy");
    return;
  }
  participant.isLogging = true;
  participant.clientStatus = "LOGGING CONTACTS";
  await participant.save();

  await logAllContacts(clientId, req.body.participantId, req.body.clientName);

  participant.isLogging = false;
  participant.clientStatus = "CONNECTED";
  await participant.save();

  res.status(200).send("Contacts logged");
});

app.get("/getClientState", async (req, res) => {
  const client = whatsappSessions.get(req.query.clientId);
  if (whatsappSessions.has(req.query.clientId)) {
    try {
      let currentState = await client.getState();
      res.status(200).send(currentState);
    } catch (err) {
      console.log(err);
      whatsappSessions.remove(req.query.clientId);
      res.status(200).send("NoCLient");
    }
  } else {
    res.status(200).send("NoCLient");
  }
});

//add new participant
const addParticipant = async (particpantData, clientInfo) => {
  const surveyor = particpantData.surveyor;
  const sID = await Surveyors.findOne({ username: surveyor });
  // check if participant exists
  const participant = await participants
    .findOne({ clientId: particpantData.clientId })
    .exec();
  if (participant) {
    await logClientInfo(
      "Participant already exists, cannot add again",
      participant.clientId
    );
    return "error adding user";
  }

  const p = new participants({
    name: particpantData.name,
    clientId: particpantData.clientId,
    clientInfo: clientInfo,
    dateOfRegistration: new Date(),
    addedBy: sID._id,
    addedByName: surveyor,
    bio: particpantData.bio,
    contactInfo: particpantData.contactInfo,
    surveyDisabled: sID.surveyDisabled,
    location: particpantData.location,
  });

  sID.participantsAdded.push(p._id);
  await sID.save();
  await p.save();

  return "Participant added";
};

//get all participants added by a surveyor

app.post("/getParticipants", verifyJWT, async (req, res) => {
  const username = req.body.username;
  const role = req.body.role;

  if (role === "surveyor" || role === "individual") {
    const sID = await Surveyors.findOne({ username: username });
    // console.log("Sid: ", username);
    const p = await participants.find({ addedBy: sID._id }).sort({ dateOfRegistration: -1 });
    res.status(200).send(p);
  } else if (role === "admin") {
    const p = await participants.find({}).sort({ dateOfRegistration: -1 });
    res.status(200).send(p);
  }
});

//delete a participant
app.post("/removeParticipant/:clientId", verifyJWT, async (req, res) => {
  const foundUser = await participants.findOne({
    clientId: req.params.clientId,
  });
  const surveyor = await Surveyors.findOne({ _id: foundUser.addedBy });
  if (surveyor) {
    surveyor.participantsAdded.pull(foundUser._id);
    surveyor.save();
  }
  foundUser.remove();
  await logClientInfo("Participant removed from db", req.params.clientId);
  res.status(200).send("Deleted");
});

// get chat users with number of messages
app.post("/getChatUsers", verifyJWT, async (req, res) => {
  const all_chats = await chatUsers.findOne({ userID: req.body.clientId });
  if (all_chats) {
    all_chats.chats = await getJSONLogs(all_chats.chats.filename);
    res.status(200).send(all_chats);
    return;
  }
  else {
    // Log chat users again
    const clientId = req.body.clientId;
    await logClientInfo("Logging all chat names", clientId);
    const participant = await participants.findOne({ clientId: clientId }).exec();
    const participantId = participant._id;
    const clientName = participant.name;
    if (participant.isLogging) {
      await logClientInfo("Participant busy while logging chat names", clientId);
      res.status(200).send("busy");
      return;
    }
    participant.isLogging = true;
    participant.clientStatus = "LOGGING CHATS";
    await participant.save();

    if (!whatsappSessions.has(clientId)) {
      await logClientInfo("Client not found", clientId);
      res.status(200).send("err");
      return;
    }

    const chat_logs = await logAllChatNames(clientId, participantId, clientName);

    participant.isLogging = false;
    participant.clientStatus = "CONNECTED";
    await participant.save();

    res.status(200).send({
      chats: chat_logs
    });
  }
});

// list all surveyors
app.get("/getSurveyors", verifyJWT, async (req, res) => {
  const s = await Surveyors.find();
  res.send(s);
});

// delete a surveyor
app.post("/removeSurveyor", verifyJWT, async (req, res) => {
  Surveyors.deleteOne(
    {
      username: req.body.username,
    },
    function (err, user) {
      if (err) return console.error(err);
      // console.log("User successfully removed from surveyors list!");
      res.status(200).send("Deleted");
    }
  );
});

function loadJsonFilesWithPrefix(prefix) {
  const jsonObjects = [];
  const folderPath = path.join(__dirname, 'formResponse');
  const files = fs.readdirSync(folderPath);

  for (const filename of files) {
    if (filename.endsWith('.json') && filename.startsWith(prefix)) {
      const filePath = path.join(folderPath, filename);
      try {
        const jsonData = fs.readFileSync(filePath, 'utf-8');
        const jsonObject = JSON.parse(jsonData);
        jsonObjects.push(jsonObject);
      } catch (error) {
        console.error(`Error reading or parsing JSON in ${filename}: ${error.message}`);
      }
    }
  }

  return jsonObjects;
}

const dailyReport = async () => {
  // Get all participants added in last week
  const newParticipants = await participants.find({ "dateOfRegistration": { $gt: new Date(Date.now() - 25 * 60 * 60 * 1000) } });
  const report = {};
  for (const participant of newParticipants) {
    const consentedUsers = {};
    for (const cu of participant.consentedChatUsers) {
      consentedUsers[cu[0]] = cu[1];
    }

    // const clientSurveyResults = loadJsonFilesWithPrefix(participant.clientId);


    const data = {
      clientId: participant.clientId,
      name: participant.name,
      DOJ: participant.dateOfRegistration,
      surveyor: participant.addedByName,
      revoked: participant.isRevoked,
      revokeTime: participant.revokeTime,
      consentedUsersChanged: participant.consentedUsersChanged,
      disconnectedPrematurely: participant.disconnectedPrematurely,
      eligibleGroups: 0,
      consentedGroups: 0,
      totalGroups: 0,
      totalIndividualChats: 0,
      defaultSelectedGroups: 0,
      deselectedGroups: 0,
      additionalSelectedGroups: 0,
      messagesLogged: 0,
      // surveyResults: clientSurveyResults
    }


    const chatUser = await chatUsers.findOne({ userID: participant.clientId });
    const chat_logs = await getJSONLogs(chatUser.chats.filename);

    for (const chatInfo of chat_logs) {
      if (chatInfo['isGroup']) {
        data.totalGroups++;
        if (chatInfo['num_participants'] >= 5) {
          data.eligibleGroups++;
          if (chatInfo['num_messages'] >= 15) {
            data.defaultSelectedGroups++;
            if (!consentedUsers[chatInfo['id']['_serialized']]) {
              data.deselectedGroups++;
            }
          }
        }
        if (consentedUsers[chatInfo['id']['_serialized']]) {
          data.consentedGroups++;
        }
      } else {
        data.totalIndividualChats++;
      }
    }
    data.additionalSelectedGroups = data.consentedGroups - (data.defaultSelectedGroups - data.deselectedGroups);
    const message_logs = await message.find({ participantID: participant._id });
    for (const msg of message_logs) {
      data.messagesLogged += msg.messages.length;
    }

    report[participant.clientId] = data;
  }
  return report;
};

app.post("/dailyReport", verifyJWT, async (req, res) => {
  const role = req.body.role;
  if (role === "admin") {
    const report = await dailyReport();
    res.send(report);
  } else {
    res.send({});
  }
});

app.get("/killClient", async (req, res) => {
  const client = whatsappSessions.get(req.query.clientId);
  if (client !== undefined) {
    await client.removeAllListeners("qr");
    client.on("qr", async () => {
      await logClientInfo("Removing Client", req.query.clientId);
      await client.clear();
      delete whatsappSessions.remove(req.query.clientId);
    });
  }
  res.status(200).send("Killed");
});

app.post("/authUser2", async (req, res) => {
  const clientId = req.body.clientId;
  // console.log("Creating user: ", clientId);

  // First time registration, client wont be in the whatsappSessions
  const client = new ClientConnection(req.body.clientId, false, true);
  whatsappSessions.put(clientId, client);
  await logClientInfo("Connecting new participant", clientId);

  // wait for qr code
  client.once("qr", (qr) => {
    // console.log("QR RECEIVED", clientId);
    qrcode.toDataURL(qr, (err, url) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error");
      } else {
        res.status(200).send(url);
      }
    });
  });

  client.connect();
});

app.post("/getClientStatus", verifyJWT, async (req, res) => {
  const clientId = req.body.clientId;
  const participant = await participants.findOne({ clientId: clientId });

  if (participant) {
    res.status(200).send(participant.clientStatus);
  } else {
    res.status(200).send("ERR_NOT_FOUND");
  }
});

app.post("/getClientStatus2", verifyJWT, async (req, res) => {
  const role = req.body.role;
  const username = req.body.username;
  let statusDict = {};
  let p = [];
  if (role === "surveyor" || role === "individual") {
    const user = await Surveyors.findOne({ username: username }).exec();
    p = await participants.find({ addedBy: user._id }).exec();
  } else if (role === "admin") {
    p = await participants.find({}).exec();
  }
  for (let participant of p) {
    statusDict[participant.clientId] = participant.clientStatus;
  }
  res.status(200).send(statusDict);
});

app.post("/waitForClient", async (req, res) => {
  const clientId = req.body.clientId;
  const client = whatsappSessions.get(clientId);
  if (client !== undefined) {
    client.once("connected", async () => {
      await logClientInfo("Authenticated", req.body.clientId);
      const participantData = req.body.participant;
      try {
        const clientInfo = await client.getInfo();
        const result = await addParticipant(participantData, clientInfo);
        await logClientInfo("Participant added", req.body.clientId);
        res.status(200).send(result);
      } catch (err) {
        console.log(err);
        res.status(200).send("error adding user");
      }
      // cache chat users
      const participantId = await participants.findOne({ clientId: clientId });
      if (participantId) {
        await logClientInfo("Logging all Chat Users for the first time", clientId);
        await participants.findByIdAndUpdate(participantId._id, {
          isLogging: true,
          clientStatus: "LOGGING CHATS",
        });
        const result = await logAllChatNames(
          clientId,
          participantId._id,
          participantData.name
        );
      }
      await client.clear();
      // client.removeAllListeners();
      await participants.findByIdAndUpdate(participantId._id, {
        clientStatus: "DISCONNECTED",
        isLogging: false,
      });
      await logClientInfo(
        "Client disconnected after logging chat users",
        clientId
      );
      whatsappSessions.remove(clientId);
    });
    client.on("qr", async () => {
      res.status(200).send("qr expired");
      await logClientInfo("QR timed out", clientId);
      await client.clear();
      // client.removeAllListeners();
      whatsappSessions.remove(clientId);
    });
  } else {
    res.status(404).send("Client not found");
  }
});

// connecting to a previously added user from web app
app.post("/authUser", async (req, res) => {
  const clientId = req.body.clientId;
  const participant = await participants.findOne({ clientId: clientId });
  if (whatsappSessions.has(req.body.clientId)) {
    // check if the participant is busy or not
    if (participant) {
      if (participant.isLogging) {
        res.status(200).send("busy");
        await logClientInfo("Participant is busy", req.body.clientId);
        return;
      }
      else if (participant.clientStatus == "CONNECTED") {
        res.status(200).send("authenticated");
        await logClientInfo("Participant already authenticated, acquring", req.body.clientId);
        return;
      }
    }
    const client = whatsappSessions.get(req.body.clientId);
    await client.clear();
    whatsappSessions.remove(req.body.clientId);
    await logClientInfo("Client destroyed", req.body.clientId);
  } else {
    if (participant) {
      if (participant.isLogging) {
        participant.isLogging = false;
        participant.clientStatus = "DISCONNECTED";
        await participant.save();
      }
    }
    await logClientInfo("Client not in whatsappSessions", req.body.clientId);
  }

  // console.log(req.body.clientId);
  if (participant && participant.isRevoked) {
    await logClientInfo(
      "User needs to scan QR, possibly revoked access",
      req.body.clientId
    );
    res.status(200).send("qr");
    return;
  }

  const client = new ClientConnection(req.body.clientId, false, true);
  whatsappSessions.put(req.body.clientId, client);
  await logClientInfo("Connecting...", req.body.clientId);

  client.once("qr", async (qr) => {
    await logClientInfo(
      "User needs to scan QR, possibly revoked access",
      req.body.clientId
    );
    res.status(200).send("qr");
    await client.clearRevoked();
    whatsappSessions.remove(req.body.clientId);
    await participants.findOneAndUpdate({ clientId: req.body.clientId }, {
      $set: {
        isRevoked: true,
        revokeTime: new Date()
      }
    });
  });

  client.once("connected", async () => {
    res.status(200).send("authenticated");
    participant.clientStatus = "CONNECTED";
    participant.clientInfo = await client.getInfo();
    await participant.save();
    client.removeAllListeners();
  });

  client.once("auth_failure", async () => {
    res.status(200).send("auth_failure");
    await client.clear();
    whatsappSessions.remove(req.body.clientId);
  });

  client.connect();
});

app.post('/save-survey', verifyJWT, async (req, res) => {
  const jsonData = req.body;

  // const timestamp = new Date().getTime();
  const filename = `./formResponse/${jsonData.info.clientId}_${jsonData.info.surveyType}_${jsonData.info.clientName}.json`;

  fs.writeFile(filename, JSON.stringify(jsonData, null, 2), err => {
    if (err) {
      console.error('Error saving data to file:', err);
      res.status(500).send('Error saving data to server');
    } else {
      console.log('Data saved to file successfully!');
      res.status(200).send("SurveySaved");
    }
  });
});

server.listen(port, function () {
  console.log("App running on *: " + port);
  mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
  });
});

const db = mongoose.connection;
global.bucket = new mongodb.GridFSBucket(db, { bucketName: "largeFiles" });



db.on("error", (err) => console.log(err));

db.once("open", async () => {
  // require("./routes/logRoutes")(app, client);
  console.log(`MongoDb Connected ...`);
  await addDefaultAdmin();
  await resetClientStatus();
  connectAutoForwardingClients();
  clearUnusedSessions();
  // setTimeout(autoLogging, 10000);
});

// every day at 7:30 pm GMT call the function autoLogging
cron.schedule(config.get('autologger.cron'), () => {
  autoLogging();
});
