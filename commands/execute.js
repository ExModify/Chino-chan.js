var rerequire = require('./../modules/rerequire.js');
var compile = rerequire('./modules/compileNodeCommand.js');
var vars = require('./../global/vars.js');

module.exports = {
    name: 'execute',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 3,
    execute: (bot, message, prefix, command, parameter, language) => {
        if(!vars.IsOwner(message.author.id)){
            message.channel.sendMessage(`\`\`\`${language.ExecuteNoPermission}\`\`\``);
            return;
        }
        if(parameter.toLowerCase().indexOf('discordtoken') >= 0 
        || parameter.toLowerCase().indexOf('osu!api') >= 0 
        || parameter.toLowerCase().indexOf('osuapi') >= 0 
        || parameter.toLowerCase().indexOf('osu!irc') >= 0
        || parameter.toLowerCase().indexOf('ircpassword') >= 0)
        {
            message.channel.send(`\`\`\`${language.ExecuteContainsKey}\`\`\``);
            return;
        }
        compile.execute(parameter).then(res => {
            if(res.trim() !== "")
                message.channel.send('```' + res + '```');
            else
                message.channel.send(`\`\`\`css\n${language.ExecuteNoResult}\`\`\``);
        });
    }
};