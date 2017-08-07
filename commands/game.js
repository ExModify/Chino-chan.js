var vars = require('./../global/vars.js');

module.exports = {
    name: 'game',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 3,
    execute: (bot, message, prefix, command, parameter, language) => {
        if(vars.IsOwner(message.author.id)){
            bot.user.setGame(parameter);
            if(parameter != ""){
                message.channel.send(language.GameChanged.getPrepared('game', parameter));
            }
            else{
                message.channel.send(language.NotPlaying);
            }
        }
        else{
            message.channel.send(language.GameChangeAttempt);
        }
    }
};