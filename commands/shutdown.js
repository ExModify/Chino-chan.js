var vars = require('./../global/vars.js');

module.exports = {
    name: 'shutdown',
    aliases: [],
    canPrivate: true,
    requirePrefix: true,
    execute: (bot, message, prefix, command, parameter, language) => {
        if(vars.IsOwner(message.author.id)){
            message.channel.sendMessage(language.ShutDownMessage).then(msg => {
                process.exit(0);
            });
        }
    }
};
