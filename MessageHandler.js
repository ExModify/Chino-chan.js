const vars = require('./global/vars.js');
const langHandler = require('./modules/langHandler.js');
const chalk = require('chalk');
const fs = require('fs');

module.exports = {
    handle: (bot, message, uptime, waifucloud) => {
        if(message.author.id === bot.user.id)
            return;

        var guildID = message.guild == undefined ? message.channel.id : message.guild.id;

        var Settings = vars.Settings(guildID);
        var Prefix = Settings["Prefix"];
        var Language = langHandler.getLanguage(Settings["Language"]);

        if (vars.IsBlocked(message.author.id, guildID)){
            message.channel.send(language.UserBlocked);
            return;
        }

        var SpaceIndex = message.content.indexOf(' ');
        var Command = GenerateCommand(message.content, Prefix);
        var Parameter = SpaceIndex > 0 ? message.content.substring(SpaceIndex + 1) : "";
        
        if(Parameter.trim() === "")
            Parameter = "";

        var JSModule = undefined;

        var Files = fs.readdirSync('./commands');
        Files.forEach((v, i, a) => {
            var LoadedModule = require(`./commands/${v}`);
            if(LoadedModule.name.toLowerCase() === Command.toLowerCase())
                JSModule = LoadedModule;
        });

        if(JSModule === undefined){
            return;
            
            if(!HasPrefix(message.content, Prefix))
                return;

            if(Parameter !== "")
                Command += ' ' + Parameter;

            message.channel.send(Language.UnknownCommand.getPrepared('command', Command));
        }else{
            if(!HasPrefix(message.content, Prefix) && JSModule.requirePrefix)
                return;

            if(message.channel.type == "dm" && !JSModule.canPrivate)
            {
                message.channel.send(Language.DMTriedExecute);
                return;
            }
            JSModule.execute(bot, message, Prefix, Command, Parameter, Language, uptime, waifucloud);
        }
    }
}

function HasPrefix(message, prefix){
    return message.startsWith(prefix);
}
function GenerateCommand(message, prefix){
    if(!HasPrefix(message, prefix))
        return message;
    else
    {
        var SpaceIndex = message.indexOf(' ');
        return message.substring(prefix.length, SpaceIndex < 0 ? message.length : SpaceIndex)
    }
}