var fs = require('fs');
var vars = require('./../global/vars.js');

module.exports = {
    name: 'rmodule',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 3,
    type: "Developer",
    execute: (bot, message, prefix, command, parameter, language) => {
        if(!vars.IsOwner(message.author.id))
        {
            message.channel.send(language.NoPermission);
            return;
        }

        if(message.deletable)
            message.delete;

        var paramTrimmed = parameter.trim();

        if(paramTrimmed == "vars"){
            vars = require('./../modules/rerequire.js')('./../global/vars.js');
            vars.Load();
            message.channel.send(language.ModuleReloaded.getPrepared("module", "Global vars"));
        }
        else{
            var files = fs.readdirSync('./modules/');
            
            files.forEach((v, i, n) => {
                if(v.toLowerCase().indexOf(parameter) >= 0)
                {
                    require('./../modules/rerequire.js')('./modules/' + v);
                    message.channel.send(language.ModuleReloaded.getPrepared("module", v));
                }
            });
        }
        
    }
};