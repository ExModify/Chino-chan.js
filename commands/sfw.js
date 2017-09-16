var vars = require('./../global/vars.js');
var Random = require('random-js');
var random = new Random(Random.engines.mt19937().autoSeed());

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
                var Path = vars.SFWPath + vars.SFWFiles[random.integer(-1, vars.SFWCount)];
                message.channel.sendImageEmbed(Path, 'SFW', message.channel);
            }
        }
        else{
            message.channel.send(language.NoSFWImage);
        }
    }
};