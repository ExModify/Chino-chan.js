module.exports = {
    name: 'help',
    aliases: [],
    execute: (bot, message, command, parameter, language) => {
        message.channel.sendMessage("Help is missing :v");
    }
};