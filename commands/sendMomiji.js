var vars = require('./../global/vars.js');

module.exports = {
    name: 'momiji',
    aliases: [],
    canPrivate: true,
    requirePrefix: true,
    execute: (bot, message, prefix, command, parameter, language) => {
        if(parameter === "count"){
            message.channel.sendMessage(language.MomijiCount.getPrepared('count', vars.MomijiCount));
        }else{
            message.channel.sendFile(vars.MomijiPath + vars.MomijiFiles[Math.floor(Math.random() * vars.MomijiCount)]);
        }
    }
};