module.exports = {
    name: 'help',
    aliases: [],
    execute: (bot, message, prefix, command, parameter, language) => {
        var Message = language.Help.Top + '\n';
        
        var count = 1;
        for(;;){
            var CommandHelp = language.Help['Command' + count];

            if(CommandHelp !== undefined)
                Message += CommandHelp + '\n';
            else
                break;
            
            count++;
        }

        Message += language.Help.Bottom;
        Message = Message.getPrepared(['prefix', 'p'], [prefix, prefix]);

        message.author.sendMessage(Message);
        
        if(message.channel.type !== "dm")
            message.channel.sendMessage(language.PrivateMessage.getPrepared('mention', `<@${message.author.id}>`));
    }
};