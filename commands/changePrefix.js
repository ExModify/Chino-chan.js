var vars = require('./../global/vars.js');

module.exports = {
    name: 'prefix',
    canPrivate: true,
    requirePrefix: false,
    aliases: [],
    execute: (bot, message, prefix, command, parameter, language) => {
        if(parameter === "")
            message.channel.sendMessage(language.CurrentPrefix.getPrepared('prefix', prefix));
        else{
            if(vars.Admins.indexOf(message.author.id) >= 0){
                vars.set(message.guild.id, parameter, 'prefixes');
                message.channel.sendMessage(language.PrefixChanged.getPrepared(['user', 'prefix'], [`<@${message.author.id}>`, parameter]));
            }
            else{
                message.channel.sendMessage(language.AdminNotAllowed);
            }
        }
    }
};