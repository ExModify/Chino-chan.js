const vars = require('./../global/vars.js')

module.exports = {
    name: 'reload',
    canPrivate: true,
    requirePrefix: true,
    aliases: [],
    execute: (bot, message, prefix, command, parameter, language) => {
        if(vars.Admins.indexOf(message.author.id) >= 0){
            message.channel.sendMessage('Reloading...').then(() => {
                process.exit(2);
            });
        }
        else{
            message.channel.sendMessage(language.NoPermission);
        }
    }
};