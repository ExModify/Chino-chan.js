module.exports = {
    name: 'lenny',
    aliases: [],
    canPrivate: true,
    requirePrefix: true,
    execute: (bot, message, prefix, command, parameter, language) => {
        if(message.deletable)
            message.delete();
        message.channel.send(`\`${message.guild == null ? message.author.username : message.member.displayName}\` ( ͡° ͜ʖ ͡°)`);
    }
};