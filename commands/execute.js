var rerequire = require('./../modules/rerequire.js');
var compile = rerequire('./modules/compileNodeCommand.js');
var vars = require('./../global/vars.js');

module.exports = {
    name: 'execute',
    canPrivate: true,
    requirePrefix: true,
    aliases: [],
    execute: (bot, message, prefix, command, parameter, language) => {
        if(message.author.id !== '193356184806227969'){
            message.channel.sendMessage(`\`\`\`${language.ExecuteNoPermission}\`\`\``);
            return;
        }
        if(parameter.toLowerCase().indexOf('discordtoken') >= 0 
        || parameter.toLowerCase().indexOf('osu!api') >= 0 
        || parameter.toLowerCase().indexOf('osuapi') >= 0 
        || parameter.toLowerCase().indexOf('osu!irc') >= 0
        || parameter.toLowerCase().indexOf('ircpassword') >= 0)
        {
            message.channel.sendMessage(`\`\`\`${language.ExecuteContainsKey}\`\`\``);
            return;
        }
        compile.execute(parameter).then(res => {
            if(res.trim() !== "")
                message.channel.sendMessage('```' + res + '```');
            else
                message.channel.sendMessage(`\`\`\`css\n${language.ExecuteNoResult}\`\`\``);
        });
    }
};