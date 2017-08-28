var vars = require('./../global/vars.js');

module.exports = {
    name: 'shutdown',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 4,
    type: "Management",
    execute: (bot, message, prefix, command, parameter, language) => {
        message.channel.send(language.ShutDownMessage).then(msg => {
            bot.user.setStatus("invisible").then(usr => {
                process.exit(20);
            });
        });
    }
};
