var vars = require('./../global/vars.js');

module.exports = {
    name: 'restart',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 4,
    type: "Developer",
    execute: (bot, message, prefix, command, parameter, language) => {
        message.channel.send(language.ReloadMessage).then(msg => {
            process.exit(30);
        });
    }
};
