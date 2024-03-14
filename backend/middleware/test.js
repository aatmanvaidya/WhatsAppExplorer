const { DeidentifyMessage } = require('./identification.js');


const main = async () => {
    const deidentifyMessage = new DeidentifyMessage();
    deidentifyMessage.addField('message_body');
    deidentifyMessage.addField('message_reply');

    // deidentifyMessage.addRow(['Hello My name is Shreyash call me on 123456789', 'Hello Jhon, I am Shreyash']);
    // deidentifyMessage.addRow(['What is your email address', 'My email address is jhon123@gmail.com']);
    // deidentifyMessage.addRow(['Do you know where i can find a good restaurant', 'Yes, I know a good restaurant near by']);
    // deidentifyMessage.addRow(['I am going to the restaurant', 'Okay, I will meet you there']);
    deidentifyMessage.addRow(['I Jamie really like www.James.com Pizza', 'Call them on http://www.John.com']);

    const startTime = Date.now();
    await deidentifyMessage.inspect();
    const endTime = Date.now();
    console.log(`Time taken: ${endTime - startTime}ms`);

    deidentifyMessage.data['message_body'].forEach((element) => {
        console.log(element);
    });
    deidentifyMessage.data['message_reply'].forEach((element) => {
        console.log(element);
    });
    // console.log(deidentifyMessage.findings);
};

main();
