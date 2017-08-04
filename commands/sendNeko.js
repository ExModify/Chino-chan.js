var vars = require('./../global/vars.js');

module.exports = {
    name: 'neko',
    aliases: [],
    canPrivate: true,
    requirePrefix: true,
    execute: (bot, message, prefix, command, parameter, language) => {
        if(parameter.trim() === "count"){
            message.channel.send(language.NekoCount.getPrepared('count', vars.NekoCount));
        }else{
            var Path = vars.NekoPath + vars.NekoFiles[Math.floor(Math.random() * vars.NekoCount)];
            message.channel.sendImageEmbed(Path, 'Neko', message.channel);
        }
    }
};