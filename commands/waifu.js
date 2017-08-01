module.exports = {
    name: 'waifu',
    canPrivate: true,
    requirePrefix: true,
    aliases: [],
    execute: (bot, message, prefix, command, parameter, language) => {
        message.channel.sendMessage("no.");
    }
};