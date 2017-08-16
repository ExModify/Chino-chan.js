module.exports = {
    name: 'lenny',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 0,
    type: "Fun",
    execute: (bot, message, prefix, command, parameter, language) => {
        if(message.deletable)
            message.delete();
        message.channel.send(`\`${message.guild == null ? message.author.username : message.member.displayName}\` ( ͡° ͜ʖ ͡°)`);
    }
};