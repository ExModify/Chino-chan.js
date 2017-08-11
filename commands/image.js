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
                        message.channel.send(language.ImageNoImage.getPrepared('tags', parameters.slice(1).join(' ')));
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
        else if (parameters[0] == "yandere" || parameters[0] == "yande.re"){
            var tags = parameters.slice(1).join('+');
            if(tags == ""){
                message.channel.send(language.ProvideTags);
            }
            else{
                var url = `https://yande.re/tag.json?name=${tags}`;
                request(url, (err, resp, body) => {
                    var json = body.toString();
                    var page = 0;
                    if(json.trim() != ""){
                        var jsonObject = JSON.parse(json);
                        if(jsonObject.count != 0){
                            page = Math.floor(Math.random() * parseInt((jsonObject.count / 40).toFixed(0)));
                        }
                    }
                    url = `https://yande.re/post.json?tags=${tags}&page=${page}`;
                    request(url, (error, response, bodyPost) => {
                        var postJson = bodyPost.toString();
                        if(postJson.trim() == ""){
                            message.channel.send(language.ImageNoImage.getPrepared('tags', parameters.slice(1).join(' ')));
                        }
                        else{
                            var postJsonObject = JSON.parse(postJson);
                            var index = Math.floor(Math.random() * postJsonObject.length);
                            var object = postJsonObject[index];
                            message.channel.sendImageEmbedOnline(object.file_url, "yande.re", message.channel);
                        }
                    });
                });
            }
        }
        else if (parameters[0] == "danbooru"){
            var tagsTags = parameters.slice(1).join(',');
            var tags = parameters.slice(1).join('+');
            if(tags == ""){
                message.channel.send(language.ProvideTags);
            }
            else{
                var url = `https://danbooru.donmai.us/tags.json?search[name]=${tagsTags}`;
                request(url, (err, resp, body) => {
                    var json = body.toString();
                    var page = 0;
                    if(json.trim() != ""){
                        var jsonObject = JSON.parse(json);
                        if(jsonObject.count != 0){
                            page = Math.floor(Math.random() * parseInt((jsonObject.post_count / 20).toFixed(0)));
                        }
                    }
                    url = `https://danbooru.donmai.us/posts.json?tags=${tags}&page=${page}`;
                    request(url, (error, response, bodyPost) => {
                        var postJson = bodyPost.toString();
                        if(postJson.trim() == ""){
                            message.channel.send(language.ImageNoImage.getPrepared('tags', parameters.slice(1).join(' ')));
                        }
                        else{
                            var postJsonObject = JSON.parse(postJson);
                            var object = undefined;
                            do{
                                var index = Math.floor(Math.random() * postJsonObject.length);
                                object = postJsonObject[index];
                            }
                            while(object.file_url == undefined);
                            message.channel.sendImageEmbedOnline('https://danbooru.donmai.us' + object.file_url, "danbooru", message.channel);
                        }
                    });
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