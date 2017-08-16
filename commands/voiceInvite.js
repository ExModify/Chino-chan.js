module.exports = {
    name: 'voiceinvite',
    canPrivate: false,
    requirePrefix: true,
    minimumLevel: 0,
    type: "Information",
    execute: (bot, message, prefix, command, parameter, language) => {
        if(message.member.voiceChannel == undefined || message.member.voiceChannel == null){
            message.channel.send(language.VoiceNotConnected);
        }else{
            message.member.voiceChannel.createInvite({temporary: true}).then(invite => {
                message.channel.send(invite.toString());
            });
        }
    }
};
