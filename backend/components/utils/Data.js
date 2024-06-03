const fs = require("fs");
const { logClientInfo } = require("./Logger");
const { Message } = require("whatsapp-web.js");
const participants = require("../../models/participants");
const contacts = require("../../models/contacts");
const chatUsers = require("../../models/chatUsers");
const message = require("../../models/message");
const { asyncCallWithTimeout, mergeMessages, mergeChats, validateMedia, anonymizeMessageStatus, anonymizeReactions } = require("./Utils");
const { DeidentifyMessage } = require("../../middleware/identification");
const { encryptContact, decryptContact } = require("../../middleware/hashing");
const { removeFileFromDB, getJSONLogs, storeFileInDB } = require("./GridFS");
const { v4: uuidv4 } = require("uuid");
const config = require('config');

const getNumMessages = async (chat) => {
    const params = {
        limit: config.get("messages.limit") === "Infinity" ? Number.MAX_VALUE : config.get("messages.limit"),
    };
    const recentMessagesDate = new Date();
    recentMessagesDate.setDate(recentMessagesDate.getDate() - config.get("messages.recent"));
    recentMessagesDate.setHours(0, 0, 0, 0);
    let status;
    let result = await asyncCallWithTimeout(chat.fetchMessages(params), config.get("timeouts.numMessages"));
    if (result == -1) {
        console.log("Getting message count taking too long, skipping..");
        return 0
    }
    else {
        status = result;
    }
    let num_messages = 0;
    for (const message of status) {
        if (message.timestamp > recentMessagesDate.getTime() / 1000) {
            num_messages++;
        }
    }
    // console.log(num_messages);
    return num_messages;
};

const getAllNumMessages = async (chats) => {
    let all_chats = [];
    for (let chat of chats) {
        try {
            const num_messages = await getNumMessages(chat);
            chat['num_messages'] = num_messages;
        }
        catch {
            console.log("Unable to fetch message count for chat ", chat['name']);
            chat['num_messages'] = 0;
        }
        all_chats.push(chat);
    }
    return all_chats;
};

// logging all chats(personal / group)
const logAllChatNames = async (clientId, participantId, clientName) => {
    const client = whatsappSessions.get(clientId);
    let all_chats = await client.getChats();

    const chat_logs = {};
    chat_logs.userID = clientId;
    chat_logs.participantID = participantId;
    chat_logs.userName = clientName;
    chat_logs.chats = await getAllNumMessages(all_chats);

    for (let j = 0; j < chat_logs.chats.length; j++) {
        let user = chat_logs.chats[j]['id']['user'];
        if (user) {
            let anon_id = encryptContact(user);
            chat_logs.chats[j]['id']['user'] = anon_id;
        }

        let serialized = chat_logs.chats[j]['id']['_serialized'].split("@")[0];
        if (serialized) {
            let anon_id = encryptContact(serialized);
            chat_logs.chats[j]['id']['_serialized'] =
                anon_id + "@" + chat_logs.chats[j]['id']['_serialized'].split("@")[1];
        }

        let groupMetadata = chat_logs.chats[j]['groupMetadata'];
        if (groupMetadata) {
            let participants = groupMetadata['participants'];
            chat_logs.chats[j]['num_participants'] = participants.length;
            // remove property groupMetadata from chat
            delete chat_logs.chats[j]['groupMetadata'];
        }
        let lastMessage = chat_logs.chats[j]['lastMessage'];
        if (lastMessage) {
            delete chat_logs.chats[j]['lastMessage'];
        }

        // let name = chat_logs.chats[j]['name'];
        // if (name) {
        //     let anon_id = encryptContact(name);
        //     chat_logs.chats[j]['name'] = anon_id;
        // }
        chat_logs.chats[j]['isAnonymized'] = true;
    }

    // const chatsToBeReturned = structuredClone(chat_logs.chats);
    // chats to be stored does not countain num_messages and name
    const chatsToBeStored = chat_logs.chats;
    // for (let j = 0; j < chatsToBeStored.length; j++) {
    //     if ("num_messages" in chatsToBeStored[j]) {
    //         delete chatsToBeStored[j]["num_messages"];
    //     }
    //     if ("name" in chatsToBeStored[j]) {
    //         delete chatsToBeStored[j]["name"];
    //     }
    // }
    // check if chat log exists for the user
    const chatUser = await chatUsers.findOne({ userID: chat_logs.userID }).exec();
    const fileData = {
        data: chatsToBeStored,
        mimetype: "application/json",
        filename: "chat_logs.json",
        filesize: chatsToBeStored.length,
    };

    // Dont store chats with 0 data
    if (chatsToBeStored.length === 0) {
        return chatsToBeStored;
    }

    if (chatUser) {
        // update the chat log
        let chat_logs = await getJSONLogs(chatUser.chats.filename);
        let mergedChats = await mergeChats(chat_logs, chatsToBeStored);
        fileData.data = mergedChats;
        fileData.filesize = mergedChats.length;
        let filename = "";
        try {
            filename = await storeFileInDB(fileData);
            removeFileFromDB(chatUser.chats.filename);
            chatUser.chats.filename = filename;
            chatUser.chats.length = chatsToBeStored.length;
            await chatUser.updateOne({
                $set: {
                    chats: chatUser.chats,
                    lastUpdated: Date.now()
                }
            }).exec();
        } catch (err) {
            console.log("Cannot upload chatuser logs: ", err);
        }
    } else {
        let filename = "";
        try {
            filename = await storeFileInDB(fileData);
            chat_logs.chats = {
                filename: filename,
                length: chatsToBeStored.length
            };
            chat_logs.lastUpdated = new Date();
            const newChatUser = new chatUsers(chat_logs);
            await newChatUser.save();
        } catch (err) {
            console.log("Cannot upload chatuser logs: ", err);
        }
    }
    return chatsToBeStored;
};

const logAllContacts = async (clientId, participantId, clientName) => {
    const client = whatsappSessions.get(clientId);
    let all_contacts = await client.getContacts();

    const all_contacts_logs = {};
    all_contacts_logs.userID = clientId;
    all_contacts_logs.userName = clientName;
    all_contacts_logs.participantID = participantId;
    all_contacts_logs.contacts = all_contacts;

    // Anonymize contacts
    for (let j = 0; j < all_contacts.length; j++) {

        if ("businessProfile" in all_contacts[j]) {
            delete all_contacts[j]["businessProfile"]
        }

        let numberField = all_contacts[j]['number'];
        if (numberField) {
            let anon_id = encryptContact(numberField);
            all_contacts[j]['number'] = anon_id;
        }

        let nameFields = ['name', 'pushname', 'verifiedName', 'shortName'];
        for (let k = 0; k < nameFields.length; k++) {
            let nameField = nameFields[k];
            if (nameField in all_contacts[j] && all_contacts[j][nameField]) {
                let anon_id = encryptContact(all_contacts[j][nameField]);
                all_contacts[j][nameField] = anon_id;
            }
        }

        if (all_contacts[j]['isAnonymized']) {
            continue;
        }
        let contact_user = all_contacts[j]['id']['user'];
        if (contact_user) {
            let anon_id = encryptContact(contact_user);
            all_contacts[j]['id']['user'] = anon_id;
        }

        let contact_serialized =
            all_contacts[j]['id']['_serialized'].split("@")[0];
        if (contact_serialized) {
            let anon_id = encryptContact(contact_serialized);
            all_contacts[j]['id']['_serialized'] =
                anon_id +
                "@" +
                all_contacts[j]['id']['_serialized'].split("@")[1];
        }
        all_contacts[j]["isAnonymized"] = true;
    }

    // check if contact log exists for the user
    const contact = await contacts
        .findOne({ userID: all_contacts_logs.userID })
        .exec();
    const fileData = {
        data: all_contacts,
        mimetype: "application/json",
        filename: "contact_logs.json",
        filesize: all_contacts.length,
    };
    if (contact) {
        // update the contact log
        let filename = "";
        try {
            filename = await storeFileInDB(fileData);
            removeFileFromDB(contact.contacts.filename);
            contact.contacts.filename = filename;
            contact.contacts.length = all_contacts.length;
            await contact.updateOne({
                $set: {
                    contacts: contact.contacts,
                    lastUpdated: Date.now()
                }
            }).exec();
        } catch (err) {
            console.log("Cannot upload contact logs: ", err);
        }
    } else {
        // create a new contact log
        let filename = "";
        try {
            filename = await storeFileInDB(fileData);
            all_contacts_logs.contacts = {
                filename: filename,
                length: all_contacts.length
            };
            all_contacts_logs.lastUpdated = new Date();
            const newContact = new contacts(all_contacts_logs);
            await newContact.save();
        } catch (err) {
            console.log("Cannot upload contact logs: ", err);
        }
    }
}

const logMessages = async (consentedChats, idx, clientId, participantId, clientName, date) => {
    if (idx === consentedChats.length) {
        return 0;
    }
    
    if (consentedChats[idx][1] === false) {
        return await logMessages(consentedChats, idx + 1, clientId, participantId, clientName, date);
    }
    
    // console.log("logging messages for ", consentedChats[idx][0]);
    const client = whatsappSessions.get(clientId);
    const decryptedId =
    decryptContact(consentedChats[idx][0].split("@")[0]) +
    "@" +
    consentedChats[idx][0].split("@")[1];
    let newMessageCount = 0;
    
    try {
        const messageData = await client.getMessages(decryptedId);
        let n_chat = messageData.chat;
        let status = messageData.messages;

        const final_messages = [];
        let deidentified_messages = [];
        let deidentified_replies = [];
        const deidentifier = new DeidentifyMessage();
        deidentifier.addField("message_body");
        deidentifier.addField("message_reply");
        for (const message of status) {
            if (message.timestamp > date.getTime() / 1000) {
                let body = "EMPTY";
                let reply = "EMPTY";
                if (!(message.body) || message.body === "") {
                    body = `${message.type} Message`.toUpperCase();
                } else {
                    body = message.body;
                }
                if (message?.hasQuotedMsg) {
                    let text = message?._data?.quotedMsg?.body;
                    if (!(text) || text === "") {
                        reply = "-";
                    } else {
                        reply = text;
                    }
                }
                deidentifier.addRow([body, reply]);
            }
        }
        try {
            await deidentifier.inspect();
        } catch (err) {
            console.log("Error in dlp library: ", err);
            logClientInfo("Error in dlp anonymization", req.body.clientId);
        }
        deidentified_messages = deidentifier.data["message_body"];
        deidentified_replies = deidentifier.data["message_reply"];
        let idx = 0;
        for (const message of status) {
            // console.log(message.timestamp, minDate.getTime());
            if (message.timestamp > date.getTime() / 1000) {
                let msg = JSON.parse(JSON.stringify(message));
                if (deidentified_messages[idx] !== msg.body) {
                    msg['encryptedBody'] = true;
                } else {
                    msg['encryptedBody'] = false;
                }
                msg.body = deidentified_messages[idx];
                msg._data.body = deidentified_messages[idx];

                if (message?.hasQuotedMsg) {
                    msg._data.quotedMsg.body = deidentified_replies[idx];
                    msg['messageReply'] = deidentified_replies[idx];
                }

                final_messages.push(msg);
                idx++;
            }
        }

        const message_log = {};
        message_log.userID = clientId;
        message_log.participantID = participantId;
        message_log.userName = clientName;
        message_log.chatName = n_chat.name;
        message_log.isGroup = n_chat.isGroup;
        message_log.timestamp = n_chat.timestamp;

        let cid = n_chat.id;
        cid.user = encryptContact(n_chat.id.user);
        cid._serialized = encryptContact(n_chat.id._serialized.split("@")[0]) + "@" + n_chat.id._serialized.split("@")[1];

        message_log.chatID = cid;
        // check if message log exists
        const mlog = await message
            .findOne({ chatID: cid, userID: clientId })
            .exec();

        if (mlog) {
            // update message log
            let message_logs = await getJSONLogs(mlog.messages.filename);
            let mergedMessages = await mergeMessages(message_logs, final_messages);
            newMessageCount = mergedMessages.length - message_logs.length;
            const fileData = {
                data: mergedMessages,
                mimetype: "application/json",
                filename: "message_logs.json",
                filesize: mergedMessages.length,
            };
            let filename = "";
            try {
                filename = await storeFileInDB(fileData);
                removeFileFromDB(mlog.messages.filename);
                mlog.messages.filename = filename;
                mlog.messages.length = mergedMessages.length;
                await mlog.updateOne({
                    $set: {
                        messages: mlog.messages,
                        lastUpdated: Date.now(),
                        chatName: n_chat.name,
                        timestamp: n_chat.timestamp
                    },
                });
            } catch (err) {
                console.log("Cannot upload message logs: ", err);
            }
        } else {
            // create new message log
            newMessageCount = final_messages.length;
            const fileData = {
                data: final_messages,
                mimetype: "application/json",
                filename: "message_logs.json",
                filesize: final_messages.length,
            };
            let filename = "";
            try {
                filename = await storeFileInDB(fileData);
                message_log.messages = {
                    filename: filename,
                    length: final_messages.length
                };
                message_log.lastUpdated = Date.now();
                const msg = new message(message_log);
                await msg.save();
            } catch (err) {
                console.log("Cannot upload message logs: ", err);
            }
        }
        await getReactions(clientId, cid);
        if (config.get("messages.status")) {
            await getMessageStatus(clientId, cid);
        }
    } catch (err) {
        console.log("Error while logging msgs: ", err);
    }
    return newMessageCount + await logMessages(consentedChats, idx + 1, clientId, participantId, clientName, date);
};

const getReactions = async (client_id, chat_id) => {
    const messageDocument = await message.findOne({ chatID: chat_id, userID: client_id }).exec();
    let cancelCount = 0; // Cancel getting reactions after 10 timeouts
    if (messageDocument) {
        const messageLogs = await getJSONLogs(messageDocument.messages.filename);
        if (messageLogs && messageLogs.length !== 0) {
            const client = whatsappSessions.get(client_id);
            for (let i = 0; i < messageLogs.length; i++) {
                if (messageLogs[i].hasReaction) {
                    if (cancelCount >= config.get("messages.retries")) {
                        logClientInfo("Too many timeouts while getting reactions, cancelling..", client_id);
                        break;
                    }
                    let id = {
                        _serialized: messageLogs[i]['id'] ? messageLogs[i]['id']['_serialized'] : messageLogs[i]['msg_id']
                    }
                    let msg = new Message(client.getClient(), {
                        id: id,
                        hasReaction: true,
                    });
                    let result = await asyncCallWithTimeout(msg.getReactions(), config.get("timeouts.reactions"));
                    if (result === -1) {
                        logClientInfo("Getting reactions taking too long, skipping..", client_id)
                        cancelCount++;
                        continue;
                    }
                    else {
                        // Anonymize reactions
                        try {
                            result = await anonymizeReactions(result);
                        } catch (err) {
                            logClientInfo("Error in anonymizing reactions", client_id);
                            // console.log("Error in anonymizing reactions: ", err);
                        }
                        messageLogs[i]["reactionData"] = result;
                    }
                }
            }
            const fileData = {
                data: messageLogs,
                mimetype: "application/json",
                filename: "message_logs.json",
                filesize: messageLogs.length,
            };
            let filename = "";
            try {
                filename = await storeFileInDB(fileData);
                await removeFileFromDB(messageDocument.messages.filename);
                messageDocument.messages.filename = filename;
                messageDocument.messages.length = messageLogs.length;
                const mlog = await message.findOne({ chatID: chat_id, userID: client_id }).exec();
                if (mlog) {
                    await mlog.updateOne({ $set: { messages: messageDocument.messages } }).exec();
                }
            } catch (err) {
                console.log("Cannot upload message logs after getting reactions: ", err);
            }
        }
    } else {
        logClientInfo("Missing message document to get reactions", client_id);
    }
}

const getMessageStatus = async (client_id, chat_id) => {
    const messageDocument = await message.findOne({ chatID: chat_id, userID: client_id }).exec();
    let cancelCount = 0; // Cancel getting message info after 10 timeouts
    if (messageDocument) {
        const messageLogs = await getJSONLogs(messageDocument.messages.filename);
        if (messageLogs && messageLogs.length !== 0) {
            const client = whatsappSessions.get(client_id);
            for (let i = 0; i < messageLogs.length; i++) {
                if (cancelCount >= config.get("messages.retries")) {
                    logClientInfo("Too many timeouts while getting message info, cancelling..", client_id);
                    break;
                }
                let id = {
                    _serialized: messageLogs[i]['id'] ? messageLogs[i]['id']['_serialized'] : messageLogs[i]['msg_id']
                }
                let msg = new Message(client.getClient(), {
                    id: id,
                });
                let result = await asyncCallWithTimeout(msg.getInfo(), config.get("timeouts.messageStatus"));
                if (result === -1) {
                    logClientInfo("Getting message info taking too long, skipping..", client_id)
                    cancelCount++;
                    continue;
                }
                else {
                    // Anonymize message status
                    try {
                        result = await anonymizeMessageStatus(result);
                    } catch (err) {
                        logClientInfo("Error in anonymizing message status", client_id);
                        // console.log("Error in anonymizing message status: ", err);
                    }
                    messageLogs[i]["messageStatus"] = result;
                }
            }
            const fileData = {
                data: messageLogs,
                mimetype: "application/json",
                filename: "message_logs.json",
                filesize: messageLogs.length,
            };
            let filename = "";
            try {
                filename = await storeFileInDB(fileData);
                await removeFileFromDB(messageDocument.messages.filename);
                messageDocument.messages.filename = filename;
                messageDocument.messages.length = messageLogs.length;
                const mlog = await message.findOne({ chatID: chat_id, userID: client_id }).exec();
                if (mlog) {
                    await mlog.updateOne({ $set: { messages: messageDocument.messages } }).exec();
                }
            } catch (err) {
                console.log("Cannot upload message logs after getting message info: ", err);
            }
        }
    } else {
        logClientInfo("Missing message document to get message info", client_id);
    }
}

async function downloadMedia(clientId) {
    const client = whatsappSessions.get(clientId);
    // extract all messages from database
    let messages = await message.find({ userID: clientId }).exec();
    let downloadCount = 0;
    for (let i = 0; i < messages.length; i++) {
        let message_logs = await getJSONLogs(messages[i].messages.filename);
        if (message_logs.length === 0)
            continue;
        for (let j = 0; j < message_logs.length; j++) {
            // if (message_logs[j].isAnonymized) {
            //     continue;
            // }
            let mediaDownloaded = message_logs[j]['mediaDownloaded']
                ? message_logs[j]['mediaDownloaded']
                : false;
            let downloadRetries = message_logs[j]['downloadRetries']
                ? message_logs[j]['downloadRetries']
                : 0;
            if (message_logs[j]['hasMedia'] && !mediaDownloaded) {
                if (downloadRetries >= 2) {
                    continue;
                }

                // Validate media download
                if (!validateMedia(message_logs[j])) {
                    message_logs[j]["mediaDownloaded"] = false;
                    continue;
                }
                // console.log("downloading media for ", msg);
                let msg = new Message(client.getClient(), {
                    id: message_logs[j]['id'],
                    clientUrl: true,
                });
                msg.hasMedia = true;
                msg.mediaKey = message_logs[j].mediaKey;
                try {
                    let media;
                    let result = await asyncCallWithTimeout(msg.downloadMedia(), config.get("timeouts.media"));
                    if (result === -1) {
                        logClientInfo("Download taking too long, skipping..", clientId)
                        console.log("Error in download media");
                        message_logs[j]["mediaDownloaded"] = false;
                        if ("downloadRetries" in message_logs[j])
                        {
                            message_logs[j]["downloadRetries"]++;
                            message_logs[j]["lastRetry"] = new Date();
                        }
                        else
                        {
                            message_logs[j]["downloadRetries"] = 0;
                            message_logs[j]["lastRetry"] = new Date();
                        }
                        continue;
                    }
                    else {
                        media = result;
                    }

                    if (media) {
                        let filename = 'not_stored';
                        await logClientInfo("Storing and anonymizing media", clientId);
                        const response = await storeFileInDB(media);
                        filename = response.filename;
                        let blurringCategory = response.blurringCategory;
                        let errorResponse = response.error;
                        const mediaData = {
                            filename: filename,
                            mimetype: media.mimetype,
                            filesize: media.filesize,
                            blurringCategory: blurringCategory,
                            error: errorResponse
                        };
                        message_logs[j]["mediaData"] = mediaData;
                        if (errorResponse.code >= 2) {
                            message_logs[j]["mediaDownloaded"] = false;
                        }
                        else {
                            message_logs[j]["mediaDownloaded"] = true;
                            downloadCount++;
                        }
                    }
                    // console.log(message_logs[j]);
                } catch (err) {
                    console.log("Error in downloading media:  ", err);
                    message_logs[j]["mediaDownloaded"] = false;
                }
            }
        }
        const fileData = {
            data: message_logs,
            mimetype: "application/json",
            filename: "message_logs.json",
            filesize: message_logs.length,
        };
        let filename = "";
        try {
            filename = await storeFileInDB(fileData);
            await removeFileFromDB(messages[i].messages.filename);
            messages[i].messages.filename = filename;
            messages[i].messages.length = message_logs.length;

            const mlog = await message.findOne({ _id: messages[i]._id }).exec();
            if (mlog) {
                await mlog.updateOne({ $set: { messages: messages[i].messages } }).exec();
            }
        } catch (err) {
            console.log("Cannot upload message logs: ", err);
        }
    }

    return downloadCount;
}

async function anonymizeData(clientId) {
    // extract all messages from database
    let messages = await message.find({ "userID": clientId }).exec();

    for (let i = 0; i < messages.length; i++) {
        // if (messages[i].isAnonymized) {
        //   continue;
        // }
        let message_logs = await getJSONLogs(messages[i].messages.filename);
        for (let j = 0; j < message_logs.length; j++) {
            if ("_data" in message_logs[j]) {
                delete message_logs[j]["_data"];
            }
            if (message_logs[j]['isAnonymized']) {
                continue;
            }
            let mediaDownloaded = message_logs[j]['mediaDownloaded']
                ? message_logs[j]['mediaDownloaded']
                : false;
            if (!message_logs[j]['hasMedia'] || mediaDownloaded) {
                if ("id" in message_logs[j]) {
                    const msg_id = message_logs[j]["id"]["_serialized"];
                    message_logs[j]["msg_id"] = msg_id;
                    delete message_logs[j]["id"];
                }
            }
            // from
            let from = message_logs[j]['from'];
            if (from) {
                from = from.split("@")[0];
                let anon_id = encryptContact(from);
                message_logs[j]['from'] =
                    anon_id + "@" + message_logs[j]['from'].split("@")[1];
            }

            // to
            let to = message_logs[j]['to'];
            if (to) {
                to = to.split("@")[0];
                let anon_id = encryptContact(to);
                message_logs[j]['to'] =
                    anon_id + "@" + message_logs[j]['to'].split("@")[1];
            }

            // author
            let author = message_logs[j]['author'];
            if (author) {
                author = author.split("@")[0];
                let anon_id = encryptContact(author);
                message_logs[j]['author'] =
                    anon_id + "@" + message_logs[j]['author'].split("@")[1];
            }

            let chatName = message_logs[j]['chatName'];
            if (chatName) {
                let anon_id = encryptContact(chatName);
                message_logs[j]['chatName'] = anon_id;
            }

            message_logs[j]["isAnonymized"] = true;
        }
        const fileData = {
            data: message_logs,
            mimetype: "application/json",
            filename: "message_logs.json",
            filesize: message_logs.length,
        };
        let filename = "";
        try {
            filename = await storeFileInDB(fileData);
            removeFileFromDB(messages[i].messages.filename);
            messages[i].messages.filename = filename;
            messages[i].messages.length = message_logs.length;
            const mlog = await message.findOne({ _id: messages[i]._id }).exec();
            if (mlog) {
                await mlog.updateOne({ $set: { messages: messages[i].messages, chatID: messages[i].chatID } }).exec();
            }
        } catch (err) {
            console.log("Cannot upload message logs: ", err);
        }
    }

    // get all contacts from database
    // let contact_logs = await contacts.find({ "userID": clientId }).exec();

    // for (let i = 0; i < contact_logs.length; i++) {
    //     // if (contact_logs[i].isAnonymized) {
    //     //   continue;
    //     // }
    //     let contact_info = await getJSONLogs(contact_logs[i].contacts.filename);
    //     for (let j = 0; j < contact_info.length; j++) {

    //         if ("businessProfile" in contact_info[j]) {
    //             delete contact_info[j]["businessProfile"]
    //         }

    //         let numberField = contact_info[j]['number'];
    //         if (numberField) {
    //             let anon_id = encryptContact(numberField);
    //             contact_info[j]['number'] = anon_id;
    //         }

    //         let nameFields = ['name', 'pushname', 'verifiedName', 'shortName'];
    //         for (let k = 0; k < nameFields.length; k++) {
    //             let nameField = nameFields[k];
    //             if (nameField in contact_info[j] && contact_info[j][nameField]) {
    //                 let anon_id = encryptContact(contact_info[j][nameField]);
    //                 contact_info[j][nameField] = anon_id;
    //             }
    //         }

    //         if (contact_info[j]['isAnonymized']) {
    //             continue;
    //         }
    //         let contact_user = contact_info[j]['id']['user'];
    //         if (contact_user) {
    //             let anon_id = encryptContact(contact_user);
    //             contact_info[j]['id']['user'] = anon_id;
    //         }

    //         let contact_serialized =
    //             contact_info[j]['id']['_serialized'].split("@")[0];
    //         if (contact_serialized) {
    //             let anon_id = encryptContact(contact_serialized);
    //             contact_info[j]['id']['_serialized'] =
    //                 anon_id +
    //                 "@" +
    //                 contact_info[j]['id']['_serialized'].split("@")[1];
    //         }
    //         contact_info[j]["isAnonymized"] = true;
    //     }

    //     const fileData = {
    //         data: contact_info,
    //         mimetype: "application/json",
    //         filename: "contact_logs.json",
    //         filesize: contact_info.length,
    //     };
    //     let filename = "";
    //     try {
    //         filename = await storeFileInDB(fileData);
    //         removeFileFromDB(contact_logs[i].contacts.filename);
    //         contact_logs[i].contacts.filename = filename;
    //         contact_logs[i].contacts.length = contact_info.length;

    //         const clog = await contacts.findOne({ _id: contact_logs[i]._id }).exec();
    //         if (clog) {
    //             await clog.updateOne({ $set: { contacts: contact_logs[i].contacts } }).exec();
    //         }
    //     } catch (err) {
    //         console.log("Cannot upload contact logs: ", err);
    //     }
    // }
}

async function logData(clientId) {
    let msgresult = 0;
    let mediaresult = 0;
    const participant = await participants.findOne({ clientId: clientId }).exec();
    if (participant) {
        // check if client is logging
        if (participant.isLogging) {
            await logClientInfo("Participant is already logging", clientId);
            // } else if (participant.daysLeft === 0) {
            //   console.log(`Participant ${clientId} has completed 14 days of logging`);
            //   logStream.write(`${clientId} has completed 14 days of logging`);
        } else {
            // log all data
            const client = whatsappSessions.get(clientId);
            participant.clientInfo = await client.getInfo();
            participant.isLogging = true;
            participant.clientStatus = "AUTOLOGGING";
            await participant.save();

            // get all chats
            await logClientInfo("Now logging all Chat Users", clientId);
            await logAllChatNames(clientId, participant._id, participant.name);

            // get all contacts
            await logClientInfo("Now logging all Contacts", clientId);
            await logAllContacts(clientId, participant._id, participant.name);

            // get all messages
            await logClientInfo("Now logging all Messages", clientId);

            // get consentedChatUsers from participant
            let consentedChats = participant.consentedChatUsers;

            const minDate = new Date();
            minDate.setDate(minDate.getDate() - config.get('messages.daysOld'));
            minDate.setHours(0, 0, 0, 0);

            if (consentedChats.length > 0) {
                msgresult = await logMessages(consentedChats, 0, clientId, participant._id, participant.name, minDate);

                // get all media
                await logClientInfo("Now downloading all media", clientId);
                mediaresult = await downloadMedia(clientId);
            }
            else {
                await logClientInfo("User has no consented chats", clientId);
            }

            // Anonymizing data
            await logClientInfo("Anonymizing data", clientId);
            await anonymizeData(clientId);

            participant.isLogging = false;
            participant.clientStatus = "DISCONNECTED";
            participant.daysLeft -= 1;
            await participant.save();

            await logClientInfo("Finished autologging", clientId);
        }
    } else {
        // participant not found
        await logClientInfo("Participant not found", clientId);
        // remove client from whatsappSessions
        whatsappSessions.remove(clientId);
    }
    return [msgresult, mediaresult];
}

module.exports = {
    logAllChatNames,
    logAllContacts,
    logMessages,
    logData,
    getReactions,
    anonymizeData,
    downloadMedia,
}