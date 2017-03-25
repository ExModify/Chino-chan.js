var exec = require('child_process').exec;
// -ac 2 -f s16le -ar 48000 pipe:1
module.exports = {
    name: 'music',
    aliases: [],
    execute: (bot, message, prefix, command, parameter, language) => {
        if(Parameter == ""){
            message.channel.sendMessage(language.MusicHelp.getPrepared(['prefix', 'p'], [prefix, prefix]));
        }
        var parameters = parameter.split(' ');
    }
};
function startDecode(callback){
    
}