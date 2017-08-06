const request = require('request');
const fs = require('fs');
const crypto = require('crypto');

var exec = require('child_process').exec;
const execSync = require('child_process').execSync;

const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const through = require('through2');

const url = require('url');
var vars = require('./../global/vars.js');

module.exports = {
    add: (bot, guildID, channelID, userID, prefix, link, language) => {
        
    },
    remove: (bot, guildID, channelID, userID, prefix, linkOrID, language) => {

    },
    play: (bot, guildID, channelID, userID, prefix, fileOrID, language) => {
        var Settings = vars.Settings(guildID);

        var channel = bot.channels.get(channelID);

        if(vars.Streams.has(guildID)){    
            var Dispatcher = vars.Streams.get(guildID);
            if(Dispatcher != null && Dispatcher != undefined){
                Dispatcher.end();
            }
        }
        
        if(fileOrID == "") // query first
        {
            
        } 
        else if(isNaN(parseInt(fileOrID))) // link
        {
            if(isYouTube(fileOrID)){
                getYouTubeTitle(fileOrID).then(name => {
                    var stream = GetMP3Stream(fileOrID);
                    channel.send(language.MusicStartedPlaying.getPrepared('name', name));

                    connect(bot, guildID, userID, channelID).then(voiceConnection => {
                        var Dispatcher = voiceConnection.playStream(stream, 
                        {
                            "volume": Settings.Volume / 100
                        });

                        Dispatcher.on("end", () => {
                            channel.sendMessage(language.MusicFinishedPlaying.getPrepared('name', name));
                        });
                        
                        vars.Streams.set(guildID, Dispatcher);
                    });
                });
            }
            else{
                channel.sendMessage(language.MusicOnlyYouTubeSupported);
                return;
            }
        }else{ //Query x item
            var ID = parseInt(fileOrID);
        }
    },
    stop: (guildID, channel, language) => {
        if(vars.Streams.get(guildID) == undefined){
            channel.send(language.NoMusicPlaying);
        }
        else{
            vars.Streams.get(guildID).end();
        }
    },
    connect: (bot, guildID, userID, channelID) => connect(bot, guildID, userID, channelID),
    setVolume: (bot, guildID, channelID, volume, language) => {
        var channel = bot.channels.get(channelID);
        vars.SetVolume(guildID, volume);
        if(vars.Streams.has(guildID)){
            var stream = vars.Streams.get(guildID);
            if(stream != undefined){
                stream.setVolume(parseFloat(volume) / 100);
            }
        }
        channel.sendMessage(language.MusicVolumeChanged.getPrepared('volume', volume));
    }
};

function connect(bot, guildID, userID, channelID){
    return new Promise((resolve, reject) => {
        var guild = bot.guilds.get(guildID);

        if(guild.voiceConnection != undefined && guild.voiceConnection != null)
            resolve(guild.voiceConnection);

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
        ytdl.getInfo(link).then(gotinfo => {
            resolve(gotinfo.title);
        });
    });
}

function GetMP3Stream(link) {
    var stream = ytdl(link);
    var proc = ffmpeg({source:stream});
    proc.toFormat('mp3');

    var stream = through();
    
    proc.pipe(stream);

    return stream;
}