var vars = require('./../global/vars.js');
const event = require('events');

var delEvent = new event.EventEmitter();

module.exports = {
    name: 'delete',
    canPrivate: false,
    requirePrefix: true,
    minimumLevel: 1,
    execute: (bot, message, prefix, command, parameter, language) => {
        if(vars.HasAdmin(message.guild, message.author.id)){
            if(parameter == ""){
                deleteMessages(message, 50, language, false).then(msg => {
                    if(sendNotify)
                        message.channel.sendMessage(msg);
                });
            }else{
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
                            let paramids = v.split(':', 2)[1].split(',');
                            ids.push(paramids);
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
                    var notfound = [];
                    var deleted = [];

                    if(sendNotify){
                        delEvent.on('newDeleted', () => {
                            if(notfound.length + deleted.length == ids.length){
                                var Message = "```css\n";
                                if(deleted.length > 0){
                                    Message += language.MessageIDsDeleted.getPrepared('ids', '[' + deleted.join(', ') + ']');
                                }
                                if(notfound.length > 0){
                                    if(deleted.length > 0)
                                        Message += "\n";
                                    Message += language.MessageIDsNotFound.getPrepared('ids', '[' + deleted.join(', ') + ']');
                                }
                                Message += "```";
                                message.channel.send(Message);
                            }
                        });
                    }

                    for(var i = 0; i < ids.length; i++){
                        var id = ids[i];
                        message.channel.fetchMessage(id).then(Message => {
                            if(Message == undefined){
                                if(sendNotify){
                                    notfound.push(id);
                                    delEvent.emit('newDeletes');
                                }
                            }else{
                                if(sendNotify)
                                deleted.push(id);
                                Message.delete().then((msg) => {
                                    if(sendNotify)
                                        delEvent.emit('newDeleted');
                                });
                            }
                        });
                    }
                }
                if(count == undefined && ids.length == 0){
                    message.channel.sendMessage(language.MessageDeleteWrongProperty);
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