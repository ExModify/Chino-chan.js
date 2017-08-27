var vars = require('./../global/vars.js');

module.exports = {
    name: 'ping',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 0,
    type: "Management",
    execute: (bot, message, prefix, command, parameter, language) => {
        var startDate = Date.now();
        message.channel.send("Pong!").then((msg) => {
            var noticeTime = ((message.createdTimestamp - startDate) / 10).toFixed(0);
            var messageSent = Date.now() - startDate;
            
            msg.edit(`Pong! \`Noticed: ${noticeTime}ms, message sent: ${messageSent}ms\``)
        });
    }
};