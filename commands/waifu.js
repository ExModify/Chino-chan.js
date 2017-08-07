module.exports = {
    name: 'waifu',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 0,
    execute: (bot, message, prefix, command, parameter, language) => {
        message.channel.sendMessage("no.");
    }
};