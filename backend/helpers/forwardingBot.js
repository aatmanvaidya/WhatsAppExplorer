const forwardingBot = (client,sender_chat_id,receiver_chat_id) => {
    client.on('message', async msg => {
        console.log("message received from: ", msg.from)
        if (msg.from === sender_chat_id) {
            msg.forward(receiver_chat_id)
            console.log("message forwarded to: ", receiver_chat_id)
        }
    });
}

module.exports = {
    forwardingBot
}