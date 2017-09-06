const Discord = require('discord.js');
const os = require('os');
var vars = require('./../global/vars.js');

module.exports = {
    name: 'info',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 0,
    type: "Information",
    execute: (bot, message, prefix, command, parameter, language) => {
        var uptime = Math.floor(process.uptime());

        var days = Math.trunc(uptime / 3600 / 24);
        var hours = Math.trunc(uptime / 3600) - days * 24;
        var mins = Math.trunc(uptime / 60) - hours * 60;
        var secs = uptime - (mins * 60) - (hours * 3600);

        var JoinedServers = "-**" + bot.guilds.array().map((guild) => guild.name).join("**\n-**") + "**";
        var Embed = new Discord.RichEmbed();

        Embed.setColor(255 << 16 | 050 << 8 | 230);

        Embed.setDescription(`**${language.Information}**`);
        Embed.setAuthor(bot.user.username, bot.user.avatarURL);

        Embed.addField(language.MemoryUsage, `${(process.memoryUsage().heapUsed / 1048576).toFixed(2)}MB\n`, true);
        
        Embed.addField(language.Library, "discord.js", true);
        var Owner = bot.users.get(vars.OwnerID);
        Embed.addField(language.Creator, Owner.username + "#" + Owner.discriminator, true);

        Embed.addField(language.Users, bot.users.size, true);

        Embed.addField(language.Uptime, `${days} ${language.Days} ${hours} ${language.Hours}, ${mins} ${language.Minutes}, ${secs} ${language.Seconds}`, false);
        
        Embed.addField(language.JoinedServers, JoinedServers, false);

        message.channel.send({embed:Embed});
    }
};
