const MessageTypes = require("whatsapp-web.js").MessageTypes;
const Admins = require("../../models/admins");
const { encryptContact } = require("../../middleware/hashing");
const config = require('config');

const asyncCallWithTimeout = async (asyncPromise, timeLimit) => {
  let timeoutHandle;

  const timeoutPromise = new Promise((_resolve, reject) => {
    timeoutHandle = setTimeout(
      () => reject(new Error('Async call timeout limit reached')),
      timeLimit
    );
  });

  try {
    return Promise.race([asyncPromise, timeoutPromise]).then(
      response => {
        return response;
      }
    ).catch(
      err => {
        console.log(err);
        return -1;
      }
    ).finally(
      () => clearTimeout(timeoutHandle)
    );
  } catch (err) {
    console.log(err);
    return -1;
  }
}

const mergeMessages = async (oldMessages, newMessages) => {
  let id_dict = {};
  let processedOldMessages = [];
  for (let i = 0; i < oldMessages.length; i++) {
    if (oldMessages[i]['msg_id'] in id_dict) {
      continue;
    } else {
      processedOldMessages.push(oldMessages[i]);
      id_dict[oldMessages[i]['msg_id']] = true;
    }
  }
  let mergedMessages = [...processedOldMessages];


  for (let i = 0; i < newMessages.length; i++) {
    let newMessage = newMessages[i];
    let found = false;
    for (let j = 0; j < processedOldMessages.length; j++) {
      let oldMessage = processedOldMessages[j];
      if (newMessage['id']['_serialized'] === oldMessage['msg_id']) {
        mergedMessages[j]['reactionData'] = newMessage['reactionData'];
        mergedMessages[j]['messageStatus'] = newMessage['messageStatus'];
        mergedMessages[j]['encryptedBody'] = newMessage['encryptedBody'];
        found = true;
        break;
      }
    }
    if (!found) {
      mergedMessages.push(newMessage);
    }
  }

  // sort messages by timestamp in ascending order
  mergedMessages.sort((a, b) => {
    return a.timestamp - b.timestamp;
  });
  return mergedMessages;
};

const mergeChats = async (oldChats, newChats) => {

  let all_chats = [];
  let id_dict = {};

  for (let i = 0; i< newChats.length; i++) {
    let newChat = newChats[i];
    let newChatId = newChat['id']['_serialized'];
    if (newChatId in id_dict) {
      continue;
    } else {
      id_dict[newChatId] = true;
      all_chats.push(newChat);
    }
  }

  for (let i = 0; i< oldChats.length; i++) {
    let oldChat = oldChats[i];
    let oldChatId = oldChat['id']['_serialized'];
    if (oldChatId in id_dict) {
      continue;
    } else {
      id_dict[oldChatId] = true;
      all_chats.push(oldChat);
    }
  }

  return all_chats;
};

const addDefaultAdmin = async () => {

  const data = {
    username: "admin",
    password: "$2b$10$jw1uUYEFySJSb5xzRRAUHuiIJW5TlGkfXKJHNFBVgOtWotuNGaVvK",
    name: "admin",
    last_name: "admin",
    contactInfo: {
      phoneNumber: "String",
      address: "String",
      email: "String",
    },
    bio: "i am admin",
  }

  // check if admin already exists
  const a = await Admins.findOne({ username: data.username });
  if (a) {
    return;
  } else {
    await Admins.create(data);
    console.log("Default admin created successfully");
    console.log("username: admin");
    console.log("password: 12345");
  }

}

async function anonymizeContactID(contactId) {
  contactId['user'] = encryptContact(contactId['user']);
  contactId['_serialized'] = encryptContact(contactId['_serialized'].split("@")[0]) + "@" + contactId['_serialized'].split("@")[1];
  return contactId;
}

async function anonymizeClientInfo(clientInfo) {
  clientInfo['pushname'] = encryptContact(clientInfo['pushname']);
  let wid = clientInfo['wid'];
  wid = await anonymizeContactID(wid);
  clientInfo['wid'] = wid;
  delete clientInfo['me'];
  return clientInfo;
}

async function anonymizeMessageStatus(messageStatus) {
  // contact arrays to anonymize
  if (!messageStatus) {
    return;
  }
  let contactIdFields = ['delivery', 'played', 'read'];
  for (let i = 0; i < contactIdFields.length; i++) {
    let field = contactIdFields[i];
    let contactIds = messageStatus[field];
    if (!contactIds) {
      continue;
    }
    for (let j = 0; j < contactIds.length; j++) {
      contactIds[j]["id"] = await anonymizeContactID(contactIds[j]["id"]);
    }
    messageStatus[field] = contactIds;
  }
  return messageStatus;
}

async function anonymizeReactions(reactions) {
  if (!reactions) {
    return;
  }
  for (let i = 0; i < reactions.length; i++) {
    let senders = reactions[i]["senders"];
    if (!senders) {
      continue;
    }
    for (let j = 0; j < senders.length; j++) {
      let sender = senders[j];
      if ("id" in sender) {
        sender['id'] = encryptContact(sender['id']);
      }
      if ("msgId" in sender) {
        sender['msgId'] = encryptContact(sender['msgId']);
      }
      if ("senderId" in sender) {
        sender['senderId'] = encryptContact(sender['senderId'].split("@")[0]) + "@" + sender['senderId'].split("@")[1];
      }
      senders[j] = sender;
    }
    reactions[i]["senders"] = senders;
  }
  return reactions;
}

function validateMedia(messageData) {
  const messageType = messageData["type"];
  const forwardingScore = messageData["forwardingScore"];
  // const allowedDuration = config.get("video.maxDuration") === "Infinity" ? Number.MAX_SAFE_INTEGER : config.get("video.maxDuration");
  const forwardingThreshold = config.get("video.forwardingScore");
  // check if the file is an audio
  if (messageType === MessageTypes.AUDIO || messageType === MessageTypes.VOICE) {
    if (config.get("audio.enabled")) {
      return true;
    } else {
      return false;
    }
  }

  // check if the file is a video
  if (messageType === MessageTypes.VIDEO) {
    if (config.get("video.enabled") && forwardingScore >= forwardingThreshold) {
      return true;
    } else {
      return false;
    }
  }

  return true;
}

function checkIfConsentedChatsUpdated(oldChatsList, newChatsList) {
  // sort the lists by chatId
  oldChatsList.sort((a, b) => {
    return a[0] - b[0];
  });

  // if the length of the lists are different
  // then the chats are updated
  if (oldChatsList.length !== newChatsList.length) {
    return true;
  }

  // if the length is the same
  // then check if the chats are the same
  // if not then the chats are updated
  for (let i = 0; i < oldChatsList.length; i++) {
    if (oldChatsList[i][0] !== newChatsList[i][0] || oldChatsList[i][1] !== newChatsList[i][1]) {
      return true;
    }
  }

  // if the chats are the same
  // then the chats are not updated
  return false;
}

module.exports = {
  asyncCallWithTimeout,
  mergeMessages,
  mergeChats,
  addDefaultAdmin,
  anonymizeClientInfo,
  validateMedia,
  anonymizeMessageStatus,
  anonymizeReactions,
  checkIfConsentedChatsUpdated
}