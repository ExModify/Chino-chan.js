module.exports = {
    name: 'shutdown',
    aliases: [],
    canPrivate: true,
    requirePrefix: true,
    execute: (bot, message, prefix, command, parameter, language) => {
        if(message.member.id == "193356184806227969"){
            message.channel.sendMessage(language.ShutDownMessage).then(msg => {
                bot.user.setStatus("invisible").then(user => {
                    process.exit(0);
                });
            });
        }
    }
};
