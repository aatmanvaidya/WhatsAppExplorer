const shell = require("shelljs");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

async function runPythonScript(extension, folder) {
    return new Promise((resolve, reject) => {
        const pathToScript = path.resolve(__dirname, "../../anonymisation/faceAnon.py");
        var child = shell.exec(
            `python3 ${pathToScript} ${extension} ${folder}`,
            {
                async: true,
            }
        );
        child.stdout.on("data", function (data) {
            // console.log("stdout: " + data);
            if (data.includes("Anonymisation done!") || data.includes("Anonymisation failed!"))
                resolve(data)
        });
        child.stderr.on("data", function (data) {
            // console.log("stderr: " + data);
            reject(data);
        });
        // child.on('exit', function (code) {
        //   console.log('child process exited with code ' + code);
        // });
    });
}
async function anonymizeMedia(data, extension) {
    // Generate unique folder name
    const folder = uuidv4();
    const pathToAnonymisationFolder = path.resolve(__dirname, "../../anonymisation/whatsapp_analysis");
    // create folder
    fs.mkdirSync(`${pathToAnonymisationFolder}/${folder}`);
    // save data into a file
    const fpath = `${pathToAnonymisationFolder}/${folder}/test.${extension}`;
    const apath = `${pathToAnonymisationFolder}/${folder}/_anon.${extension}`;
    // write data in base64 format
    fs.writeFileSync(fpath, data, { encoding: "base64" });
    let blurringCategory = "none";
    const error = {
        'code': 0,
        'message': ''
    }
    // run python script
    try {
        // not working on gifs
        if (extension === "webp") {
            // console.log("Not anonymizing webp files");
            fs.rm(
                `${pathToAnonymisationFolder}/${folder}`,
                {
                    recursive: true,
                },
                (err) => {
                    if (err) {
                        console.log("Error deleting folder: ", err);
                    }
                }
            );
            return {
                data,
                blurringCategory,
                error: {
                    'code': 1,
                    'message': 'Not anonymizing webp files'
                }
            };
        } else {
            const response = await runPythonScript(extension, folder);
            if (response.includes("failed!")) {
                if (response.includes("Face")) {
                    error.code = 3;
                    error.message = "Face anonymisation failed";
                } else if (response.includes("NSFW")) {
                    error.code = 4;
                    error.message = "NSFW anonymisation failed";
                }
            }
            else {
                if (response.includes("Face")) {
                    blurringCategory = "face";
                } else if (response.includes("NSFW")) {
                    blurringCategory = "nsfw";
                }
            }

            const result = fs.readFileSync(apath, { encoding: "base64" });
            // delete the folder and files inside
            fs.rm(
                `${pathToAnonymisationFolder}/${folder}`,
                {
                    recursive: true,
                },
                (err) => {
                    if (err) {
                        console.log("Error deleting folder: ", err);
                    }
                }
            );
            return {
                data: result,
                blurringCategory,
                error
            };
        }
    } catch (err) {
        console.log("Failed to anonymize media: ", err);
        fs.rm(
            `${pathToAnonymisationFolder}/${folder}`,
            {
                recursive: true,
            },
            (err) => {
                if (err) {
                    console.log("Error deleting folder: ", err);
                }
            }
        );
        return {
            data,
            blurringCategory,
            error: {
                'code': 2,
                'message': 'Some unknown error occurred while anonymizing media.'
            }
        };
    }
}

module.exports = {
    anonymizeMedia,
};