module.exports = {
    name: 'voiceinvite',
    aliases: [],
    canPrivate: false,
    requirePrefix: true,
    execute: (bot, message, prefix, command, parameter, language) => {
        if(message.member.voiceChannel == undefined || message.member.voiceChannel == null){
            message.channel.sendMessage(language.VoiceNotConnected);
        }else{
            message.member.voiceChannel.createInvite({temporary: true}).then(invite => {
                message.channel.sendMessage(invite.toString());
            });
        }
    }
};
