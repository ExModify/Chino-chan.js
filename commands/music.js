var musicModule = require('./../modules/musicModule.js');

module.exports = {
    name: 'music',
    aliases: [],
    canPrivate: false,
    requirePrefix: true,
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
        var link = "";

        var property = parameters[0];
        var option = parameters.slice(1).join(" ");

        if(property == "connect"){
            var channelID;
            if(isNaN(parseInt(option))){
                message.guild.channels.findAll("type", "voice").forEach(t => {
                    if(t.name.toLowerCase() == option.toLowerCase()){
                        channelID = t.id;
                    }
                });
            }
            else{
                channelID = option;
            }
            musicModule.connect(bot, message.guild.id, message.member.id, channelID).then(connection => {
                if(connection == undefined || connection == null){
                    message.channel.sendMessage(language.MusicCantConnect);
                }
                else{
                    message.channel.sendMessage(language.MusicConnected.getPrepared("channel", connection.channel.name));
                }
            });
        }
        else if (property == "play"){
            musicModule.play(bot, message.guild.id, message.channel.id, message.author.id, prefix, option, language);
        }
        else if (property == "disconnect"){
            if(message.guild.voiceConnection != undefined || message.guild.voiceConnection != null){
                message.guild.voiceConnection.disconnect();
                message.channel.sendMessage(language.MusicDisconnected);
            }
        }
    }
};