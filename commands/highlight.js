const Discord = require('discord.js');

module.exports = {
    name: 'highlight',
    canPrivate: false,
    requirePrefix: true,
    aliases: [],
    execute: (bot, message, prefix, command, parameter, language, uptime) => {
        parameter = parameter.trim();
        if(parameter != "" && isNaN(parseInt(parameter))){
            var User = message.guild.members.find((v, i, a) => {
                return v.displayName == parameter || v.user.username == parameter;
            });
            if(User == undefined){
                message.channel.sendMessage(language.HighlightUnknownUser.getPrepared("name", parameter));
            }
            else{
                LastHightlight(User, message.channel).then(Embed => {
                    if(Embed == undefined){
                        message.channel.sendMessage(language.HighlightNoMessage.getPrepared("name", User.displayName))
                    }
                    else{
                        message.channel.sendEmbed(Embed);
                    }
                    
                });
            }
        }
        else if (parameter != ""){
            message.channel.fetchMessage(parameter).then(Message => {
                message.channel.sendEmbed(CreateEmbed(Message.member, Message));
            }).catch((reject) => {
                message.channel.sendMessage(language.HighlightUnknownMessageID.getPrepared("id", parameter));
            });
        }
        else{
            message.channel.sendMessage(GenerateHelp(prefix, language));
        }
    }
};

function GenerateHelp(prefix, language){
    var Message = language.HighlightHelp.Top + '\n';
    
    var count = 1;
    for(;;){
        var CommandHelp = language.HighlightHelp['Line' + count];

        if(CommandHelp !== undefined)
            Message += CommandHelp + '\n';
        else
            break;
        
        count++;
    }

    Message += language.HighlightHelp.Bottom;
    Message = Message.getPrepared(['prefix', 'p'], [prefix, prefix]);

    return Message;
}
function SplitAtLast(text, character){
    var Base = [];
    var LastIndex = text.lastIndexOf(character);
    Base.push(text.substring(0, LastIndex));
    Base.push(text.substring(LastIndex));
    return Base;
}
function LastHightlight(member, channel){
    return new Promise((resolve, reject) => {
        MessageRec(member, channel, 50, channel.lastMessageID, resolve);
    });
}
function MessageRec(member, channel, count, lastID, resolve){
    channel.fetchMessages({limit: count, before: lastID}).then(MessageCollection => {
        var Message = MessageCollection.find((v, k, n) => {
            return v.author.id == member.id;
        });
        if(Message == undefined){
            if(MessageCollection.size < count){
                resolve(undefined);
            }
            else{
                MessageRec(member, channel, count, MessageCollection.array()[MessageCollection.size - 1].id, resolve);
            }
        }
        else{
            resolve(CreateEmbed(member, Message));
        }
    });
}
function CreateEmbed(member, Message){
    var Embed = new Discord.RichEmbed();
    Embed.setAuthor(member.displayName, Message.author.avatarURL);
    Embed.setColor(member.highestRole.color);
    Embed.setDescription(Message.content);
    Embed.setFooter("In: " + Message.channel.name + " At: " + Message.createdAt.toISOString().substring(0, 10));
    return Embed;
}