module.exports = {
    name: 'reload',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 3,
    type: "Developer",
    execute: (bot, message, prefix, command, parameter, language) => {
        message.channel.send(language.ReloadMessage).then(msg => {
            process.exit(0);
        });
    }
};