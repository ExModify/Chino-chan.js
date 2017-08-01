var vars = require('./../global/vars.js');

module.exports = {
    name: 'say',
    aliases: [],
    canPrivate: true,
    requirePrefix: true,
    execute: (bot, message, prefix, command, parameter, language) => {
        if(message.channel.type != "dm")
        {
            if(message.channel.permissionsFor(bot.user).hasPermission("MANAGE_MESSAGES"))
                message.delete();
        }

        if(parameter == "")
        {
            message.author.sendMessage(GetHelp(language, prefix));
            return;
        }
        
        var parameters = parameter.split(' ');

        if(message.channel.type == "dm"){
            if(isNaN(parseInt(parameters[0])))
            {
                message.channel.sendMessage(GetHelp(language, prefix));
            }
            else{
                var ServerID = parameters[0];
                var ChannelID = "";
                if(parameters[1] != undefined)
                    if(!isNaN(parseInt(parameters[1])))
                        ChannelID = parameters[1];

                var Guild = bot.guilds.get(ServerID);
                if(Guild == undefined){
                    message.channel.sendMessage(language.SayWrongServerID.getPrepared("id", ServerID));
                    return;
                }

                if(parameters[1].startsWith('\\'))
                {
                    if(!isNaN(parseInt(parameters[1].substring(1))))
                        parameters[1] = parameters[1].substring(1);
                }

                var skip = 1;
                if(ChannelID != "")
                    skip++;
                else
                    ChannelID = ServerID;
                var Channel = Guild.channels.get(ChannelID);
                if(Channel == undefined){
                    message.channel.sendMessage(language.SayWrongChannelID.getPrepared(["id", "servername"], [ChannelID, Guild.name]));
                    return;
                }

                var UserMessage = parameters.slice(skip).join(' ')
                if(UserMessage.trim() == "")
                {
                    message.channel.sendMessage(language.SayNoMessage);
                    return;
                }

                Channel.sendMessage(UserMessage);
            }
        }
        else{
            var ServerID = "";
            var ChannelID = "";
            
            if(isNaN(parseInt(parameters[0]))){
                if(parameters[0].startsWith('\\'))
                {
                    if(!isNaN(parseInt(parameters[0].substring(1))))
                        parameters[0] = parameters[0].substring(1);
                }

                message.channel.sendMessage(parameters.join(' '));
            }
            else{
                ServerID = parameters[0];
                
                var Guild = bot.guilds.get(ServerID);
                if(Guild == undefined){
                    message.channel.sendMessage(language.SayWrongServerID.getPrepared("id", ServerID));
                    return;
                }
                if(isNaN(parseInt(parameters[1]))){
                    if(parameters[1].startsWith('\\'))
                    {
                        if(!isNaN(parseInt(parameters[1].substring(1))))
                            parameters[1] = parameters[1].substring(1);
                    }
                    ChannelID = ServerID;
                    var Channel = Guild.channels.get(ChannelID);
                    Channel.sendMessage(parameters.slice(1).join(' '));
                }
                else{
                    ChannelID = parameters[1];
                    var Channel = Guild.channels.get(ChannelID);
                    if(Channel == undefined)
                    {
                        message.channel.sendMessage(language.SayWrongChannelID.getPrepared(["id", "servername"], [ChannelID, Guild.name]));
                        return;
                    }
                    Channel.sendMessage(parameters.slice(2).join(' '));
                }
            }
        }
    }
};

function GetHelp(language, prefix){
    var Message = language.SayHelp.Top + '\n';
    
    var count = 1;
    for(;;){
        var CommandHelp = language.SayHelp['Line' + count];

        if(CommandHelp !== undefined)
            Message += CommandHelp + '\n';
        else
            break;
        
        count++;
    }

    Message += language.SayHelp.Bottom;
    Message = Message.getPrepared(['prefix', 'p'], [prefix, prefix]);
    return Message;
}