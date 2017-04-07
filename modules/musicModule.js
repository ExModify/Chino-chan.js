const request = require('request');
const fs = require('fs');
const crypto = require('crypto');

var exec = require('child_process').exec;
const execSync = require('child_process').execSync;

//Process with ID, global, multiserver, shows download time, stoppable, eventEmitter

var query = new Map();
var streams = new Map();
var volumes = new Map();

module.exports = {
    query: query,
    streams: streams,
    volumes: volumes,
    singlePlay: (bot, guildID, channelID, userID, prefix, fileOrID, language) => {
        var channel = bot.channels.get(channelID);

        if(streams.has(guildID))
            if(streams.get(guildID) != null && streams.get(guildID) != undefined)
                streams.set(guildID, undefined);
        
        if(fileOrID == "") // query first
        {
            
        } 
        else if(isNaN(parseInt(fileOrID))) // remote file, or youtube
        {
            isYouTube(fileOrID).then(result => {
                if(result){
                    getYouTubeTitle(fileOrID).then(name => {
                        channel.sendMessage(language.MusicDownloading.getPrepared('name', name));
                        downloadYouTube(fileOrID).then(path => {
                            startPlay(bot, guildID, channelID, userID, prefix, language, path, name);
                        }).catch(err => {
                            channel.sendMessage(err.toString());
                        });
                    });
                    
                }
                else{
                    channel.sendMessage(language.MusicOnlyYouTubeSupported);
                    return;
                }
            })
        }else{ //Query x item
            var ID = parseInt(fileOrID);
        }
    }
};

function startPlay(bot, guildID, channelID, userID, prefix, language, file, name){
    var channel = bot.channels.get(channelID);

    if(file == ""){
        channel.sendMessage(language.MusicNotContainsAudio);
        return;
    }

    connect(bot, guildID, userID).then(recievedConnection => {
        if(recievedConnection == null){
            console.log('Connection: ' + recievedConnection);
            channel.sendMessage(language.MusicConnectionRequired.getPrepared('p', prefix));
            return;
        }

        if(!volumes.has(guildID))
            volumes.set(guildID, 100);
        
        var dispatcher = recievedConnection.playFile(file);
        dispatcher.setVolume(volumes.get(guildID) / 100);
        
        streams.set(guildID, dispatcher);

        channel.sendMessage(language.MusicStartedPlaying.getPrepared('name', name ? name : ''));
    });
}

function connect(bot, guildID, userID){
    return new Promise((resolve, reject) => {
        var guild = bot.guilds.get(guildID);
        var user = guild.members.get(userID);

        if(guild.voiceConnection == undefined || guild.voiceConnection == null){
            if(user.voiceChannel == undefined || user.voiceChannel == null){
                resolve(null);
            }
            else{
                user.voiceChannel.join().then(connection => {
                    resolve(connection);
                }).catch(err => {
                    reject(err);
                });
            }
        }
        else
            resolve(guild.voiceConnection);
    });
}

function isYouTube(link) {
    return new Promise((resolve, reject) => {
        request('http://www.youtubeinmp3.com/fetch/?format=json&video=' + link, (error, response, body) => {
            if(response.statusCode >= 300)
                resolve(false);
            else
            {
                try{
                    var json = JSON.parse(response.body);
                    
                    if(json.title != undefined && json.title != null)
                        resolve(true);
                    else
                        resolve(false);
                }
                catch(err){
                    resolve(false);
                }
            }
        });
    });
}

function getYouTubeTitle(link) {
    return new Promise((resolve, reject) => {
        request('http://www.youtubeinmp3.com/fetch/?format=json&video=' + link, (error, response, body) => {
            var json = JSON.parse(response.body);
            resolve(json.title);
        });
    });
}

function downloadYouTube(link) {
    return new Promise((resolve, reject) => {
        request('http://www.youtubeinmp3.com/fetch/?format=json&video=' + link, (error, response, body) => {
            if(response.statusCode < 300)
            {
                try{
                    var json = JSON.parse(response.body);
                    downloadFile(json.link, link).then(path => {
                        resolve(path);
                        return;
                    });
                }
                catch(err){ reject(new Error('Not valid YouTube link!')); }
            }
            else{
                reject(new Error("Error while checking if it's a YouTube link!"));
            }
        });
    });
}
function downloadFile(link, originalLink) {
    return new Promise((resolve, reject) => {
        if(originalLink == undefined)
            originalLink = link;
        
        if(!fs.existsSync(__dirname + '/../Songs'))
            fs.mkdirSync(__dirname + '/../Songs');

        var fileName = crypto.createHash('md5').update(originalLink).digest('hex') + '.mp3';
        var path = __dirname + '/../Songs/' + fileName;

        if(fs.existsSync(path))
        {
            resolve(path);
            return;
        }
        var download = request(link);

        download.pipe(fs.createWriteStream(path));
        download.on('complete', (resp, body) => {
            resolve(path);
            /*
            var ffprobe = execSync('ffprobe -i "' + path + '"');

            if(ffprobe.indexOf('Input #0, mp3') < 0 || ffprobe.indexOf('Audio: mp3') < 0){
                var ffmpeg = execSync(`ffmpeg -i "${path}" -vn -ar 48000 -ac 2 -ab 192k -f mp3 "${path}"`);

                if(!fs.existsSync(path))
                {
                    resolve("");
                }
            }
            else{
                resolve(path);
            }
            */
        });
    });
}