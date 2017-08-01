module.exports = {
    name: 'delete',
    aliases: [],
    canPrivate: false,
    requirePrefix: true,
    execute: (bot, message, prefix, command, parameter, language) => {
        if(message.channel.permissionsFor(message.author).hasPermission("MANAGE_MESSAGES")){
            if(parameter == ""){
                deleteMessages(message, 50, language, false).then(msg => {
                    message.channel.sendMessage(msg);
                });
            }else{
                var Input = parseInt(parameter);
                if(isNaN(Input)){
                    message.channel.sendMessage(language.MessageDeleteWrongProperty);
                }
                else{
                    if(Input > 50 || Input < 1)
                    {
                        message.channel.sendMessage(language.MessageDeleteWrongProperty);
                    }
                    else
                    {
                        deleteMessages(message, Input + 1, language, true).then(msg => {
                            message.channel.sendMessage(msg);
                        });
                    }
                }
            }
        }
        else{
            message.channel.sendMessage(language.MessageDeleteNoPermission);
        }
    }
};

function deleteMessages(message, count, language, decrease){
    return new Promise((resolve, reject) => {
        message.channel.bulkDelete(count).then(() => {
            resolve(language.MessageDeleted.getPrepared("count", decrease ? count - 1 : count))
        });
    });
}