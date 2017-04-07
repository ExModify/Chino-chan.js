var musicModule = require('./../modules/musicModule.js');

module.exports = {
    name: 'music',
    aliases: [],
    execute: (bot, message, prefix, command, parameter, language) => {
        if(parameter == ""){
            var Message = language.MusicHelp.Top + '\n';
            
            var count = 1;
            for(;;){
                var CommandHelp = language.MusicHelp['Command' + count];

                if(CommandHelp !== undefined)
                    Message += CommandHelp + '\n';
                else
                    break;
                
                count++;
            }

            Message += language.MusicHelp.Bottom;
            Message = Message.getPrepared(['prefix', 'p'], [prefix, prefix]);

            message.channel.sendMessage(Message);
            return;
        }
        var parameters = parameter.split(' ');
        musicModule.singlePlay(bot, message.guild.id, message.channel.id, message.author.id, prefix, parameter, language);
    }
};