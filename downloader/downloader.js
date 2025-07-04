const config = require('config');
const { MongoClient, GridFSBucket } = require("mongodb");
const mongoose = require("mongoose");
const fs = require("fs");
const pathLib = require("path");
const mime = require("mime-types");
const mongoUrl = config.get('services.mongodb.uri');
const storagePath = config.get('data.path');
const shell = require("shelljs");
const { getDownloaderInfo } = require("./trackServer.js");
const { sendMail } = require("./sendMail.js");

const getPath = () => {
  const date = new Date();
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0"); //January is 0
  const yyyy = String(date.getFullYear());
  const foldername = `${dd}${mm}${yyyy}`;
  const path = `${__dirname}/download-logs/${foldername}`;

  // check if logs directory exists
  if (!fs.existsSync(`${__dirname}/download-logs`)) {
    fs.mkdirSync(`${__dirname}/download-logs`);
  }

  return path;
}

const getLogStream = (path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
  const filename = fs.readdirSync(path).length + 1;
  const logStream = fs.createWriteStream(`${path}/${filename}.log`, { flags: "w" });
  return logStream;
};

const getUserLogs = (path) => {
  if (fs.existsSync(`${path}/stats.json`)) {
    return require(`${path}/stats.json`);
  }
  return {};
};

const formatLog = (log) => {
  const date = new Date();
  const time = date.toLocaleTimeString();
  return `[${time}]\t${log}`;
};

const path = getPath();
const logStream = getLogStream(path);
const userLogs = getUserLogs(path);
for (const user in userLogs) {
  userLogs[user]["err_downloaded"] = 0;
  userLogs[user]["already_downloaded"] = 0;
}

const writeLog = async (log) => {
  logStream.write(formatLog(log) + "\n");
};

const addUserStats = (username, stats) => {
  if (!userLogs[username]) {
    userLogs[username] = stats;
    return;
  }
  userLogs[username] = {
    new_downloaded: userLogs[username].new_downloaded + stats.new_downloaded,
    err_downloaded: userLogs[username].err_downloaded + stats.err_downloaded,
    already_downloaded:
      userLogs[username].already_downloaded + stats.already_downloaded,
  };
};

async function main() {
  const commands = [
    "mongoexport --collection=admins --db=whatsappLogs --out=admins.json",
    "mongoexport --collection=participants --db=whatsappLogs --out=participants.json",
    "mongoexport --collection=surveyors --db=whatsappLogs --out=surveyors.json",
  ];

  // make a directory to store the files ddmmyy
  const date = new Date();
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0"); //January is 0!
  const yy =
    date.getFullYear().toString()[2] + date.getFullYear().toString()[3];
  const dir = `${storagePath}/data/${dd}${mm}${yy}/`;

  // n days old dir to be deleted
  const old_date = new Date();
  old_date.setDate(old_date.getDate() - config.get('backup.duration'));
  const old_dd = String(old_date.getDate()).padStart(2, "0");
  const old_mm = String(old_date.getMonth() + 1).padStart(2, "0"); //January is 0!
  const old_yy =
    old_date.getFullYear().toString()[2] + old_date.getFullYear().toString()[3];
  const old_dir = `${storagePath}/data/${old_dd}${old_mm}${old_yy}/`;


  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // export the data from the database
  writeLog("Exporting mongodb documents from the database");
  for (let command of commands) {
    const process = shell.exec(command, { silent: true, cwd: dir });
    logStream.write(formatLog(process.stderr));
  }
  writeLog("Exporting complete");

  const client = new MongoClient(mongoUrl, {
    useNewUrlParser: true,
  });

  try {
    await client.connect();
    const bucket = new GridFSBucket(client.db(), { bucketName: "largeFiles" });

    const contacts = await client
      .db()
      .collection("contacts")
      .find({})
      .toArray();
    for (const contact of contacts) {
      contact.contacts = await getJSONLog(bucket, contact.contacts.filename);
    }
    exportData(contacts, dir, "contacts.json");
    writeLog("Exported contact logs from database");

    const chatusers = await client
      .db()
      .collection("chatusers")
      .find({})
      .toArray();
    for (const chatuser of chatusers) {
      chatuser.chats = await getJSONLog(bucket, chatuser.chats.filename);
    }
    exportData(chatusers, dir, "chatusers.json");
    writeLog("Exported chatuser logs from database");
    // await listDatabases(client);
    // get all messages from the database
    const messages = await client
      .db()
      .collection("messages")
      .find({})
      .toArray();
    for (const message of messages) {
      let username = message.userName;
      // if (username !== "shreyashIndividual")
      //   continue;
      writeLog(
        `Downloading files for ${username} for chat ${message.chatName}`
      );
      let new_downloaded = 0;
      let err_downloaded = 0;
      let already_downloaded = 0;
      // replace all the special characters with an underscore
      username = username.replace(/[^a-zA-Z0-9]/g, "_");
      const path = `${storagePath}/downloaded-media/${username}-${message._id}/`;
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
      }
      const fn = message.messages.filename;
      message.messages = await getJSONLog(bucket, message.messages.filename);
      const mlength = message.messages.length;
      if (mlength === 0) {
        continue;
      }
      // export messages
      const filesDir = pathLib.resolve(dir, './messageFiles');
      if (!fs.existsSync(filesDir)) {
        fs.mkdirSync(filesDir, { recursive: true });
      }
      await exportFileFromDB(fn, bucket, filesDir);
      for (const msg of message.messages) {
        if (msg.hasMedia && msg.mediaData) {
          const fname = msg.mediaData.filename;
          const caption = msg.body;
          const msgData = msg;
          if (fname === "not_stored")
            continue;
          const res = await downloadFile(fname, path, bucket, caption, msgData);
          if (res == 0) {
            already_downloaded++;
          } else if (res == 1) {
            new_downloaded++;
          } else if (res == -1) {
            err_downloaded++;
          }
        }
      }
      message.messages = {
        filename: fn,
        length: mlength,
      };
      writeLog(
        `Downloaded ${new_downloaded} new files, ${already_downloaded} already downloaded files, ${err_downloaded} errors encountered while downloading files`
      );
      addUserStats(username, {
        new_downloaded,
        err_downloaded,
        already_downloaded,
      });
    }
    exportData(messages, dir, "messages.json");
    writeLog("Exported message logs from database");
    fs.writeFileSync(`${path}/stats.json`, JSON.stringify(userLogs));
    // console.log("Connected correctly to server");
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
    try {
      const html = await getDownloaderInfo(userLogs);
      if (config.get('website.enabled'))
        writeLog("Updated website");
      if (config.get('mailer.enabled')) {
        try {
          await sendMail(html);
          writeLog("Mail sent successfully");
        } catch (err) {
          writeLog("Error sending mail");
        }
      }
      if (fs.existsSync(old_dir) && old_date.getDay() != 1) {
        fs.rmdirSync(old_dir, { recursive: true });
      }
      console.log("Success!");
    } catch (err) {
      writeLog("Error updating website");
      writeLog(err);
    }

  }
}

main();

function extractFileFromDB(filename, bucket) {
  const downloadStream = bucket.openDownloadStreamByName(filename);

  // extract the file from the database along with its metadata
  const promise = new Promise((resolve, reject) => {
    const chunks = [];
    downloadStream.on("data", (chunk) => {
      chunks.push(chunk);
      // console.log("Downloading file...");
    });

    downloadStream.on("error", () => {
      reject(Error("Failed to extract the file"));
    });

    downloadStream.on("end", () => {
      const file = Buffer.concat(chunks);
      resolve(file);
    });
  });
  return promise;
}

async function downloadFile(name, path, bucket, caption, msgData) {
  try {
    const fileinfo = await bucket.find({ filename: name }).toArray();
    if (fileinfo.length === 0) {
      writeLog(`File ${name} not found in the database`);
      return 0;
    }
    const metadata = fileinfo[0].metadata;
    const fileID = fileinfo[0]._id;
    metadata['caption'] = caption;
    metadata['message'] = msgData;

    // Get the file extension by mime-type
    let extension = mime.extension(metadata.contentType);

    // Filename: change as you want!
    // I will use the time for this example
    // Why not use media.filename? Because the value is not certain exists
    let fname = "";
    if (metadata.originalfilename) {
      fname = metadata.originalfilename.split(".")[0];
      // Make sure fname does not exceed 80 characters
      if (fname.length > 80) {
        fname = fname.substring(0, 80);
      }
      // replace all the special characters with an underscore
      fname = fname.replace(/[^a-zA-Z0-9]/g, "_");
      extension =
        metadata.originalfilename.split(".")[
        metadata.originalfilename.split(".").length - 1
        ];
    } else {
      fname = name;
    }

    const metadataFilename = path + fname + ".json";
    // if (!fs.existsSync(metadataFilename)) {
    fs.writeFileSync(metadataFilename, JSON.stringify(metadata, null, 2));
    // }

    const fullFilename = path + fname + "." + extension;
    // check if the file is already downloaded
    if (fs.existsSync(fullFilename)) {
      await bucket.delete(fileID);
      return 0;
    }

    const media = await extractFileFromDB(name, bucket);
    
    // Save to file
    try {
      // convert the file to base64
      const base64 = media.toString("base64");
      fs.writeFileSync(fullFilename, media, {
        encoding: "base64",
      });
      await bucket.delete(fileID);
      return 1;
      // console.log("File downloaded successfully!", fullFilename);
    } catch (err) {
      // console.log("Failed to save the file:", err);
      writeLog(`Failed to save the file: ${err}`);
      return -1;
    }
  } catch (err) {
    // console.log("Failed to download the file:", err);
    writeLog(`Failed to download the file: ${err}`);
    return -1;
  }
}

async function getJSONLog(bucket, filename) {
  try {
    const data = await extractFileFromDB(filename, bucket);
    const json = JSON.parse(data.toString());
    return json;
  }
  catch (err) {
    console.log("Failed to get the JSON log:", filename);
    return [];
  }
}

const exportData = async (dataArray, dir, fileName) => {
  const filePath = pathLib.resolve(dir, fileName);
  // Clear the file
  fs.writeFileSync(filePath, '', 'utf8');
  for (const obj of dataArray) {
    const jsonStr = JSON.stringify(obj) + '\n';
    fs.appendFileSync(filePath, jsonStr, 'utf8');
  }
};


async function exportFileFromDB(filename, bucket, dir) {
  const downloadStream = bucket.openDownloadStreamByName(filename);
  const folderPath = pathLib.resolve(dir, filename);
  const outputStream = fs.createWriteStream(folderPath);
  // extract the file from the database along with its metadata
  const promise = new Promise((resolve, reject) => {
    downloadStream.pipe(outputStream);
    downloadStream.on("error", (err) => {
      console.log("Error exporting file:", err);
      reject(Error("Failed to export the file"));
    });

    downloadStream.on("end", () => {
      resolve("Done");
    });
  });
  return promise;
}