const vars = require('./global/vars.js');
const chalk = require('chalk');
const fs = require('fs');

module.exports = {
    handle: (bot, message) => {
        var guildID = message.guild.id;
        if(!vars.Prefixes.has(guildID))
        {
            vars.Prefixes.set(guildID, '$');
            vars.SaveMap(vars.Prefixes, './data/prefixes.txt');
        }

        var Prefix = vars.Prefixes.get(guildID);

        if(!message.content.startsWith(Prefix))
            return;

        if(!vars.Languages.has(guildID))
        {
            vars.Languages.set(guildID, "en");
            vars.SaveMap(vars.Languages, './data/languages.txt');
        }
        var Language = vars.Languages.get(guildID);

        var SpaceIndex = message.content.indexOf(' ');
        var Command = message.content.substring(Prefix.length, SpaceIndex < 0 ? message.length : SpaceIndex);
        var Parameter = SpaceIndex > 0 ? message.content.substring(SpaceIndex) : "";


        var JSModule = undefined;

        var Files = fs.readdirSync('./commands');
        Files.forEach((v, i, a) => {
            var LoadedModule = require(`./commands/${v}`);
            if(LoadedModule.name === Command || LoadedModule.aliases.indexOf(Command) >= 0)
                JSModule = LoadedModule;
        });

        if(JSModule === undefined){
            message.channel.sendMessage(Language.UnknownCommand);
        }else{
            JSModule.execute(bot, message, Command, Parameter);
        }
    }
}