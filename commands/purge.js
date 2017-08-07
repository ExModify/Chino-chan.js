var vars = require('./../global/vars.js');
const event = require('events');

var delEvent = new event.EventEmitter();

module.exports = {
    name: 'purge',
    canPrivate: false,
    requirePrefix: true,
    minimumLevel: 2,
    execute: (bot, message, prefix, command, parameter, language) => {
        if(vars.IsGlobalAdmin(message.author.id)
        || message.author.id == message.guild.ownerID
        || vars.IsOwner(message.author.id)){
            deleteMessages(message.channel, language).then(msg => {
                message.channel.sendMessage(msg);
            });
        }
        else{
            message.channel.sendMessage(language.MessageDeleteNoPermission);
        }
    }
};

function deleteMessages(channel, language){
    return new Promise((resolve, reject) => {
        channel.bulkDelete(100).then((messages) => {
            if(messages.size == 100){
                deleteMessages(channel, language).then(msg => {
                    resolve(msg);
                });
            }
            else{
                resolve(language.ChannelPurged);
            }
        });
    });
}