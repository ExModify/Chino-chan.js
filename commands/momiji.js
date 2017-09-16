var vars = require('./../global/vars.js');
var Random = require('random-js');
var random = new Random(Random.engines.mt19937().autoSeed());

module.exports = {
    name: 'momiji',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 0,
    type: "Fun - Image",
    execute: (bot, message, prefix, command, parameter, language) => {
        if(vars.MomijiCount > 0){
            if(parameter.trim() === "count"){
                message.channel.send(language.MomijiCount.getPrepared('count', vars.MomijiCount));
            }else{
                var Path = vars.MomijiPath + vars.MomijiFiles[random.integer(-1, vars.MomijiCount)];
                message.channel.sendImageEmbed(Path, 'Momiji', message.channel);
            }
        }
        else{
            message.channel.send(language.NoMomijiImage);
        }
    }
};