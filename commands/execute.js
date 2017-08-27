var vars = require('./../global/vars.js');
var fs = require('fs');
var langHandler = require("./../modules/langHandler.js");

module.exports = {
    name: 'execute',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 3,
    type: "Developer",
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

        try{
            var evalResult = eval(parameter);
            if(evalResult == undefined){
                message.channel.send(`\`\`\`css\n${language.ExecuteNoResult}\`\`\``);
            }
            else{
                SendSplit(message.channel, evalResult.toString());
            }
        }
        catch(error){
            SendSplit(message.channel, error.stack);
        }
    }
};

function SendSplit(channel, string){
    if(string.length > 1994){
        channel.send('```' + string.substring(0, 1994) + '```').then((msg) => {
            SendSplit(channel, string.substring(1994));
        });
    }
    else{
        channel.send('```' + string + '```');
    }
}