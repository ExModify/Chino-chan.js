var vars = require('./../global/vars.js');

module.exports = {
    name: 'sfw',
    aliases: [],
    canPrivate: true,
    requirePrefix: true,
    execute: (bot, message, prefix, command, parameter, language) => {
        if(parameter === "count"){
            message.channel.sendMessage(language.SFWCount.getPrepared('count', vars.SFWCount));
        }
        else{
            message.channel.sendFile(vars.SFWPath + vars.SFWFiles[Math.floor(Math.random() * vars.SFWCount)]);
        }
    }
};