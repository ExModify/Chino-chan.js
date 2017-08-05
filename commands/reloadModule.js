var rerequire = require('./../modules/rerequire.js');
var fs = require('fs');
var vars = require('./../global/vars.js');

module.exports = {
    name: 'rmodule',
    aliases: [],
    canPrivate: true,
    requirePrefix: true,
    execute: (bot, message, prefix, command, parameter, language) => {
        if(!vars.IsOwner(message.author.id))
        {
            message.channel.sendMessage(language.NoPermission);
            return;
        }

        var paramTrimmed = parameter.trim();

        if(paramTrimmed == "vars"){
            vars = rerequire('./global/vars.js');
            vars.Load();
            message.channel.sendMessage(language.ModuleReloaded.getPrepared("module", "Global vars"));
        }
        else if (paramTrimmed == "images"){
            vars.ReloadImages();
            message.channel.sendMessage(language.ModuleReloaded.getPrepared("module", "Images"));
        }
        else{
            var files = fs.readdirSync('./modules/');
            
            files.forEach((v, i, n) => {
                if(v.toLowerCase().indexOf(parameter) >= 0)
                {
                    rerequire('./modules/' + v);
                    message.channel.sendMessage(language.ModuleReloaded.getPrepared("module", v));
                }
            });
        }
        
    }
};