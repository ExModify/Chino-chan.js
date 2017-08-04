var vars = require('./../global/vars.js');

module.exports = {
    name: 'chino',
    aliases: [],
    canPrivate: true,
    requirePrefix: true,
    execute: (bot, message, prefix, command, parameter, language) => {
        if(parameter.trim() === "count"){
            message.channel.send(language.ChinoCount.getPrepared('count', vars.ChinoCount));
        }else{
            var Path = vars.ChinoPath + vars.ChinoFiles[Math.floor(Math.random() * vars.ChinoCount)];
            message.channel.sendImageEmbed(Path, 'Chino', message.channel);
        }
    }
};