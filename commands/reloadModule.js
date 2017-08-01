var rerequire = require('./../modules/rerequire.js');
var fs = require('fs');

module.exports = {
    name: 'rmodule',
    aliases: [],
    canPrivate: true,
    requirePrefix: true,
    execute: (bot, message, prefix, command, parameter, language) => {
        if(message.author.id != '193356184806227969')
        {
            message.channel.sendMessage(language.NoPermission);
            return;
        }
        var files = fs.readdirSync('./modules/');
        
        files.forEach((v, i, n) => {
            if(v.toLowerCase().indexOf(parameter) >= 0)
            {
                rerequire('./modules/' + v);
                message.channel.sendMessage(language.ModuleReloaded.getPrepared("module", v));
            }
        });
    }
};