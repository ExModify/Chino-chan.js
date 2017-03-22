module.exports = {
    name: 'help',
    aliases: [],
    execute: (bot, message, command, parameter) => {
        message.channel.sendMessage("Help is missing :v");
    }
};