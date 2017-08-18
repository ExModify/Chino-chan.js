var vars = require('./../global/vars.js');

module.exports = {
    name: 'hibiki',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 0,
    type: "Fun - Image",
    execute: (bot, message, prefix, command, parameter, language) => {
        if(vars.MomijiCount > 0){
            if(parameter.trim() === "count"){
                message.channel.send(language.MomijiCount.getPrepared('count', vars.HibikiCount));
            }else{
                var Path = vars.HibikiPath + vars.HibikiFiles[Math.floor(Math.random() * (vars.HibikiCount - 1))];
                message.channel.sendImageEmbed(Path, 'Hibiki', message.channel);
            }
        }
        else{
            message.channel.send(language.NoHibikiImage);
        }
    }
};