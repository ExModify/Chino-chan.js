var Discord = require('discord.js');

module.exports = {
    name: 'invite',
    canPrivate: false,
    requirePrefix: true,
    minimumLevel: 0,
    type: "Information",
    execute: (bot, message, prefix, command, parameter, language) => {
        var Embed = new Discord.MessageEmbed();
        Embed.setAuthor("Chino-chan", bot.user.avatarURL({ size: 2048, format: "png" }), 'https://discordapp.com/oauth2/authorize?client_id=271658919443562506&scope=bot&permissions=0');
        Embed.setDescription('Feel free to invite me to a server, just click on my name in this embed owo');
        Embed.setColor(0 << 16 | 255 << 8 | 255);
        message.channel.send({embed:Embed});
    }
};