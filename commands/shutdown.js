var vars = require('./../global/vars.js');

module.exports = {
    name: 'shutdown',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 3,
    execute: (bot, message, prefix, command, parameter, language) => {
        if(vars.IsOwner(message.author.id)){
            message.channel.send(language.ShutDownMessage).then(msg => {
                bot.user.setStatus("invisible").then(usr => {
                    process.exit(20);
                });
            });
        }
    }
};
