const { MongoClient, GridFSBucket } = require("mongodb");
const mongoose = require("mongoose");
const mongoUrl = "mongodb://127.0.0.1:27017/whatsappLogs";
const Surveyors = require("./models/surveyors");

async function main() {
    const client = new MongoClient(mongoUrl, {
        useNewUrlParser: true,
    });

    try {
        await client.connect();

        const surveyorData = (username) => ({
            username: username,
            password: "$2b$10$WamVvAy7AFqPvAcZSkTiwOJhp1HEAZvJ5y2hjumNQwK9DiQrVwOvO",
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
        });

        for(let i = 1; i<=20; i++)
        {
            const username = `brazil${i.toString()}`;
            const data = surveyorData(username);
            await client.db().collection("surveyors").insertOne(data);
            console.log("Created user: ", username);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

main();