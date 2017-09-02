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
            var messageSent = Date.now() - startDate;
            var secs = (messageSent / 1000).toFixed(0);
            messageSent -= secs * 1000;
            
            msg.edit(`Pong! \`${secs}s ${messageSent}ms\``)
        });
    }
};