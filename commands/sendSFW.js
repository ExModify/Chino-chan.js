var vars = require('./../global/vars.js');

module.exports = {
    name: 'sfw',
    aliases: [],
    canPrivate: true,
    requirePrefix: true,
    execute: (bot, message, prefix, command, parameter, language) => {
        if(parameter.trim() === "count"){
            message.channel.send(language.SFWCount.getPrepared('count', vars.SFWCount));
        }
        else{
            var Path = vars.SFWPath + vars.SFWFiles[Math.floor(Math.random() * vars.SFWCount)];
            message.channel.sendImageEmbed(Path, 'SFW', message.channel);
        }
    }
};