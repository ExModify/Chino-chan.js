const Discord = require('discord.js');
var exec = require('child_process').exec;

module.exports = {
    name: 'git',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 0,
    type: "Fun",
    execute: (bot, message, prefix, command, parameter, language) => {
        var proc = exec('git log --format=%B -n 1', (error, out, err) => {
            var Embed = new Discord.MessageEmbed();
            Embed.setTitle("Github");
            Embed.setDescription(out);
            Embed.setURL("https://github.com/ExModify/Chino-chan.js");
            Embed.setColor(0 << 16 | 255 << 8 | 255);
            message.channel.send({embed:Embed});
        });
    }
};