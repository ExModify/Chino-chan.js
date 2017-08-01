const request = require('request');
const fs = require('fs');
const crypto = require('crypto');

var exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const ytdl = require('ytdl-core');

const url = require('url');
var vars = require('./../global/vars.js');

var query = new Map();
var streams = new Map();
var volumes = new Map();

module.exports = {
    query: query,
    streams: streams,
    volumes: volumes,
    add: (bot, guildID, channelID, userID, prefix, link, language) => {
        
    },
    remove: (bot, guildID, channelID, userID, prefix, linkOrID, language) => {

    },
    play: (bot, guildID, channelID, userID, prefix, fileOrID, language) => {
        if(!volumes.has(guildID))
            volumes.set(guildID, 100);

        var channel = bot.channels.get(channelID);

        if(streams.has(guildID))
            if(streams.get(guildID) != null && streams.get(guildID) != undefined)
                streams.set(guildID, undefined);
        
        if(fileOrID == "") // query first
        {
            
        } 
        else if(isNaN(parseInt(fileOrID))) // link
        {
            if(isYouTube(fileOrID)){
                getYouTubeTitle(fileOrID).then(name => {
                    var stream = require('youtube-audio-stream')(fileOrID);
                    channel.sendMessage(language.MusicStartedPlaying.getPrepared('name', name));
                    
                    setTimeout(() => {
                        connect(bot, guildID, userID, channelID).then(voiceConnection => {
                            var Dispatcher = voiceConnection.playStream(stream, 
                            {
                                "volume": volumes.get(guildID) / 100
                            });

                            Dispatcher.on("end", () => {
                                channel.sendMessage(language.MusicFinishedPlaying.getPrepared('name', name));
                            });
                            Dispatcher.on("stopped", () => {
                                channel.sendMessage(language.MusicStoppedPlaying.getPrepared('name', name));
                            });
                            
                            streams.set(guildID, Dispatcher);
                        });
                    }, 2000);
                });
            }
            else{
                downloadFile(fileOrID).then(path => {

                }).catch(reason => {

                });
                channel.sendMessage(language.MusicOnlyYouTubeSupported);
                return;
            }
        }else{ //Query x item
            var ID = parseInt(fileOrID);
        }
    },
    connect: (bot, guildID, userID, channelID) => connect(bot, guildID, userID, channelID),
    setVolume: (bot, guildID, channelID, volume, language) => {
        var channel = bot.channels.get(channelID);
        volumes.set(guildID, volume);
        vars.set(guildID, volume, "volumes");
        if(streams.has(guildID)){
            var stream = streams.get(guildID);
            if(stream != undefined){
                stream.setVolume(parseFloat(volume) / 100);
            }
        }
        channel.sendMessage(language.MusicVolumeChanged.getPrepared('volume', volume));
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

function connect(bot, guildID, userID, channelID){
    return new Promise((resolve, reject) => {
        var guild = bot.guilds.get(guildID);
        var user = guild.members.get(userID);
        var channel = user.voiceChannel;
        
        if(channelID != undefined)
        {
            var tempChannel = guild.channels.get(channelID);
            if(tempChannel != undefined && tempChannel != null)
            {
                if(tempChannel.type == "voice")
                {
                    channel = tempChannel;
                }
            }
        }

        if(guild.voiceConnection == undefined || guild.voiceConnection == null){
            if(channel != undefined && channel != null){
                channel.join().then(connection => {
                    resolve(connection);
                }).catch(err => {
                    reject(err);
                });
            }
            else {
                resolve(null);
            }
        }
        else
        {
            if(channelID != guild.voiceConnection.channel.id){
                channel.join().then(connection => {
                    resolve(connection);
                }).catch(err => {
                    reject(err);
                });
            }
            else{
                resolve(guild.voiceConnection);
            }
        }
    });
}

function isYouTube(link) {
    var idRegex = /^[a-zA-Z0-9-_]{11}$/;
    if (idRegex.test(link)) {
        return true;
    }
    var parsed = url.parse(link, true);
    var id = parsed.query.v;
    if (parsed.hostname === 'youtu.be' ||
        (parsed.hostname === 'youtube.com' ||
        parsed.hostname === 'www.youtube.com') && !id) {
        var s = parsed.pathname.split('/');
        id = s[s.length - 1];
    }
    if (!id) {
        return false;
    }
    if (!idRegex.test(id)) {
        return false;
    }
    return true;
}

function getYouTubeTitle(link) {
    return new Promise((resolve, reject) => {
        ytdl.getInfo(link).then(gotingo => {
            resolve(gotingo.title);
        });
    });
}