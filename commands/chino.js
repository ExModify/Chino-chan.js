var vars = require('./../global/vars.js');
var Random = require('random-js');
var random = new Random(Random.engines.mt19937().autoSeed());

module.exports = {
    name: 'chino',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 0,
    type: "Fun - Image",
    execute: (bot, message, prefix, command, parameter, language) => {
        if(vars.ChinoCount > 0){
            if(parameter.trim() === "count"){
                message.channel.send(language.ChinoCount.getPrepared('count', vars.ChinoCount));
            }else{
                var Path = vars.ChinoPath + vars.ChinoFiles[random.integer(0, vars.ChinoCount)];
                message.channel.sendImageEmbed(Path, 'Chino', message.channel);
            }
        }
        else{
            message.channel.send(language.NoChinoImage);
        }
    }
};