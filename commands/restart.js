var vars = require('./../global/vars.js');

module.exports = {
    name: 'restart',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 3,
    type: "Developer",
    execute: (bot, message, prefix, command, parameter, language) => {
        if(vars.IsOwner(message.author.id)){
            message.channel.send(language.ReloadMessage).then(msg => {
                process.exit(30);
            });
        }
    }
};
