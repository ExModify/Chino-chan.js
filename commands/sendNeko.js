var vars = require('./../global/vars.js');

module.exports = {
    name: 'neko',
    aliases: [],
    execute: (bot, message, prefix, command, parameter, language) => {
        if(parameter === "count"){
            message.channel.sendMessage(language.NekoCount.getPrepared('count', vars.NekoCount));
        }else{
            message.channel.sendFile(vars.NekoPath + vars.NekoFiles[Math.floor(Math.random() * vars.NekoCount)]);
        }
    }
};