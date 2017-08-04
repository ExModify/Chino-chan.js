const Discord = require('discord.js');
var exec = require('child_process').exec;

module.exports = {
    name: 'git',
    aliases: [],
    canPrivate: true,
    requirePrefix: true,
    execute: (bot, message, prefix, command, parameter, language) => {
        var proc = exec('git log --format=%B -n 1', (error, out, err) => {
            var lines = out.split('\n', 2);
            var Embed = new Discord.RichEmbed();
            Embed.setTitle("Github - " + lines[0]);
            Embed.setDescription(lines[1]);
            Embed.setURL("https://github.com/ExModify/ReExMoBot.js");
            message.channel.send({embed:Embed});
        });
    }
};