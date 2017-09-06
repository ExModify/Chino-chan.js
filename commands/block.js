var vars = require('./../global/vars.js');

module.exports = {
    name: 'block',
    canPrivate: false,
    requirePrefix: true,
    minimumLevel: 1,
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
    if (vars.IsBlockedGuild(userID, guildID)){
        channel.send(language.AlreadyBlocked.getPrepared('name', displayName));
    }
    else if (vars.IsGloballyBlocked(userID)){
        channel.send(language.AlreadyBlockedGlobally.getPrepared('name', displayName));
    }
    else{
        vars.AddBlocked(userID, guildID);
        channel.send(language.BlockUserAdded.getPrepared('name', displayName));
    }
}
function removeBlock(userID, displayName, guildID, channel, language){
    if (!vars.IsBlocked(userID, guildID)){
        channel.send(language.BlockUserNotBlocked.getPrepared('name', displayName));
    }
    else if (vars.IsGloballyBlocked(userID)){
        channel.send(language.BlockUserCannotRemove.getPrepared('name', displayName));
    }
    else{
        vars.RemoveBlocked(userID, guildID);
        channel.send(language.BlockUserRemoved.getPrepared('name', displayName));
    }
}

function sendBlockHelp(channel, language, prefix){
    var Message = language.BlockHelp.Top + '\n';
    
    var count = 1;
    for(;;){
        var CommandHelp = language.BlockHelp['Command' + count];

        if(CommandHelp !== undefined)
            Message += CommandHelp + '\n';
        else
            break;
        
        count++;
    }

    Message += language.BlockHelp.Bottom;
    Message = Message.getPrepared(['prefix', 'p'], [prefix, prefix]);

    channel.send(Message);
}