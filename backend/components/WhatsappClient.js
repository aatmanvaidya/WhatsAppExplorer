const { EventEmitter } = require("node-cron/src/scheduled-task");
const { Client, LocalAuth } = require("whatsapp-web.js");
const participants = require("../models/participants");
const connections = require("../models/connections");
const { logClientInfo } = require("./utils/Logger");
const { asyncCallWithTimeout, anonymizeClientInfo } = require("./utils/Utils");
const config = require('config');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

class ClientSessions {
    constructor() {
        this.sessionMap = new Map();
        // clear connections collection
        connections.deleteMany({}, (err) => {
            if (err) {
                console.log("Error while clearing connections collection", err);
            }
        });
    }

    remove(clientId) {
        this.sessionMap.delete(clientId);
        connections.deleteOne({ clientId: clientId }, (err) => {
            if (err) {
                logClientInfo("Error while deleting client connection from db", clientId);
            }
        });
    }

    put(clientId, clientConnection) {
        this.sessionMap.set(clientId, clientConnection);
        connections.create({ clientId: clientId }, (err) => {
            if (err) {
                logClientInfo("Error while saving client connection to db", clientId);
            }
        });
    }

    get(clientId) {
        return this.sessionMap.get(clientId);
    }

    has(clientId) {
        return this.sessionMap.has(clientId);
    }
}

class ClientConnection extends EventEmitter {
    constructor(clientId, autoForward = false, expiry = false) {
        super();
        this.clientId = clientId;
        this.whatsappClient = null;
        this.autoForward = autoForward;
        this.expiry = expiry;
        this.initializeTime = new Date();
        this.qrGeneratedTime = -1;
        this.connectedTime = -1;
        this.expiryTimer = null;
    }

    establishConnection() {
        this.whatsappClient = new Client({
            authStrategy: new LocalAuth({
                clientId: this.clientId,
            }),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process', // <- this one doesn't works in Windows
                    '--disable-gpu'
                ]
            },
            authTimeoutMs: config.get("timeouts.connection"),
            webVersion: '2.2408.1',
            webVersionCache: { type: "local" },
            // webVersion: '2.3000.1012750699',
            // webVersionCache: {
            //     type: 'remote',
            //     remotePath:
            //         'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1012750699-alpha.html',
            // },
        });
    }

    // logAllEmittedEvents() {
    //     const pathToEmitterLogs = path.join(__dirname, "..", "emitterLogs", `${this.clientId}.txt`);
    //     const emitterLogs = fs.createWriteStream(pathToEmitterLogs, { flags: 'a' });
    //     const originalEmit = this.whatsappClient.emit;
    //     this.whatsappClient.emit = function () {
    //         let numArgs = arguments.length;
    //         let args = [];
    //         for (let i = 0; i < numArgs; i++) {
    //             args.push(arguments[i]);
    //         }
    //         let currentTime = new Date().toISOString();
    //         emitterLogs.write(`${currentTime} : ${args.join(" ")}\n`);
    //         originalEmit.apply(this, arguments);
    //     };
    // }

    addConnectedEventListener() {
        this.whatsappClient.once("ready", async () => {
            await logClientInfo("Client authenticated", this.clientId);
            // fetch current state every 5 seconds and see if it becomes CONNECTED
            const interval = setInterval(async () => {
                let currentState = await this.whatsappClient.getState();
                if (currentState === "CONNECTED") {
                    let curTime = new Date();
                    this.connectedTime = (curTime - this.initializeTime) / 1000;
                    this.emit('connected');
                    clearInterval(interval);
                }
            }, 5000);
        });
    }

    addQrGeneratedEventListener() {
        this.whatsappClient.once("qr", async (qr) => {
            let curTime = new Date();
            this.qrGeneratedTime = (curTime - this.initializeTime) / 1000;
            this.emit('qr', qr);
        });
    }

    addAutoForwardEvent() {
        this.whatsappClient.on("message", async (msg) => {
            // get participant info from database
            const participant = await participants.findOne({ clientId: this.clientId });
            if (participant) {
                if (participant.autoforward) {
                    const sender_chat_id = participant.autoforward_sender;
                    const receiver_chat_id = participant.autoforward_receiver;
                    if (msg.from === sender_chat_id) {
                        // console.log("message received");
                        msg.forward(receiver_chat_id);
                    }
                    // update last active time
                    participant.lastActive = Date.now();
                    await participant.save();
                } else {
                    // remove listener
                    this.whatsappClient.removeAllListeners("message");
                }
            }
        });
    }

    addSessionInactivityTimeoutEvent() {
        // remove client after 1 hour of inactivity
        const inactivityTime = config.get("timeouts.inactivity");
        const client = this;
        this.expiryTimer = setTimeout(async function inactiveSession() {
            // get participant info from database
            logClientInfo("Checking if session is inactive", client.clientId);
            const participant = await participants.findOne({ clientId: client.clientId });
            if (participant && participant.autoforward === false && whatsappSessions.has(client.clientId)) {
                if (participant.isLogging === false) {
                    await logClientInfo(
                        "Removed from whatsappSessions as it was inactive for 1 hour",
                        client.clientId
                    );
                    await client.clear();
                    whatsappSessions.remove(client.clientId);
                    // Updfate participant status to disconnected
                    participant.clientStatus = "DISCONNECTED";
                    await participant.save();
                } else {
                    this.expiryTimer = setTimeout(inactiveSession, inactivityTime);
                }
            }
            else if (!participant) {
                logClientInfo("Client was never connected, removed after 1 hour", client.clientId);
                await client.clearRevoked();
                whatsappSessions.remove(client.clientId);
            }
        }, inactivityTime);
    }

    async clear() {
        try {
            if (this.expiryTimer) {
                clearTimeout(this.expiryTimer);
                this.expiryTimer = null;
            }
            await this.whatsappClient.destroy();
            this.whatsappClient.removeAllListeners();
            this.removeAllListeners();
        } catch (err) {
            console.log("Error while clearing client", err);
        }
    }

    async clearRevoked() {
        try {
            if (this.expiryTimer) {
                clearTimeout(this.expiryTimer);
                this.expiryTimer = null;
            }
            this.removeAllListeners();
            await this.whatsappClient.destroy();
            this.whatsappClient.removeAllListeners();
        } catch (err) {
            console.log("Error while clearing revoked client", err);
        }
    }

    getClient() {
        return this.whatsappClient;
    }

    getTimeStats() {
        return {
            qrGeneratedTime: this.qrGeneratedTime,
            connectedTime: this.connectedTime
        }
    }

    async getChats() {
        let result = await asyncCallWithTimeout(this.whatsappClient.getChats(), config.get("timeouts.chat"));
        if (result === -1) {
            logClientInfo("Logging chat names taking too long, skipping..", this.clientId)
            return [];
        }
        return result;
    }

    async getChatById(chatId) {
        let result = await asyncCallWithTimeout(this.whatsappClient.getChatById(chatId), config.get("timeouts.chat"));
        if (result === -1) {
            logClientInfo("Getting chat name by ID taking too long, skipping..", this.clientId)
            return null;
        }
        return result;
    }

    async getContacts() {
        let result = await asyncCallWithTimeout(this.whatsappClient.getContacts(), config.get("timeouts.contact"));
        if (result === -1) {
            logClientInfo("Logging contacts taking too long, skipping..", this.clientId)
            return [];
        }
        return result;
    }

    async getMessages(chatId) {
        let chat = await this.whatsappClient.getChatById(chatId);
        const params = { limit: config.get("messages.limit") === "Infinity" ? Number.MAX_VALUE : config.get("messages.limit") };
        let result = await asyncCallWithTimeout(chat.fetchMessages(params), config.get("timeouts.message"));
        let status = [];
        if (result === -1) {
            logClientInfo("Logging messages taking too long, skipping..", this.clientId)
        } else {
            status = result;
        }
        return {
            messages: status,
            chat: chat
        }
    }

    async getState() {
        return await this.whatsappClient.getState();
    }

    async downloadProfilePic(contactID) {
        const profilePicFolder = "/mnt/storage-2tb/kg766/WhatsappMonitorData/profile-pics";
        const profilePicData = {
            'url': '',
            'path': '',
            'downloaded': false,
        }
        try {
            let imageUrl = await this.whatsappClient.getProfilePicUrl(contactID);
            let imagePath = path.join(profilePicFolder, `${this.clientId}.jpeg`);
            await axios({
                url: imageUrl,
                responseType: 'stream',
            })
                .then(response => {
                    // Pipe the response data (image) to a file stream
                    response.data.pipe(fs.createWriteStream(imagePath));

                    // Optional: Handle success
                    response.data.on('end', () => {
                        logClientInfo("Profile picture downloaded successfully", this.clientId);
                    });
                })
                .catch(error => {
                    // Handle error
                    logClientInfo("Error while downloading profile picture", this.clientId);
                });
            profilePicData['url'] = imageUrl;
            profilePicData['path'] = imagePath;
            profilePicData['downloaded'] = true;
        } catch (err) {
            console.log("Error while downloading profile picture", err);
        }
        return profilePicData;
    }

    async getInfo() {
        let clientInfo = this.whatsappClient.info;
        try {
            let contactID = clientInfo.wid._serialized;
            const profilePicture = await this.downloadProfilePic(contactID);
            clientInfo['profilePicture'] = profilePicture;
            clientInfo = await anonymizeClientInfo(clientInfo);
        } catch (err) {
            console.log("Error while anonymizing client info", err);
        }
        return clientInfo;
    }

    connect() {
        this.establishConnection();
        this.addConnectedEventListener();
        this.addQrGeneratedEventListener();
        if (this.autoForward) {
            this.addAutoForwardEvent();
        }
        if (this.expiry) {
            this.addSessionInactivityTimeoutEvent();
        }
        this.whatsappClient.on('authenticated', () => {
            console.log('AUTHENTICATED');
        });
        
        this.whatsappClient.on('auth_failure', msg => {
            // Fired if session restore was unsuccessful
            console.error('AUTHENTICATION FAILURE', msg);
        });
        
        this.whatsappClient.on('ready', () => {
            console.log('READY');
        });

        this.whatsappClient.on('loading_screen', (percent, message) => {
            console.log('LOADING SCREEN', percent, message);
        });
        

        this.whatsappClient.initialize((ex) => { }).then(
            async () => {
                let wwwversion = await this.whatsappClient.getWWebVersion();
                await logClientInfo(`Client initialized with version ${wwwversion}`, this.clientId);
            }
        ).catch(async (err) => {
            await logClientInfo('Connection failed', this.clientId);
            this.emit('auth_failure');
            console.log(err);
        })
    }
}

module.exports = {
    ClientConnection,
    ClientSessions
}
