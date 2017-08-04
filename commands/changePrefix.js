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
            if(vars.HasAdmin(message.guild, message.author.id)){
                vars.SetPrefix(message.guild == null ? messahe.author.dmChannel.id : message.guild.id);
                message.channel.sendMessage(language.PrefixChanged.getPrepared(['user', 'prefix'], [`<@${message.author.id}>`, parameter]));
            }
            else{
                message.channel.sendMessage(language.AdminNotAllowed);
            }
        }
    }
};