var Discord = require('discord.js');

module.exports = {
    name: 'invite',
    canPrivate: false,
    requirePrefix: true,
    minimumLevel: 0,
    execute: (bot, message, prefix, command, parameter, language) => {
        var Embed = new Discord.RichEmbed();
        Embed.setAuthor("Chino-chan", bot.user.avatarURL, 'https://discordapp.com/oauth2/authorize?client_id=271658919443562506&scope=bot&permissions=0');
        Embed.setDescription('Feel free to invite me to a server owo');
        Embed.setColor(0 << 16 | 255 << 8 | 255);
        message.channel.send({embed:Embed});
    }
};