var vars = require('./../global/vars.js');
var ws = require('./../modules/webserver.js');

module.exports = {
    name: 'waifucloud',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 0,
    type: "Fun - Image",
    execute: (bot, message, prefix, command, parameter, language, uptime, waifu) => {
        var parameters = parameter.split(' ');
        if (parameters.length == 0){
            sendWaifuCloudHelp(language, message, prefix);
        }
        else{
            if (waifu.connected) {
                waifu.search(parameters).then(response => {
                    if(!response.error){
                        message.channel.sendImageEmbed(response.file, "Waifu Cloud", message.channel);
                    }
                    else{
                        message.channel.send(language.WaifuCloudNoMatches.getPrepared("tags", parameter));
                    }
                });
            }
            else {
                message.channel.send(language.WaifuCloudNotConnected);
            }
        }
    }
};
function sendWaifuCloudHelp(language, message, prefix){
    var Message = language.WaifuCloudHelp.Top + '\n';
    
    var count = 1;
    for(;;){
        var CommandHelp = language.WaifuCloudHelp['Command' + count];

        if(CommandHelp !== undefined)
            Message += CommandHelp + '\n';
        else
            break;
        
        count++;
    }

    Message += language.WaifuCloudHelp.Bottom;
    Message = Message.getPrepared(['prefix', 'p'], [prefix, prefix]);

    message.channel.send(Message);
}