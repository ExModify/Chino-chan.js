const Discord = require('discord.js');
var extensions = [
    'gif',
    'png',
    'jpg',
    'webp'
];

module.exports = {
    name: 'highlight',
    canPrivate: false,
    requirePrefix: true,
    minimumLevel: 0,
    type: "Fun",
    execute: (bot, message, prefix, command, parameter, language) => {
        parameter = parameter.trim();
        if(parameter != "" && isNaN(parseInt(parameter))){
            var User = message.guild.members.find((v, i, a) => {
                return v.displayName == parameter || v.user.username == parameter;
            });
            if(User == undefined){
                message.channel.send(language.HighlightUnknownUser.getPrepared("name", parameter));
            }
            else{
                LastHightlight(User, message.channel, language).then(Embed => {
                    if(Embed == undefined){
                        message.channel.send(language.HighlightNoMessage.getPrepared("name", User.displayName))
                    }
                    else{
                        message.channel.send({embed:Embed});
                    }
                    
                });
            }
        }
        else if (parameter != ""){
            message.channel.fetchMessage(parameter).then(fetchedMessage => {
                var embed = CreateEmbed(fetchedMessage.member, fetchedMessage, language);
                message.channel.send({embed:embed});
            }).catch((reject) => {
                message.channel.send(language.HighlightUnknownMessageID.getPrepared("id", parameter));
            });
        }
        else{
            message.channel.send(GenerateHelp(prefix, language));
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
function LastHightlight(member, channel, language){
    return new Promise((resolve, reject) => {
        MessageRec(member, channel, 50, channel.lastMessageID, resolve, language);
    });
}
function MessageRec(member, channel, count, lastID, resolve, language){
    channel.fetchMessages({limit: count, before: lastID}).then(MessageCollection => {
        var Message = MessageCollection.find((v, k, n) => {
            return v.author.id == member.id;
        });
        if(Message == undefined){
            if(MessageCollection.size < count){
                resolve(undefined);
            }
            else{
                MessageRec(member, channel, count, MessageCollection.array()[MessageCollection.size - 1].id, resolve, language);
            }
        }
        else{
            resolve(CreateEmbed(member, Message, language));
        }
    });
}
function CreateEmbed(member, Message, language){
    var Embed = new Discord.RichEmbed();
    Embed.setAuthor(member.displayName, Message.author.avatarURL);
    Embed.setColor(member.highestRole.color);
    Embed.setDescription(Message.content);
    Message.embeds.forEach((v, i, a) => {
        if (Embed.description.trim() != "")
            Embed.description += "\n\n";

        var attachURL = "";

        if (Embed.image == undefined || Embed.image.url.trim() == ""){
            if (v.image != undefined && v.image.url.trim() != ""){
                Embed.setImage(v.image.url);
            }
        }
        if (Embed.thumbnail == undefined || Embed.thumbnail.url.trim() == ""){
            if (v.thumbnail != undefined && v.thumbnail.url.trim() != ""){
                Embed.setThumbnail(v.thumbnail.url);
            }
        }
        if (Embed.file == undefined || Embed.file.attachment.trim() == ""){
            if (v.file != undefined && v.file.attachment.trim() != ""){
                Embed.attachFile(v.file);
            }
        }
        if (Embed.url == undefined || Embed.url.trim() == ""){
            if (v.url != undefined && v.url.trim() != ""){
                attachURL = v.url;
            }
        }

        v.fields.forEach((val, ind, arr) => {
            Embed.addField(val.name, val.value, val.inline);
        });
        

        if (v.title != undefined || v.description != undefined) {
            let first = "";
            let second = "";
            let third = "";
    
            if (v.title && v.title.trim() != "")
                first = `\n${language.HighlightTitle}: ` + (attachURL == "" ? v.title : `[${v.title}](${attachURL})`);
    
            if (v.description && v.description.trim() != "")
                second = `\n${language.HighlightDescription}: ` + v.description;

            if (v.footer.text && v.footer.text.trim() != "")
                third = `\n${language.HighlightFooter}: ` + v.footer.text;

            if (Message.embeds.length == 1)
                Embed.description += first + second + third;
            else
                Embed.description += `#${i} ${language.HighlightEmbed}:${first}${second}${third}`;
        }
    });
    Message.attachments.forEach((v, i, a) => {
        if (Embed.image == undefined || Embed.image.url.trim() == ""){
            var extension = v.filename.substring(v.filename.lastIndexOf('.') + 1).trim();
            if (extensions.indexOf(extension) >= 0){
                Embed.setImage(v.url);
                return;
            }
        }
        if (Embed.description.trim() != "")
            Embed.description += "\n";

        Embed.description += `[${v.filename}](${v.url})`;
    });
    var date = formDate(Message.createdAt);
    Embed.setFooter("in #" + Message.channel.name + " at: " + date);
    return Embed;
}
function formDate(date){
    var year = date.getFullYear();
    var month = format(date.getMonth() + 1);
    var day = format(date.getDate());

    var hours = format(date.getHours());
    var mins = format(date.getMinutes());
    var secs = format(date.getSeconds());

    return `${year}/${month}/${day} ${hours}:${mins}:${secs}`;
}
function format(number){
    var num = parseInt(number);
    if (num < 10)
        return "0" + num;
    return num;
}