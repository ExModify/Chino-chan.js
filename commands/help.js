const fs = require('fs');
var rerequire = require('./../modules/rerequire.js');

module.exports = {
    name: 'help',
    aliases: [],
    canPrivate: true,
    requirePrefix: true,
    execute: (bot, message, prefix, command, parameter, language) => {
        var Message = '```css\n';

        var Names = [];
        var Helps = [];

        var MaxLength = 0;

        var Files = fs.readdirSync('./commands');
        Files.forEach((v, i, n) => {
            var ModuleName = rerequire('./commands/' + v).name;

            Names.push(ModuleName);
            Helps.push(language.CommandHelp[ModuleName]);

            if(ModuleName.length > MaxLength)
            {
                MaxLength = ModuleName.length;
            }
        });

        for(var i = 0; i < Names.length; i++){
            var Name = Names[i];
            var Help = Helps[i];
            
            var Difference = MaxLength - Name.length;
            for(var j = 0; j < Difference; j++){
                Name += " ";
            }

            Message += (Name + " - " + Help + "\n");
        }

        Message += '```';

        message.author.createDM().then(channel => {
            channel.sendMessage(Message);
        });

        if(message.channel.type !== "dm")
            message.channel.sendMessage(language.PrivateMessage.getPrepared('mention', `<@${message.author.id}>`));
    }
};