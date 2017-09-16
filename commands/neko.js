var vars = require('./../global/vars.js');
var Random = require('random-js');
var random = new Random(Random.engines.mt19937().autoSeed());

module.exports = {
    name: 'neko',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 0,
    type: "Fun - Image",
    execute: (bot, message, prefix, command, parameter, language) => {
        if(vars.NekoCount > 0){
            if(parameter.trim() === "count"){
                message.channel.send(language.NekoCount.getPrepared('count', vars.NekoCount));
            }else{
                var Path = vars.NekoPath + vars.NekoFiles[random.integer(-1, vars.NekoCount)];
                message.channel.sendImageEmbed(Path, 'Neko', message.channel);
            }
        }
        else{
            message.channel.send(language.NoNekoImage);
        }
    }
};