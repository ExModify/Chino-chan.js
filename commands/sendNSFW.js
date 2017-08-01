var vars = require('./../global/vars.js');
var fs = require('fs');

module.exports = {
    name: 'nsfw',
    aliases: [],
    canPrivate: true,
    requirePrefix: true,
    execute: (bot, message, prefix, command, parameter, language) => {
        var parameters = parameter.split(" ");
        if(parameter === "count"){
            message.channel.sendMessage(language.NSFWCount.getPrepared('count', vars.NSFWCount));
        }
        else if (parameters[0].toLowerCase() == "delete" && vars.Admins.indexOf(message.author.id) >= 0){
            parameters = parameters.slice(1);
            if(parameters.length == 0){
                message.channel.sendMessage(language.NSFWDelete.getPrepared(["p", "prefix"], [prefix, prefix]));
            }
            else{
                var FilesNotFound = [];
                var FilesDeleted = [];

                parameters.forEach((file, index, array) => {
                    if(fs.existsSync(vars.NSFWPath + file)){
                        fs.unlinkSync(vars.NSFWPath + file);
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

                message.channel.sendMessage(Message);
            }
        }
        else{
            message.channel.sendFile(vars.NSFWPath + vars.NSFWFiles[Math.floor(Math.random() * vars.NSFWCount)]);
        }
    }
};