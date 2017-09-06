var vars = require('./../global/vars.js');

module.exports = {
    name: 'blockglobally',
    canPrivate: false,
    requirePrefix: true,
    minimumLevel: 3,
    type: "Management",
    execute: (bot, message, prefix, command, parameter, language) => {
        var parameters = parameter.split(' ');
        if(parameters.length != 2){
            sendBlockHelp(message.channel, language, prefix);
        }
        else {
            var user = parameters[1];
            
            if (parameters[0] == "add"){
                var DiscordUser = message.guild.members.get(user);
                if (DiscordUser) {
                    block(user, DiscordUser.displayName, message.guild.id, message.channel, language);
                }
                else {
                    DiscordUser = message.guild.members.find((v, k, a) => v.displayName == user || v.user.username == user);

                    if (DiscordUser){
                        block(DiscordUser.id, DiscordUser.displayName, message.guild.id, message.channel, language);
                    }
                    else{
                        message.channel.send(language.BlockUserNotFound.getPrepared('name', user));
                    }
                }
            }
            else if (parameters[0] == "remove"){
                var DiscordUser = message.guild.members.get(user);
                if (DiscordUser) {
                    removeBlock(user, DiscordUser.displayName, message.guild.id, message.channel, language);
                }
                else {
                    DiscordUser = message.guild.members.find((v, k, a) => v.displayName == user || v.user.username == user);

                    if (DiscordUser){
                        removeBlock(DiscordUser.id, DiscordUser.displayName, message.guild.id, message.channel, language);
                    }
                    else{
                        message.channel.send(language.BlockUserNotFound.getPrepared('name', user));
                    }
                }
            }
            else{
                sendBlockHelp(message.channel, language, prefix);
            }
        }
    }
};

function block(userID, displayName, guildID, channel, language) {
    if (vars.IsGloballyBlocked(userID)){
        channel.send(language.AlreadyBlockedGlobally.getPrepared('name', displayName));
    }
    else{
        vars.AddGloballyBlocked(userID);
        channel.send(language.BlockUserAddedGlobally.getPrepared('name', displayName));
    }
}
function removeBlock(userID, displayName, guildID, channel, language){
    if (vars.IsGloballyBlocked(guildID)){
        vars.RemoveGloballyBlocked(guildID);
        channel.send(language.BlockUserRemovedGlobally.getPrepared('name', displayName));
    }
    else{
        channel.send(language.BlockUserNotBlockedGlobally.getPrepared('name', displayName));
    }
}

function sendBlockHelp(channel, language, prefix){
    var Message = language.GlobalBlockHelp.Top + '\n';
    
    var count = 1;
    for(;;){
        var CommandHelp = language.GlobalBlockHelp['Command' + count];

        if(CommandHelp !== undefined)
            Message += CommandHelp + '\n';
        else
            break;
        
        count++;
    }

    Message += language.GlobalBlockHelp.Bottom;
    Message = Message.getPrepared(['prefix', 'p'], [prefix, prefix]);

    channel.send(Message);
}