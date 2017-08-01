var vars = require('./../global/vars.js');

module.exports = {
    name: 'admin',
    canPrivate: true,
    requirePrefix: true,
    aliases: [],
    execute: (bot, message, prefix, command, parameter, language) => {
        if(parameter === "" || parameter.split(" ")[0].toLowerCase() == "help"){
            var admins = [];
            vars.Admins.forEach((id, index, array) => {
                admins.push(bot.users.get(id).username);
            });
            var Message = "```css\n"
            Message += language.Admins.getPrepared("names", admins.join(", "));
            if(vars.Admins.indexOf(message.author.id) >= 0){
                Message += "\n\n" + language.AdminHelp.getPrepared(['p', 'prefix'], [prefix, prefix]);
            }
            Message += "```";
            message.channel.sendMessage(Message);
        }
        else{
            if(vars.Admins.indexOf(message.author.id) >= 0){
                var parameters = parameter.split(' ');
                parameters[0] = parameters[0].toLowerCase();

                if(parameters[0] == "add"){
                    var Ids = parameters.slice(1);
                    if(Ids.length == 0){
                        message.channel.sendMessage(language.AdminIdentify);
                    }
                    else{
                        var validNames = [];
                        var invalidIDs = [];
                        var alreadyIn = [];

                        Ids.forEach((id, index, array) => {
                            var user = bot.users.get(id);

                            if(vars.Admins.indexOf(id) >= 0){
                                alreadyIn.push(user.username);
                            }
                            else if(user == undefined){
                                invalidIDs.push(id);
                            }
                            else{
                                validNames.push(user.username);
                                vars.Admins.push(id);
                            }
                        });
                        var Message = "```css\n";

                        if(alreadyIn.length != 0){
                            Message += "[--Warning--]\n" + language.AdminAlreadyAdded.getPrepared("names", alreadyIn.join(", "));
                        }
                        if(invalidIDs.length != 0){
                            Message += "[--Error--]\n" + language.AdminInvalidID.getPrepared("ids", invalidIDs.join(", "));
                        }
                        if(validNames.length != 0){
                            Message += "[--Success--]\n" + language.AdminAdded.getPrepared("names", validNames.join(", "));
                        }
                        vars.SaveAdmins();
                        Message += "```";
                        message.channel.sendMessage(Message);
                    }
                }
                else if (parameters[0] == "remove"){
                    var Ids = parameters.slice(1);
                    if(Ids.length == 0){
                        message.channel.sendMessage(language.AdminIdentify);
                    }
                    else{
                        var validNames = [];
                        var invalidIDs = [];

                        var TriedToRemoveExModify = false;
                        var TriedToRemoveMeasen = false;
                        var TriedToRemoveSelf = false;

                        Ids.forEach((id, index, array) => {
                            if(vars.Admins.indexOf(id) >= 0)
                            {
                                if(message.author.id == id){
                                    TriedToRemoveSelf = true;
                                }
                                else if(id == "193356184806227969"){
                                    TriedToRemoveExModify = true;
                                }
                                else if (id == "194159784948269056"){
                                    TriedToRemoveMeasen = true;
                                }
                                else{
                                    vars.Admins.splice(vars.Admins.indexOf(id), 1);
                                    validNames.push(bot.users.get(id).username);
                                }
                            }
                            else{
                                invalidIDs.push(id);
                            }
                        });
                        var Message = "```css\n";
                        if(TriedToRemoveExModify || TriedToRemoveMeasen || TriedToRemoveSelf)
                            Message += "[--Warning--]\n";
                        if(TriedToRemoveSelf){
                            Message += language.AdminSelfRemove + "\n";
                        }
                        if(TriedToRemoveExModify){
                            Message += language.AdminExModifyRemove + "\n";
                        }
                        if (TriedToRemoveMeasen){
                            Message += language.AdminMeasenRemove + "\n";
                        }
                        if(invalidIDs.length != 0){
                            Message += "[--Error--]\n";
                            Message += language.AdminInvalidID.getPrepared("ids", invalidIDs.join(", "));
                        }
                        if(validNames.length != 0){
                            Meassage += "[--Success--]\n";
                            Message += language.AdminRemoved.getPrepared("names", validNames.join(", "));
                        }
                        vars.SaveAdmins();
                        Message += "```";
                        message.channel.sendMessage(Message);
                    }
                }
                else{
                    message.channel.sendMessage(language.AdminBadArguments.getPrepared("p", prefix));
                }
            }
            else{
                message.channel.sendMessage(language.AdminNotAllowed);
            }
        }
    }
};