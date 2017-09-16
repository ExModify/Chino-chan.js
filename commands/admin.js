var vars = require('./../global/vars.js');
var Random = require('random-js');
var random = new Random(Random.engines.mt19937().autoSeed());

module.exports = {
    name: 'admin',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 0,
    type: "Management",
    execute: (bot, message, prefix, command, parameter, language) => {
        if(parameter === "" || parameter.split(" ")[0].toLowerCase() == "help"){
            var admins = vars.GetAdminNames(bot, message.guild.id);
            var Message = "```css\n"
            Message += language.Admins.getPrepared("names", admins.join(", "));
            if(vars.IsGlobalAdmin(message.author.id)
            || vars.IsOwner(message.author.id)){
                Message += "\n\n" + language.AdminHelp.getPrepared(['p', 'prefix'], [prefix, prefix]);
            }
            Message += "```";
            message.channel.send(Message);
        }
        else{
            var parameters = parameter.split(' ');
            parameters[0] = parameters[0].toLowerCase();

            if(message.channel.type == "dm" 
                && !vars.IsOwner(message.author.id) 
                && (!parameter[0] != "addglobal" || !parameter[0] != "remove")){
                message.channel.send(Language.DMTriedExecute);
                return;
            }
            if(vars.IsGlobalAdmin(message.author.id)
                || vars.IsOwner(message.author.id) 
                || (message.guild == null ? false : message.ownerID == message.author.id)){
                
                if(parameters[0] == "add"){
                    var Ids = parameters.slice(1);
                    if(Ids.length == 0){
                        message.channel.send(language.AdminIdentify);
                    }
                    else{
                        var validNames = [];
                        var invalidIDs = [];
                        var alreadyIn = [];

                        Ids.forEach((id, index, array) => {
                            var user = bot.users.get(id);
                            if (!user){
                                user = bot.users.find((v, i, a) => v.username == id);
                            }

                            if(vars.HasAdmin(message.guild, id)){
                                alreadyIn.push(user.username);
                            }
                            else if(user == undefined){
                                invalidIDs.push(id);
                            }
                            else{
                                validNames.push(user.username);
                                var pw = "";
                                if(vars.HasAnyAdmin(user.id)){
                                    pw = vars.GetLoginCredentials(user.id).password;
                                }
                                else{
                                    pw = generatePassword();
                                }
                                vars.AddAdmin(message.guild.id, user.id, pw);
                                user.createDM().then(channel => {
                                    channel.send(language.AdminCredentials.getPrepared(['username', 'password'], [user.id, pw]));
                                });
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
                        Message += "```";
                        message.channel.send(Message);
                    }
                }
                else if (parameters[0] == "remove"){
                    var Ids = parameters.slice(1);
                    if(Ids.length == 0){
                        message.channel.send(language.AdminIdentify);
                    }
                    else{
                        var validNames = [];
                        var invalidIDs = [];

                        var TriedToRemoveExModify = false;
                        var TriedToRemoveGlobalAdmin = false;
                        var TriedToRemoveSelf = false;

                        Ids.forEach((id, index, array) => {
                            var userid = id;
                            var user = bot.users.find((v, i, a) => v.username == id);
                            if (user){
                                if (!bot.users.get(id))
                                    userid = user.id;
                            }
                            if(vars.HasAdmin(message.guild, userid))
                            {
                                if(message.author.id == userid){
                                    TriedToRemoveSelf = true;
                                }
                                else if(vars.IsOwner(userid)){
                                    TriedToRemoveExModify = true;
                                }
                                else if (vars.IsGlobalAdmin(userid) && !vars.IsOwner(message.author.id)){
                                    TriedToRemoveGlobalAdmin = true;
                                }
                                else{
                                    vars.RemoveAdmin(message.guild.id, userid);
                                    validNames.push(bot.users.get(userid).username);
                                }
                            }
                            else{
                                invalidIDs.push(userid);
                            }
                        });
                        var Message = "```css\n";
                        if(TriedToRemoveExModify || TriedToRemoveGlobalAdmin || TriedToRemoveSelf)
                            Message += "[--Warning--]\n";
                        if(TriedToRemoveSelf){
                            Message += language.AdminSelfRemove + "\n";
                        }
                        if(TriedToRemoveExModify){
                            Message += language.AdminExModifyRemove + "\n";
                        }
                        if (TriedToRemoveGlobalAdmin){
                            Message += language.AdminMeasenRemove + "\n";
                        }
                        if(invalidIDs.length != 0){
                            Message += "[--Error--]\n";
                            Message += language.AdminInvalidID.getPrepared("ids", invalidIDs.join(", "));
                        }
                        if(validNames.length != 0){
                            Message += "[--Success--]\n";
                            Message += language.AdminRemoved.getPrepared("names", validNames.join(", "));
                        }
                        Message += "```";
                        message.channel.sendMessage(Message);
                    }
                }
                else if (parameters[0] == "addglobal"){
                    if(vars.IsOwner(message.author.id)){
                        var Ids = parameters.slice(1);
                        if(Ids.length == 0){
                            message.channel.send(language.AdminIdentify);
                        }
                        else{
                            var validNames = [];
                            var invalidIDs = [];
                            var alreadyIn = [];
    
                            Ids.forEach((id, index, array) => {
                                var user = bot.users.get(id);

                                if (!user){
                                    user = bot.users.find((v, i, a) => v.username == id);
                                }
    
                                if(vars.IsGlobalAdmin(id)){
                                    alreadyIn.push(user.username);
                                }
                                else if(user == undefined){
                                    invalidIDs.push(id);
                                }
                                else{
                                    validNames.push(user.username);
                                    var pw = "";
                                    if(vars.HasAnyAdmin(id)){
                                        pw = vars.GetLoginCredentials(id).password;
                                    }
                                    else{
                                        pw = generatePassword();
                                    }
                                    vars.AddGlobalAdmin(id, pw);
                                    user.createDM().then(channel => {
                                        channel.send(language.AdminCredentials.getPrepared(['username', 'password'], [id, pw]));
                                    });
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
                            Message += "```";
                            message.channel.send(Message);
                        }
                    }
                }
                else{
                    message.channel.send(language.AdminBadArguments.getPrepared("p", prefix));
                }
            }
            else{
                message.channel.send(language.AdminNotAllowed);
            }
        }
    }
};

function generatePassword(){
    var numCount = random.integer(0, 5);
    var pass = "";
    for(var i = 0; i < 10; i++){
        var which = random.bool();
        if(which && numCount != 0) {
            pass += vars.Numbers[random.integer(0, 10)];
            numCount--;
        }
        else {
            pass += vars.Characters[random.integer(0, 26)];
        }
    }
    return pass;
}