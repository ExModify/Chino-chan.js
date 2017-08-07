var vars = require('./../global/vars.js');

module.exports = {
    name: 'stophandler',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 3,
    execute: (bot, message, prefix, command, parameter, language) => {
        if(vars.IsOwner(message.author.id)){
            message.channel.send(language.ShutDownMessage).then(Msg => {
                bot.user.setStatus("invisible").then(usr => {
                    bot.destroy().then(() => {
                        process.exit(20);
                    });
                });
            });
        }
    }
};