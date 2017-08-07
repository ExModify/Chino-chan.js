var request = require('request');

module.exports = {
    name: 'image',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 0,
    execute: (bot, message, prefix, command, parameter, language) => {
        let parameters = parameter.split(' ');
        parameters[0] = parameters[0].toLowerCase();
        if(parameters[0] == "sankaku"){
            message.channel.send(language.InDevelopment);
        }
        else if (parameters[0] == "gelbooru"){
            var tags = parameters.slice(1).join('+');
            if(tags == ""){
                message.channel.send(language.ProvideTags);
            }
            else{
                var url = `https://gelbooru.com/index.php?page=dapi&s=post&q=index&tags=${tags}&json=1`;
                var req = request(url, (err, resp, body) => {
                    var json = body.toString();
                    if(json.trim() == ""){
                        message.channel.send(language.GelbooruNoImage.getPrepared('tags', parameters.slice(1).join(' ')));
                    }
                    else{
                        var jsonParsed = JSON.parse(json);
                        var index = Math.floor(Math.random() * jsonParsed.length);
                        var object = jsonParsed[index];
                        message.channel.sendImageEmbedOnline(object.file_url, "Gelbooru", message.channel);
                    }
                });
            }
        }
        else{
            message.channel.send(GetHelp(language, prefix));
        }

    }
};

function GetHelp(language, prefix){
    var Message = language.ImageHelp.Top + '\n';
    
    var count = 1;
    for(;;){
        var CommandHelp = language.ImageHelp['Line' + count];

        if(CommandHelp !== undefined)
            Message += CommandHelp + '\n';
        else
            break;
        
        count++;
    }

    Message += language.ImageHelp.Bottom;
    Message = Message.getPrepared(['prefix', 'p'], [prefix, prefix]);
    return Message;
}