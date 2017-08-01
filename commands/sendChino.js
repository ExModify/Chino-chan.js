var vars = require('./../global/vars.js');

module.exports = {
    name: 'chino',
    aliases: [],
    canPrivate: true,
    requirePrefix: true,
    execute: (bot, message, prefix, command, parameter, language) => {
        if(parameter === "count"){
            message.channel.sendMessage(language.ChinoCount.getPrepared('count', vars.ChinoCount));
        }else{
            message.channel.sendFile(vars.ChinoPath + vars.ChinoFiles[Math.floor(Math.random() * vars.ChinoCount)]);
        }
    }
};