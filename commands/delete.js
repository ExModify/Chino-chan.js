var vars = require('./../global/vars.js');
const event = require('events');

var delEvent = new event.EventEmitter();

module.exports = {
    name: 'delete',
    canPrivate: false,
    requirePrefix: true,
    minimumLevel: 1,
    type: "Management",
    execute: (bot, message, prefix, command, parameter, language) => {
        if(vars.HasAdmin(message.guild, message.author.id)){
            var sendNotify = true;
            var parameters = parameter.split(' ');
            var selfRemove = true;

            let count;
            let ids = [];

            parameters.forEach((v, i, a) => {
                var lower = v.toLowerCase();
                if(lower.startsWith('notify:')){
                    if(v.length > 7){
                        var result = lower.split(':')[1];
                        if(result == "false" || result == "no")
                            sendNotify = false;
                    }
                }
                else if (lower.startsWith('count:')){
                    if(v.length > 6){
                        var result = v.split(':')[1];
                        var resultParsed = parseInt(result);
                        if(!isNaN(resultParsed)){
                            if(count == undefined){
                                count = resultParsed;
                            }
                            else if (count < 1 || count > 50){
                                if(resultParsed > 0 || resultParsed < 51){
                                    count = resultParsed;
                                }
                            }
                        }
                    }
                    if(count == undefined)
                        count = parseInt(v);
                }
                else if (lower.startsWith('ids:')){
                    if(v.length > 4){
                        var paramids = v.split(':')[1].split(',');
                        ids = paramids;
                    }
                }
                else if (lower.startsWith('selfRemove:')){
                    if(lower.length > 11){
                        var result = lower.split(':')[1];
                        if(result == "false" || result == "no")
                            selfRemove = false;
                    }
                }

            });
            if(selfRemove)
                message.delete();

            if(ids.length > 0)
            {
                deleteRecursive(message.channel, ids).then((DeletedIDs, NotFoundIDs) => {
                    if(sendNotify){
                        var Message = "```css\n";
                        if(DeletedIDs != undefined){
                            if (DeletedIDs.length > 0)
                                Message += language.MessageIDsDeleted.getPrepared('ids', '[' + DeletedIDs.join(', ') + ']');
                        }
                        if(NotFoundIDs != undefined){
                            if(NotFoundIDs.length > 0){
                                if(DeletedIDs.length > 0)
                                    Message += "\n";
                                Message += language.MessageIDsNotFound.getPrepared('ids', '[' + NotFoundIDs.join(', ') + ']');
                            }
                        }
                        Message += "```";
                        message.channel.send(Message);
                    }
                });
            }
            if(count == undefined && ids.length == 0){
                sendDeleteHelp(language, message, prefix);
            }
            else{
                if(count == undefined)
                    return;

                if(count > 50 || count < 1)
                {
                    message.channel.sendMessage(language.MessageDeleteWrongProperty);
                }
                else
                {
                    deleteMessages(message, count, language, true).then(msg => {
                        if(sendNotify)
                            message.channel.sendMessage(msg);
                    });
                }
            }
        }
        else{
            message.channel.send(language.MessageDeleteNoPermission);
        }
    }
};

function sendDeleteHelp(language, message, prefix){
    var Message = language.MessageDeleteHelp.Top + '\n';
    
    var count = 1;
    for(;;){
        var CommandHelp = language.MessageDeleteHelp['Command' + count];

        if(CommandHelp !== undefined)
            Message += CommandHelp.getPrepared(['prefix', 'p'], [prefix, prefix]) + '\n';
        else
            break;
        
        count++;
    }

    Message += language.MessageDeleteHelp.Bottom;
    Message = Message.getPrepared(['prefix', 'p'], [prefix, prefix]);

    message.channel.send(Message);
}

function deleteMessages(message, count, language, decrease){
    return new Promise((resolve, reject) => {
        message.channel.bulkDelete(count).then(() => {
            resolve(language.MessageDeleted.getPrepared("count", decrease ? count - 1 : count))
        });
    });
}

function deleteRecursive(channel, ids){
    return new Promise((resolve, reject) => {
        deleteRecursiveInside(channel, 0, ids, [], [], resolve);
    });
}
function deleteRecursiveInside(channel, index, ids, deletedids, notfoundids, resolve){
    channel.fetchMessage(ids[index]).then(Message => {
        if(Message == undefined){
            notfoundids.push(ids[index]);
        }
        else{
            Message.delete();
            deletedids.push(ids[index]);
        }
        if(ids.length - 1 == index)
            resolve(deletedids, notfoundids);
        else
            deleteRecursiveInside(channel, index + 1, ids, deletedids, notfoundids, resolve);
    });
}