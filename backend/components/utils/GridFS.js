const { v4: uuidv4 } = require("uuid");
const { anonymizeMedia } = require("../utils/AnonymizeMedia");
const mime = require("mime-types");

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


async function getJSONLogs(filename) {

    // check if filename is an object or a string
    let fname = filename;
    if (typeof filename === "object") {
        fname = filename.filename;
    }

    const fileinfo = await bucket.find({ filename: fname }).toArray();
    if (fileinfo.length === 0) {
        console.log("File not found", fname);
        return [];
    }
    try {
        const data = await extractFileFromDB(fname);
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

async function storeFileInDB(media) {
    const filename = uuidv4();
    let data = media.data;
    let blurringCategory = "none";
    let error = {
        code: 0,
        message: "",
    };
    // console.log(media.filename);
    // check if the file is an image
    try {
        if (media.mimetype.includes("image")) {
            // console.log("Image detected");
            let extension = mime.extension(media.mimetype);
            if (media.filename) {
                extension =
                    media.filename.split(".")[media.filename.split(".").length - 1];
            }
            const response = await anonymizeMedia(data, extension);
            data = response.data;
            blurringCategory = response.blurringCategory;
            error = response.error;

            if(error.code >= 2) {
                return {
                    filename: "NA",
                    blurringCategory: "none",
                    error: error
                }
            }
        }
    } catch (err) {
        console.log(err);
    }

    const metadata = {
        contentType: media.mimetype,
        originalfilename: media.filename,
        filesize: media.filesize,
    };

    if (media.mimetype !== "application/json") {
        metadata.blurringCategory = blurringCategory;
    }

    const uploadStream = bucket.openUploadStream(filename, {
        chunkSizeBytes: 1048576,
        metadata: metadata,
    });
    const promise = new Promise((resolve, reject) => {
        uploadStream.once("finish", () => {
            if (media.mimetype === "application/json") {
                resolve(filename);
            }
            else {
                resolve({
                    filename: filename,
                    blurringCategory: blurringCategory,
                    error: error
                });
            }
        });

        uploadStream.once("error", (err) => {
            reject(err);
        });
    });
    if (media.mimetype === "application/json") {
        uploadStream.end(JSON.stringify(data), "utf8");
    }
    else {
        uploadStream.end(data, "base64");
    }
    // console.log("File uploading to database");
    return promise;
}

module.exports = {
    removeFileFromDB,
    getJSONLogs,
    storeFileInDB
}