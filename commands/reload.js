module.exports = {
    name: 'reload',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 3,
    execute: (bot, message, prefix, command, parameter, language) => {
        message.channel.send(language.ReloadMessage).then(msg => {
            process.exit(message.channel.id);
        });
    }
};