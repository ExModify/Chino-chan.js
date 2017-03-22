const vars = require('./global/vars.js');
const chalk = require('chalk');

module.exports = {
    handle: (bot, message) => {
        var guildID = message.guild.id;
        if(!vars.Prefixes.has(guildID))
        {
            vars.Prefixes.set(guildID, '$');
            vars.SaveMap(vars.Prefixes, './data/prefixes.txt');
        }

        var Prefix = vars.Prefixes.get(guildID);

        if(!vars.Languages.has(guildID))
        {
            vars.Languages.set(guildID, "en");
            vars.SaveMap(vars.Languages, './data/languages.txt');
        }
        var Language = vars.Languages.get(guildID);

        if(!message.startsWith(Prefix))
        {
            message.channel.sendMessage(Language.UnknownCommand);
            return;
        }

        var SpaceIndex = message.indexOf(' ');
        var Command = message.substring(Prefix.length, SpaceIndex < 0 ? message.length : SpaceIndex);
    }
}