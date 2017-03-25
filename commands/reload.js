module.exports = {
    name: 'reload',
    aliases: [],
    execute: (bot, message, prefix, command, parameter, language) => {
        message.channel.sendMessage('Reloading...').then(() => {
            process.exit(2);
        });
    }
};