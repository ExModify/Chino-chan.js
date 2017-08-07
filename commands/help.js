const fs = require('fs');
var rerequire = require('./../modules/rerequire.js');
var vars = require('./../global/vars.js');

module.exports = {
    name: 'help',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 0,
    execute: (bot, message, prefix, command, parameter, language) => {
        var Message = '```css\n';

        var MaxLength = 0;

        var UserCommandNames = [];
        var AdminCommandNames = [];
        var GlobalAdminCommandNames = [];
        var OwnerCommandNames = [];
        
        var UserCommandHelps = [];
        var AdminCommandHelps = [];
        var GlobalAdminCommandHelps = [];
        var OwnerCommandHelps = [];

        var Files = fs.readdirSync('./commands');
        Files.forEach((v, i, n) => {
            var Module = rerequire('./commands/' + v);
            if(PreconditionMet(message, Module.minimumLevel)){
                switch(Module.minimumLevel){
                    case 1:
                    AdminCommandNames.push(Module.name);
                    AdminCommandHelps.push(language.CommandHelp[Module.name]);
                    break;
                    case 2:
                    GlobalAdminCommandNames.push(Module.name);
                    GlobalAdminCommandHelps.push(language.CommandHelp[Module.name]);
                    break;
                    case 3:
                    OwnerCommandNames.push(Module.name);
                    OwnerCommandHelps.push(language.CommandHelp[Module.name]);
                    break;
                    default:
                    UserCommandNames.push(Module.name);
                    UserCommandHelps.push(language.CommandHelp[Module.name]);
                    break;
                }
    
                if(Module.name.length > MaxLength)
                {
                    MaxLength = Module.name.length;
                }
            }
        });

        if(UserCommandNames.length > 0){
            Message += "[User Commands]\n";
            for(var i = 0; i < UserCommandNames.length; i++){
                var Name = UserCommandNames[i];
                var Help = UserCommandHelps[i];
                
                var Difference = MaxLength - Name.length;
                for(var j = 0; j < Difference; j++){
                    Name += " ";
                }
    
                Message += (Name + " - " + Help + "\n");
            }
        }
        if(AdminCommandNames.length > 0){
            Message += "\n[Administrator Commands]\n";
            for(var i = 0; i < AdminCommandNames.length; i++){
                var Name = AdminCommandNames[i];
                var Help = AdminCommandHelps[i];
                
                var Difference = MaxLength - Name.length;
                for(var j = 0; j < Difference; j++){
                    Name += " ";
                }
    
                Message += (Name + " - " + Help + "\n");
            }
        }
        if(GlobalAdminCommandNames.length > 0){
            Message += "\n[Global Administrator Commands]\n";
            for(var i = 0; i < GlobalAdminCommandNames.length; i++){
                var Name = GlobalAdminCommandNames[i];
                var Help = GlobalAdminCommandHelps[i];
                
                var Difference = MaxLength - Name.length;
                for(var j = 0; j < Difference; j++){
                    Name += " ";
                }
    
                Message += (Name + " - " + Help + "\n");
            }
        }
        if(OwnerCommandNames.length > 0){
            Message += "\n[Owner Commands]\n";
            for(var i = 0; i < OwnerCommandNames.length; i++){
                var Name = OwnerCommandNames[i];
                var Help = OwnerCommandHelps[i];
                
                var Difference = MaxLength - Name.length;
                for(var j = 0; j < Difference; j++){
                    Name += " ";
                }
    
                Message += (Name + " - " + Help + "\n");
            }
        }

        Message += '```';

        message.author.createDM().then(channel => {
            channel.sendMessage(Message);
        });

        if(message.channel.type !== "dm")
            message.channel.sendMessage(language.PrivateMessage.getPrepared('mention', `<@${message.author.id}>`));
    }
};

function PreconditionMet(message, level){
    if(level == 0){
        return true;
    }
    else if (vars.IsOwner(message.author.id)){
        return true;
    }
    else{
        if(level == 1){
            return vars.HasAdmin(message.guild == undefined ? message.channel.id : message.guild.id, message.author.id);
        }
        else if (level == 2){
            return vars.IsGlobalAdmin(message.author.id);
        }
        else if (level == 3){
            return vars.IsOwner(message.author.id);
        }
        else{
            return true;
        }
    }
}

