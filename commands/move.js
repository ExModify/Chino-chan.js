const Discord = require('discord.js');

module.exports = {
    name: 'move',
    aliases: [],
    canPrivate: false,
    requirePrefix: true,
    execute: (bot, message, prefix, command, parameter, language) => {
        if(message.member.voiceChannel == undefined || message.member.voiceChannel == null){
            message.channel.sendMessage(language.VoiceMoveVoiceNotConnected);
            return;
        }

        var UserNotFound = [];
        var UserMoved = [];

        for(var i = 0; i < message.mentions.users.size; i++){
            var mentionedID = message.mentions.users.array()[i].id;
            bot.fetchUser(mentionedID).then((user) => {
                if(user == undefined || user == null){
                    UserNotFound.push(message.mentions.users.get(mentionedID).username);
                }
                else{
                     message.guild.fetchMember(mentionedID).then((guildmember) => {
                        if(guildmember == undefined || guildmember == null){
                            UserNotFound.push(message.mentions.users.get(mentionedID).username);
                        }
                        else{
                            guildmember.setVoiceChannel(message.member.voiceChannel);
                            UserMoved.push(guildmember.nickname ? guilmember.nickname : guildmember.username);
                        }
                    }).catch((err) => {
                        message.channel.sendMessage(err.toString());
                    });
                }
           }).catch((err) => {
               message.channel.sendMessage(`\`\`\`${err.toString()}\`\`\``);
               UserNotFound.push(mentionedID);
           });
        }

        if(UserNotFound.length > 0){
            message.channel.sendMessage(language.VoiceMoveUserNotFound.getPrepared(['singularplural', 'users'], [UserNotFound.length == 1 ? 'this user' : 'these users', UserNotFound.join(", ")]));
        }
        if(UserMoved.length > 0){
            message.channel.sendMessage(language.VoiceMoveUsersMoved.getPrepared(['singularplural', 'users'], [UserMoved.length == 1 ? 'this user has' : 'these users have', UserMoved.join(", ")]));
        }
    }
};
