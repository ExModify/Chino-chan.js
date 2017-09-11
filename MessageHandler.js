const vars = require('./global/vars.js');
const langHandler = require('./modules/langHandler.js');
const chalk = require('chalk');
const fs = require('fs');

module.exports = {
    handle: (bot, message, waifucloud) => {
        if(message.author.id === bot.user.id)
            return;
        

        var guildID = message.guild ? message.guild.id : undefined;

        var Settings = vars.Settings(guildID);
        var Prefix = Settings["Prefix"];
        var Language = langHandler.getLanguage(Settings["Language"]);


        var SpaceIndex = message.content.indexOf(' ');
        var Command = GenerateCommand(message.content, Prefix);
        var Parameter = SpaceIndex > 0 ? message.content.substring(SpaceIndex + 1) : "";
        
        if (guildID == "264060704313573377" && message.channel.id == "335004443609137152"){ // Hardcoded fast protection
            if (Language[Command.toLowerCase()]){
                if (Language[Command.toLowerCase()] instanceof Array){
                    var random = Language[Command.toLowerCase()][Math.round(Math.random() * (Language[Command.toLowerCase()].length - 1))];
                    message.channel.send(random);
                }
            }
        }

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

            let guildID = undefined;
            if (message.guild)
                guildID = message.guild.id;

            if (vars.IsBlocked(message.author.id, guildID)) {
                message.channel.send(Language.UserBlocked);
                return;
            }

            if(message.channel.type == "dm" && !JSModule.canPrivate) {
                message.channel.send(Language.DMTriedExecute);
                return;
            }
                
            if (!PreconditionMet(JSModule.minimumLevel, message.author.id, message.guild)){
                if (JSModule.minimumLevel == 4)
                    message.channel.send(Language.NoPermissionOwner);
                else
                    message.channel.send(Language.NoPermission);

                return;
            }
            
            JSModule.execute(bot, message, Prefix, Command, Parameter, Language, waifucloud);
            var name = message.member ? message.member.displayName : message.author.username;
            
            if (message.channel.type == "dm"){
                console.log(JSON.stringify({
                    type: name,
                    message: message.content
                }));
            }
            else if (message.channel.type == "text"){
                console.log(JSON.stringify({
                    type: message.guild.name,
                    message: `${message.channel.name}#${name}: ${message.content}`
                }));
            }
        }
    }
}
function PreconditionMet(level, userID, guild){
    return vars.GetLevel(userID, guild) >= level;
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