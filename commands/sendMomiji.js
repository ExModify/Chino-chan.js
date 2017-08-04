var vars = require('./../global/vars.js');

module.exports = {
    name: 'momiji',
    aliases: [],
    canPrivate: true,
    requirePrefix: true,
    execute: (bot, message, prefix, command, parameter, language) => {
        if(parameter.trim() === "count"){
            message.channel.send(language.MomijiCount.getPrepared('count', vars.MomijiCount));
        }else{
            var Path = vars.MomijiPath + vars.MomijiFiles[Math.floor(Math.random() * vars.MomijiCount)];
            message.channel.sendImageEmbed(Path, 'Momiji', message.channel);
        }
    }
};