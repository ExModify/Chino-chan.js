var fs = require('fs');
var vars = require('./../global/vars.js');
var rerequire = require('./../modules/rerequire.js');

module.exports = {
    name: 'rmodule',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 4,
    type: "Developer",
    execute: (bot, message, prefix, command, parameter, language) => {
        if(message.deletable)
            message.delete;

        var paramTrimmed = parameter.trim();

        if(paramTrimmed == "vars"){
            vars = rerequire('./../global/vars.js');
            vars.Load();
            message.channel.send(language.ModuleReloaded.getPrepared("module", "Global vars"));
        }
        else{
            var files = fs.readdirSync('./modules/');
            
            files.forEach((v, i, n) => {
                if(v.toLowerCase().indexOf(parameter) >= 0)
                {
                    rerequire('./modules/' + v);
                    message.channel.send(language.ModuleReloaded.getPrepared("module", v));
                }
            });
        }
        
    }
};