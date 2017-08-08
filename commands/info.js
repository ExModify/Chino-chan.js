const Discord = require('discord.js');
const os = require('os');

module.exports = {
    name: 'info',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 0,
    execute: (bot, message, prefix, command, parameter, language, uptime) => {
        var hours = Math.trunc(uptime / 3600);
        var mins = Math.trunc(uptime / 60) - hours * 60;
        var secs = uptime - (mins * 60) - (hours * 3600);

        var JoinedServers = "-**" + bot.guilds.array().map((guild) => guild.name).join("**\n-**") + "**";
        var Embed = new Discord.RichEmbed();

        Embed.setColor(255 << 16 | 050 << 8 | 230);

        Embed.setTitle(`**${language.Information}**`);

        var Description = `---**${language.Uptime}**--\n`;
        Description += `-${language.Time}: ${hours} ${language.Hours}, ${mins} ${language.Minutes}, ${secs} ${language.Seconds}`;
        Description += "\n\n";

        Description += `---**${language.JoinedServers}**---\n`;
        Description += `${JoinedServers}`;
        Description += "\n\n";

        Description += `---**${language.MemoryUsage}**---\n`;
        Description += `-${language.BotMemoryUsage}: ${(process.memoryUsage().heapUsed / 1048576).toFixed(2)}MB\n`;
        Description += `-${language.ComputerMemoryUsage}: ${((os.totalmem() - os.freemem()) / 1048576).toFixed(0)}MB/${(os.totalmem() / 1048576).toFixed(0)}MB, ${language.FreeMemory}: ${(os.freemem() / 1048576).toFixed(0)}MB`;
        
        Embed.setDescription(Description);

        message.channel.send({embed:Embed});
    }
};