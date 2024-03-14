const { MongoClient, GridFSBucket } = require("mongodb");
const crypto = require("crypto-js"),
    password = "12345wxhbwjhbx";
const {DeidentifyMessage} = require("./identification.js");
const mongoUrl = "mongodb://127.0.0.1:27017/whatsappLogs";
let bucket;

const client = new MongoClient(mongoUrl, {
    useNewUrlParser: true,
});

function checkIfEncrypted(text) {
    if (text === "Y1Xgzw8tHWPlTi6ruewXRw==") {
        return true;
    }
    try {
        let decrypted = decryptContact(text);
        if (decrypted === undefined || decrypted === null || decrypted === "") {
            return false;
        }
        return true;
    } catch {
        return false;
    }
}

function decryptContact(text) {
    const hash = crypto.SHA256(password);
    const result = crypto.AES.decrypt(text, hash, { mode: crypto.mode.ECB });
    const str = result.toString(crypto.enc.Utf8);
    try {
        return JSON.parse(str).text;
    } catch (e) {
        return str;
    }
}

async function iterateSearchHash(str, offset) {
    for(let windowSize = str.length; windowSize > 0; windowSize--) {
        for(let i = 0; i <= str.length - windowSize; i++) {
            const substring = str.substring(i, i + windowSize);
            if(checkIfEncrypted(substring)) {
                return {
                    encrypted: substring,
                    decrypted: decryptContact(substring),
                    start: i + offset,
                    end: i + offset + windowSize,
                }
            }
        }
    }
    return null;
}

async function detectHash(str) {
    const regex = /([a-zA-Z0-9+\/=]{20,})/g;
    const matches = str.match(regex);
    if (matches === null) {
        return str;
    }
    const result = [];
    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        if(match.length > 2000)
            continue;
        const res = await iterateSearchHash(match, str.indexOf(match));
        if (res !== null) {
            result.push(res);
        }
    }
    // sort by start index
    result.sort((a, b) => {
        return a.start - b.start;
    });

    let finalStr = "";
    let curIdx = 0;
    for (let i = 0; i < result.length; i++) {
        const { start, end, decrypted } = result[i];
        finalStr += str.substring(curIdx, start) + decrypted;
        curIdx = end;
    }
    finalStr += str.substring(curIdx, str.length);

    return finalStr;
}

async function fixHash(messages) {
    for (const message of messages) {
        message[0] = await detectHash(message[0]);
        if (message[1] !== "EMPTYWMDASHREPLY") {
            message[1] = await detectHash(message[1]);
        }
    }
    // return messages;
    const anonimizer = new DeidentifyMessage();
    anonimizer.addField("message_body");
    anonimizer.addField("message_reply");
    for (const message of messages) {
        anonimizer.addRow([message[0], message[1]]);
    }
    await anonimizer.inspect();

    let result = [];
    const deidentified_messages = anonimizer.data["message_body"];
    const deidentified_replies = anonimizer.data["message_reply"];
    for (let i = 0; i < deidentified_messages.length; i++) {
        result.push([deidentified_messages[i], deidentified_replies[i]]);
    }
    return result;
}

async function storeFileInDB(filename, media) {
    let data = media.data;

    const uploadStream = bucket.openUploadStream(filename, {
        chunkSizeBytes: 1048576,
        metadata: {
            contentType: media.mimetype,
            originalfilename: media.filename,
            filesize: media.filesize,
        },
    });
    const promise = new Promise((resolve, reject) => {
        uploadStream.once("finish", () => {
            resolve(filename);
        });

        uploadStream.once("error", (err) => {
            reject(err);
        });
    });
    uploadStream.end(JSON.stringify(data), "utf8");
    // console.log("File uploading to database");
    return promise;
}

async function getJSONLogs(filename) {

    const fileinfo = await bucket.find({ filename: filename }).toArray();
    if (fileinfo.length === 0) {
        console.log("File not found", filename);
        return [];
    }
    try {
        const data = await extractFileFromDB(filename);
        const json = JSON.parse(data.toString());
        return json;
    } catch (err) {
        console.log("Error while loading json logs: ", err);
        return [];
    }
}

function extractFileFromDB(filename) {
    const downloadStream = bucket.openDownloadStreamByName(filename);

    // extract the file from the database along with its metadata
    const promise = new Promise((resolve, reject) => {
        const chunks = [];
        downloadStream.on("data", (chunk) => {
            chunks.push(chunk);
        });

        downloadStream.on("error", (err) => {
            reject(err);
        });

        downloadStream.on("end", () => {
            const file = Buffer.concat(chunks);
            resolve(file);
        });
    });
    return promise;
}

async function removeFileFromDB(filename) {
    const fileinfo = await bucket.find({ filename: filename }).toArray();
    try {
        const id = fileinfo[0]._id;
        await bucket.delete(id);
    }
    catch {
        console.log("Error removing file");
    }
}



async function main(filename) {
    await client.connect();
    bucket = new GridFSBucket(client.db(), { bucketName: "largeFiles" });

    let message_data = await getJSONLogs(filename);
    let data = [];
    for (const message of message_data) {
        if (message.hasQuotedMsg && '_data' in message) {
            data.push([message.body, message._data.quotedMsg.body]);
        } else {
            data.push([message.body, "EMPTYWMDASHREPLY"]);
        }
    }
    const fixed_data = await fixHash(data);
    for (let i = 0; i < message_data.length; i++) {
        message_data[i].body = fixed_data[i][0];
        if (message_data[i].hasQuotedMsg && '_data' in message_data[i]) {
            message_data[i]['messageReplyTo'] = fixed_data[i][1];
        }
    }
    await removeFileFromDB(filename);
    let status = await storeFileInDB(filename, { data: message_data, mimetype: "application/json", filename: filename, filesize: message_data.length });
    console.log(status);
    await client.close();
}

main("eeee1329-5a6e-4bff-9613-dd9f7bad93b5")

// fixHash([[`Y1Xgzw8tHWPlTi6ruewXRw==`, `Abra ka dabra`]])
//     .then(console.log)
//     .catch(console.error)