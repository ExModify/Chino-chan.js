module.exports = {
    name: 'id',
    aliases: [],
    canPrivate: false,
    requirePrefix: true,
    execute: (bot, message, prefix, command, parameter, language) => {
        var parameters = parameter.split(" ");
        if(message.mentions.users.size == 0){
            if(parameter == ""){
                message.channel.sendMessage(language.IDUsage.getPrepared(["p", "prefix"], [prefix, prefix]));
            }else{
                var UnknownNames = [];
                var SuccessfulNames = [];

                var users = bot.users.array();
                var Message = "```css\n";

                parameters.forEach(name => {
                    var user = users.find((user, index, array) => { if(user.username == name) return user; });
                    if(user != undefined && user != null){
                        SuccessfulNames.push(user.username + " - " + user.id);
                    }
                    else{
                        UnknownNames.push(name);
                    }
                });

                if(UnknownNames.length != 0){
                    Message += language.IDNotInServerOrNotExist.getPrepared(["p", "prefix", "names"], [prefix, prefix, UnknownNames.join(", ")]) + "\n";
                }
                if(SuccessfulNames.length != 0){
                    Message += SuccessfulNames.join("\n") + "\n";
                }

                Message += "```";
                message.channel.sendMessage(Message);
            }
        }
        else{
            var Message = "```css\n";

            message.mentions.users.array().forEach((user, index, array) => {
                Message += user.username + " - " + user.id + "\n";
            });

            Message += "```";
            message.channel.sendMessage(Message);
        }
    }
};