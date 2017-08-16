var vars = require('./../global/vars.js');

module.exports = {
    name: 'sfw',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 0,
    type: "Fun - Image",
    execute: (bot, message, prefix, command, parameter, language) => {
        if(vars.SFWCount > 0){
            if(parameter.trim() === "count"){
                message.channel.send(language.SFWCount.getPrepared('count', vars.SFWCount));
            }
            else{
                var Path = vars.SFWPath + vars.SFWFiles[Math.floor(Math.random() * (vars.SFWCount - 1))];
                message.channel.sendImageEmbed(Path, 'SFW', message.channel);
            }
        }
        else{
            message.channel.send(language.NoSFWImage);
        }
    }
};