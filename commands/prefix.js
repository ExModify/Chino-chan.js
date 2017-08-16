var vars = require('./../global/vars.js');

module.exports = {
    name: 'prefix',
    canPrivate: true,
    requirePrefix: false,
    minimumLevel: 1,
    type: "Customization",
    execute: (bot, message, prefix, command, parameter, language) => {
        if(parameter === "")
            message.channel.send(language.CurrentPrefix.getPrepared('prefix', prefix));
        else{
            if(vars.HasAdmin(message.guild, message.author.id)){
                vars.SetPrefix(message.guild == null ? message.channel.id : message.guild.id, parameter);
                message.channel.send(language.PrefixChanged.getPrepared(['user', 'prefix'], [`<@${message.author.id}>`, parameter]));
            }
            else{
                message.channel.send(language.AdminNotAllowed);
            }
        }
    }
};