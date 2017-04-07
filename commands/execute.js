var rerequire = require('./../modules/rerequire.js');
var compile = rerequire('./modules/compileNodeCommand.js');
var vars = require('./../global/vars.js');

module.exports = {
    name: 'execute',
    aliases: [],
    execute: (bot, message, prefix, command, parameter, language) => {
        if(parameter.toLowerCase().indexOf('discordtoken') >= 0 
        || parameter.toLowerCase().indexOf('osu!api') >= 0 
        || parameter.toLowerCase().indexOf('osuapi') >= 0 
        || parameter.toLowerCase().indexOf('osu!irc') >= 0
        || parameter.toLowerCase().indexOf('ircpassword') >= 0)
        {
            message.channel.sendMessage('```API key or Discord token cannot be sent!```');
            return;
        }
        if(message.author.id !== '193356184806227969'){
            message.channel.sendMessage("```You don't have permission to do that!```");
            return;
        }
        compile.execute(parameter).then(res => {
            if(res.trim() !== "")
                message.channel.sendMessage('```' + res + '```');
            else
                message.channel.sendMessage("```css\nExecution didn't send any results!```");
        });
    }
};