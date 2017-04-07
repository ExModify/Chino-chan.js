var vars = require('./../global/vars.js');

module.exports = {
    name: 'prefix',
    aliases: [],
    execute: (bot, message, prefix, command, parameter, language) => {
        if(parameter === "")
            message.channel.sendMessage(language.CurrentPrefix.getPrepared('prefix', prefix));
        else{
            vars.set(message.guild.id, parameter, 'prefixes');
            message.channel.sendMessage(language.PrefixChanged.getPrepared(['user', 'prefix'], [`<@${message.author.id}>`, parameter]));
        }
    }
};