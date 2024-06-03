const { MongoClient, GridFSBucket } = require("mongodb");
const mongoose = require("mongoose");
const mongoUrl = "mongodb://127.0.0.1:27017/whatsappLogs";
const Surveyors = require("./models/surveyors");
const bcrypt = require("bcrypt");

async function main() {
    const client = new MongoClient(mongoUrl, {
        useNewUrlParser: true,
    });

    try {
        await client.connect();

        const surveyorData = (username, password) => ({
            username: username,
            password: password,
            name: username,
            contactInfo: {
                "phoneNumber": "9999999999",
                "address": "address",
                "email": `${username.replace(/\s+/g, "")}@mail.com`,
            },
            bio: "bio",
            addedBy: "630558fddd6268039693aaff",
            surveyDisabled: false,
            participantsAdded: [],
            dateOfRegistration: new Date(),
            lastActiveAt: new Date(),
            isIndividual: false,
            region: "hi",
        });

        for(let i = 1; i<=16; i++)
        {
            const username = `wsurveyor${i.toString()}`;
            const password = "UPwhatsapp#123!";
            const hashedPwd = bcrypt.hashSync(password, 10);
            // const data = surveyorData(username, hashedPwd);
            // // delete existing user
            // await client.db().collection("surveyors").deleteOne({username: username});
            // await client.db().collection("surveyors").insertOne(data);
            // Update password for existing users
            await client.db().collection("surveyors").updateOne({username: username}, {$set: {password: hashedPwd}});
            console.log("Updated user: ", username);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

main();