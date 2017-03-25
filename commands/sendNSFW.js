var vars = require('./../global/vars.js');

module.exports = {
    name: 'nsfw',
    aliases: [],
    execute: (bot, message, prefix, command, parameter, language) => {
        if(parameter === "count"){
            message.channel.sendMessage(language.NSFWCount.getPrepared('count', vars.NSFWCount));
        }else{
            message.channel.sendFile(vars.NSFWPath + vars.NSFWFiles[Math.floor(Math.random() * vars.NSFWCount)]);
        }
    }
};