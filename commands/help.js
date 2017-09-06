const fs = require('fs');
var vars = require('./../global/vars.js');

module.exports = {
    name: 'help',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 0,
    type: "Information",
    execute: (bot, message, prefix, command, parameter, language) => {
        var CommandNames = [];
        var Commands = [];
        fs.readdirSync('./commands').forEach((v, i, a) => {
            var Module = require('./../commands/' + v);
            if (PreconditionMet(Module.minimumLevel, message.author.id, message.guild)){
                CommandNames.push(Module.name.toLowerCase());
                Commands.push({
                    name: Prefix(Module.minimumLevel) + Module.name,
                    type: Module.type,
                    level: Module.minimumLevel,
                    help: language.CommandHelp[Module.name]
                });
            }
        });

        var CommandIndex = CommandNames.indexOf(parameter.toLowerCase());

        if(CommandIndex >= 0){
            var Command = Commands[CommandIndex];
            if(Command.level == 0){
                message.channel.send(`\`\`\`${Command.help}\`\`\``);
            }
            else{
                if (message.deletable)
                    message.delete();
                
                message.author.createDM().then(channel => {
                    channel.send(`\`\`\`css\n${language.NotEveryoneCanUse}\n\n${Command.name}: ${Command.help}\`\`\``);
                });
            }
        }
        else{
            var Message = "```css\n";
            
            var Categories = new Map();
    
            Commands.forEach((v, i, a) => {
                if (Categories.has(v.type)){
                    var CategorizedCommands = Categories.get(v.type);
                    CategorizedCommands.push(v.name);
                    Categories.set(v.type, CategorizedCommands);
                }
                else{
                    Categories.set(v.type, [v.name]);
                }
            });
    
            Categories.forEach((commands, type, map) => {
                Message += "#" + type + "\n" + commands.join(", ") + "\n\n";
            });
    
            Message += '```';
    
            message.author.createDM().then(channel => {
                channel.send(Message);
            });
    
            if(message.channel.type !== "dm")
                message.channel.send(language.PrivateMessage.getPrepared('mention', `<@${message.author.id}>`));
        }
    }
};

function PreconditionMet(level, userID, guild){
    return vars.GetLevel(userID, guild) >= level;
}
function Prefix(level){
    if (level == 1){
        return "[Admin] ";
    }
    else if (level == 2){
        return "[Server Owner] ";
    }
    else if (level == 3){
        return "[Global Admin] ";
    }
    else if (level == 4){
        return "[Owner] ";
    }
    else{
        return "";
    }
}

