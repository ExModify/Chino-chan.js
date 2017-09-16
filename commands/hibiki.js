var vars = require('./../global/vars.js');
var Random = require('random-js');
var random = new Random(Random.engines.mt19937().autoSeed());

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
                var Path = vars.HibikiPath + vars.HibikiFiles[random.integer(vars.HibikiCount)];
                message.channel.sendImageEmbed(Path, 'Hibiki', message.channel);
            }
        }
        else{
            message.channel.send(language.NoHibikiImage);
        }
    }
};