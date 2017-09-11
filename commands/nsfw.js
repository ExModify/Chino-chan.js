var vars = require('./../global/vars.js');
var fs = require('fs');

module.exports = {
    name: 'nsfw',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 0,
    type: "Fun - Image",
    execute: (bot, message, prefix, command, parameter, language) => {
        if (message.guild ? message.guild.id : undefined == "264060704313573377" && message.channel.id != "337985479943258114") // Hardcoded protection
            return;
        if(vars.NSFWCount > 0){
            var parameters = parameter.split(" ");
            if(parameter.trim() === "count"){
                message.channel.send(language.NSFWCount.getPrepared('count', vars.NSFWCount));
            }
            else if (parameters[0].toLowerCase() == "delete" && vars.HasAdmin(message.guild, message.author.id)){
                parameters = parameters.slice(1);
                if(parameters.length == 0){
                    message.channel.send(language.NSFWDelete.getPrepared(["p", "prefix"], [prefix, prefix]));
                }
                else{
                    var FilesNotFound = [];
                    var FilesDeleted = [];
    
                    parameters.forEach((file, index, array) => {
                        if(vars.NSFWExists(file)){
                            vars.NSFWDelete(file);
                            FilesDeleted.push(file);
                        }
                        else{
                            FilesNotFound.push(file);
                        }
                    });
                    var Message = "```css\n";
    
                    if(FilesNotFound.length != 0){
                        Message += language.NSFWNotFound.getPrepared("files", FilesNotFound.join(", "));
                    }
                    if(FilesDeleted.length != 0){
                        Message += language.NSFWDeleted.getPrepared("files", FilesDeleted.join(", "));
                    }
    
                    Message += "```";
    
                    message.channel.send(Message);
                }
            }
            else{
                var Path = vars.NSFWPath + vars.NSFWFiles[Math.floor(Math.random() * (vars.NSFWCount - 1))];
                message.channel.sendImageEmbed(Path, 'NSFW', message.channel);
            }
        }
        else{
            message.channel.send(language.NoNSFWImage);
        }
    }
};