var vars = require('./../global/vars.js');

module.exports = {
    name: 'chino',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 0,
    execute: (bot, message, prefix, command, parameter, language) => {
        if(vars.ChinoCount > 0){
            if(parameter.trim() === "count"){
                message.channel.send(language.ChinoCount.getPrepared('count', vars.ChinoCount));
            }else{
                var Path = vars.ChinoPath + vars.ChinoFiles[Math.floor(Math.random() * vars.ChinoCount)];
                message.channel.sendImageEmbed(Path, 'Chino', message.channel);
            }
        }
        else{
            message.channel.send(language.NoChinoImage);
        }
    }
};