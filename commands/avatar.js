var Discord = require('discord.js');

module.exports = {
    name: 'avatar',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 0,
    execute: (bot, message, prefix, command, parameter, language) => {
        if(parameter != ""){
            var check = parameter.toLowerCase();

            var Names = [];
            var Avatars = [];
            var HasNoAvatar = [];

            if (message.guild){ // Username and Nickname <- Guild
                message.guild.members.forEach((v, i, a) => {
                    if(v.user.username.toLowerCase() == check || v.displayName.toLowerCase() == check){
                        if(v.user.avatarURL){
                            Names.push(v.displayName);
                            Avatars.push(v.user.avatarURL);
                        }
                        else{
                            HasNoAvatar.push(v.displayName);
                        }
                    }
                });
            }
            else{ // Username <- DM
                bot.users.forEach((v, i, a) => {
                    if(v.username.toLowerCase() == check){
                        if(v.avatarURL){
                            Names.push(v.username);
                            Avatars.push(v.avatarURL);
                        }
                        else{
                            HasNoAvatar.push(v.username);
                        }
                    }
                });
            }

            if (Names.length == 0){
                message.channel.send(language.AvatarUserNotFound.getPrepared('name', parameter));
            }
            else{
                if (Names.length <= 2){
                    var embed = new Discord.RichEmbed();
                    embed.setColor(0 << 16 | 255 << 8 | 255);
                    Names.forEach((v, i, a) => {
                        embed.setAuthor(v, Avatars[i], Avatars[i]);
                        embed.setDescription(language.AvatarDescription);
                        message.channel.send({embed:embed});
                    });
                }
                else{
                    var Message = "";
                    for(var i = 0; i < Names.length; i++){
                        Message += Names[i] + " - [link](" + Avatars[i] + ")\n";
                    }
                    if(Message != ""){
                        var embed = new Discord.RichEmbed();
                        embed.setColor(0 << 16 | 255 << 8 | 255);
                        embed.setTitle("Avatars");
                        embed.setDescription(Message);
                        message.channel.send({embed:embed});
                    }
                }
                if(HasNoAvatar.length > 0){
                    message.channel.send(AvatarHasNoAvatar.getPrepared("names", HasNoAvatar.join(", ")));
                }
            }
        }
        else{
            var Message = language.AvatarHelp.Top + '\n';
            
            var count = 1;
            for(;;){
                var CommandHelp = language.AvatarHelp['Command' + count];
        
                if(CommandHelp !== undefined)
                    Message += CommandHelp + '\n';
                else
                    break;
                
                count++;
            }
        
            Message += language.AvatarHelp.Bottom;
            Message = Message.getPrepared(['prefix', 'p'], [prefix, prefix]);
        
            message.channel.send(Message);
        }
    }
};