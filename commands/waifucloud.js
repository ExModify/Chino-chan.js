var vars = require('./../global/vars.js');

module.exports = {
    name: 'waifucloud',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 0,
    type: "Fun - Image",
    execute: (bot, message, prefix, command, parameter, language, waifu) => {
        if (guildID == "264060704313573377" && message.channel.id != "337985479943258114") // Hardcoded protection
            return;

        var parameters = parameter.split(' ');
        if (parameters.length == 0){
            sendWaifuCloudHelp(language, message, prefix);
        }
        else{
            if (waifu.connected()) {
                waifu.search(parameters).then(response => {
                    if(!response.error){
                        message.channel.sendImageEmbedOnline(response.url, "Waifu Cloud", message.channel);
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