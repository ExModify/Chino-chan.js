var musicModule = require('./../modules/musicModule.js');
var vars = require('./../global/vars.js');

module.exports = {
    name: 'music',
    aliases: [],
    canPrivate: false,
    requirePrefix: true,
    execute: (bot, message, prefix, command, parameter, language) => {
        if(parameter == ""){
            sendMusicHelp(language, message, prefix);
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
        else if (property == "disconnect"){
            if(message.guild.voiceConnection != undefined || message.guild.voiceConnection != null){
                if(vars.Streams.has(message.guild.id)){
                    vars.Streams.get(message.guild.id).end();
                    vars.Streams.set(message.guild.id, undefined);
                }
                message.guild.voiceConnection.disconnect();
                message.channel.sendMessage(language.MusicDisconnected);
            }
            else{
                message.channel.sendMessage(language.MusicLeftAlready);
            }
        }
        else if (property == "play"){
            musicModule.play(bot, message.guild.id, message.channel.id, message.author.id, prefix, option, language);
        }
        else if (property == "stop"){
            musicModule.stop(message.guild.id, message.channel, language);
        }
        else if (property == "volume"){
            if(option.trim() == "")
            {
                message.channel.sendMessage(language.MusicCurrentVolume.getPrepared('volume', vars.Settings(message.guild.id).Volume));
            }
            else{
                var number = parseFloat(option);
                if(isNaN(number)){
                    message.channel.sendMessage(language.MusicVolumeOnlyNumber);
                }
                else{
                    musicModule.setVolume(bot, message.guild.id, message.channel.id, number, language);
                }
            }
        }
        else{
            sendMusicHelp(language, message, prefix);
        }
    }
};
function sendMusicHelp(language, message, prefix){
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
}