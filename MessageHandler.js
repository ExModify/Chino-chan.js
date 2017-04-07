const rerequire = require('./modules/rerequire.js');

const vars = require('./global/vars.js');
const langHandler = rerequire('./modules/langHandler.js');
const chalk = rerequire('chalk');
const fs = rerequire('fs');

module.exports = {
    handle: (bot, message) => {
        if(message.author.id === bot.user.id)
            return;

        var Prefix = '$';
        var Language = langHandler.getLanguage('en');

        if(message.channel.type != "dm"){
            var guildID = message.guild.id;
            
            if(!vars.Prefixes.has(guildID))
            {
                vars.set(guildID, '$', 'prefixes');
            }
            else
                Prefix = vars.Prefixes.get(guildID);
            
            if(vars.Languages.has(guildID))
            {
                Language = langHandler.getLanguage(vars.Languages.get(guildID));
            }
            else
                vars.set(guildID, 'en', 'languages');
        }
        else{
            message.channel.sendMessage("You can't begin invoking commands from private channel!");
            return;
        }

        if(!message.content.startsWith(Prefix))
            return;

        var SpaceIndex = message.content.indexOf(' ');
        var Command = message.content.substring(Prefix.length, SpaceIndex < 0 ? message.length : SpaceIndex);
        var Parameter = SpaceIndex > 0 ? message.content.substring(SpaceIndex + 1) : "";
        
        if(Parameter.trim() === "")
            Parameter = "";


        var JSModule = undefined;

        var Files = fs.readdirSync('./commands');
        Files.forEach((v, i, a) => {
            var LoadedModule = rerequire(`./commands/${v}`);
            if(LoadedModule.name.toLowerCase() === Command.toLowerCase() || LoadedModule.aliases.indexOf(Command.toLowerCase()) >= 0)
                JSModule = LoadedModule;
        });

        if(JSModule === undefined){
            if(Parameter !== "")
                Command += ' ' + Parameter;

            message.channel.sendMessage(Language.UnknownCommand.getPrepared('command', Command));
        }else{
            JSModule.execute(bot, message, Prefix, Command, Parameter, Language);
        }
    }
}