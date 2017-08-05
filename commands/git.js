const Discord = require('discord.js');
var exec = require('child_process').exec;

module.exports = {
    name: 'git',
    aliases: [],
    canPrivate: true,
    requirePrefix: true,
    execute: (bot, message, prefix, command, parameter, language) => {
        var proc = exec('git log --format=%B -n 1', (error, out, err) => {
            var lines = out.split('\n');
            var Embed = new Discord.RichEmbed();
            Embed.setTitle("Github - " + lines[0]);
            Embed.setDescription(lines.slice(1).join('\n'));
            Embed.setURL("https://github.com/ExModify/ReExMoBot.js");
            Embed.setColor(0 << 16 | 255 << 8 | 255);
            message.channel.send({embed:Embed});
        });
    }
};