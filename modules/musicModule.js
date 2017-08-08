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
        if(link == ""){
            bot.channels.get(channelID).send(language.MusicQueryAddNoLink);
        }
        else{
            if(isYouTube(link)){
                getYouTubeTitle(link).then((title) => {
                    vars.AddQueryLink(guildID, title, link);
                    bot.channels.get(channelID).send(language.MusicQueryAdded.getPrepared('name', title));
                });
            }
            else{
                bot.channels.get(channelID).send(language.MusicOnlyYouTubeSupported);
            }
        }
    },
    remove: (bot, guildID, channelID, userID, prefix, idParam, language) => {
        if(idParam == "" || isNaN(parseInt(idParam))){
            bot.channels.get(channelID).send(language.MusicQueryRemoveNoID);
        }
        else{
            var Settings = vars.Settings(guildID);

            var id = parseInt(idParam);
            if(Settings.Query[id - 1] == undefined){
                bot.channels.get(channelID).send(language.MusicQueryRemoveWrongID.getPrepared(['prefix', 'p'], [prefix, prefix]));
            }
            else{
                var Title = Settings.Query[id - 1].title;
                vars.RemoveQueryAt(guildID, id - 1);
                bot.channels.get(channelID).send(language.MusicQueryRemoved.getPrepared('name', title));
            }
        }
    },
    displayQuery: (channel, language) => {
        var Settings = vars.Settings(channel.guild == undefined ? channel.id : channel.guild.id);
        if(Settings.Query.length == 0){
            channel.send(language.MusicQueryEmpty);
        }
        else{
            var Lines = "";
            var NamesDigitLength = DigitLength(Settings.Query.length + 1);
            Settings.Query.forEach((v, i, a) => {
                var DigitLengthDifference = NamesDigitLength - DigitLength(i + 1);
                Lines += (i + 1);
                for(var index = 0; index < DigitLengthDifference; index++)
                    Lines += " ";
                Lines += " - " + v.title + "\n";
            });
            channel.send(language.MusicQueryDisplay.getPrepared('lines', Lines));
        }
    },
    play: (bot, guildID, channelID, userID, prefix, fileOrID, language) => {
        var Settings = vars.Settings(guildID);

        var channel = bot.channels.get(channelID);

        if(Settings.MusicIsPlaying){
            var Dispatcher = vars.Streams.get(guildID);
            if(Dispatcher != null && Dispatcher != undefined){
                vars.SetStopped(guildID, true);
                Dispatcher.end();
            }
        }
        
        if(fileOrID == ""){
            if(Settings.Query.length == 0){
                channel.send(language.MusicQueryEmpty);
            }
            else{
                PlayQuery(bot, channelID, userID, guildID, language);
            }
        }
        else if(isNaN(parseInt(fileOrID)))
        {
            if(isYouTube(fileOrID)){
                vars.SetPlaying(guildID, true);
                vars.SetCurrentPlaying(guildID, fileOrID);
                PlayYouTube(bot, fileOrID, channelID, language, guildID, userID, Settings, () => {
                    Settings = vars.Settings(guildID);
                    vars.SetPlaying(guildID, false);
                    vars.SetCurrentPlaying(guildID, "");
                    vars.SetQueryPlaying(guildID, false);
                    vars.SetMusicPosition(guildID, 0);
                    if(Settings.MusicStopped){
                        vars.SetStopped(guildID, false);
                        vars.Streams.get(guildID).emit('canGo');
                        return;
                    }
                    channel.send(language.MusicFinishedPlaying.getPrepared('name', name));
                });
            }
            else{
                channel.send(language.MusicOnlyYouTubeSupported);
            }
        }else{
            var ID = parseInt(fileOrID);
            if(Settings.Query.length == 0){
                channel.send(language.MusicQueryEmpty);
            }
            else if (ID < 0 || ID > Settings.Query.length){
                channel.send(language.MusicQueryRemoveWrongID.getPrepared(['p', 'prefix'], [prefix, prefix]));
            }
            else{
                vars.SetQueryIndex(guildID, ID - 1);
                PlayQuery(bot, channelID, userID, guildID, language);
            }
        }
    },
    next: (bot, guildID, channel, userID, language) => {
        var Settings = vars.Settings(guildID);
        if(Settings.Query.length == 0){
            channel.send(language.MusicQueryEmpty);
        }
        else{
            if(Settings.MusicIsPlaying){
                var Stream = vars.Streams.get(guildID);

                vars.SetPlaying(guildID, false);
                vars.SetCurrentPlaying(guildID, "");
                vars.SetQueryPlaying(guildID, false);
                vars.SetMusicPosition(guildID, 0);

                if(!vars.Streams.get(guildID).destroyed){
                    vars.SetStopped(guildID, true);
                    vars.Streams.get(guildID).on('canGo', () => {
                        var index = Settings.QueryIndex;
                        if(index == Settings.Query.length - 1)
                            index = 0;
                        else
                            index++;
                        vars.SetQueryIndex(guildID, index);
                        PlayQuery(bot, channel.id, userID, guildID, language);
                    });
                    vars.Streams.get(guildID).end();
                    return;
                }
            }
            var index = Settings.QueryIndex;
            if(index == Settings.Query.length - 1)
                index = 0;
            else
                index++;
            vars.SetQueryIndex(guildID, index);
            PlayQuery(bot, channel.id, userID, guildID, language);
        }
    },
    prev: (bot, guildID, channel, userID, language) => {
        var Settings = vars.Settings(guildID);
        if(Settings.Query.length == 0){
            channel.send(language.MusicQueryEmpty);
        }
        else{
            var Stream = vars.Streams.get(guildID);
            if(Settings.MusicIsPlaying){
                var Stream = vars.Streams.get(guildID);

                vars.SetPlaying(guildID, false);
                vars.SetCurrentPlaying(guildID, "");
                vars.SetQueryPlaying(guildID, false);
                vars.SetMusicPosition(guildID, 0);

                if(!vars.Streams.get(guildID).destroyed){
                    vars.SetStopped(guildID, true);
                    vars.Streams.get(guildID).on('canGo', () => {
                        var index = Settings.QueryIndex;
                        if(index == 0)
                            index = Settings.Query.length - 1;
                        else
                            index--;
                        vars.SetQueryIndex(guildID, index);
                        PlayQuery(bot, channel.id, userID, guildID, language);
                    });
                    vars.Streams.get(guildID).end();
                    return;
                }
            }
            var index = Settings.QueryIndex;
            if(index == 0)
                index = Settings.Query.length - 1;
            else
                index--;
            vars.SetQueryIndex(guildID, index);
            PlayQuery(bot, channel.id, userID, guildID, language);
        }
    },
    pause: (bot, guildID, prefix, channel, language) => {
        if(vars.Streams.get(guildID) == undefined){
            channel.send(language.MusicPauseNotPlaying);
        }else{
            var Stream = vars.Streams.get(guildID);
            if(Stream.paused){
                channel.send(language.MusicPauseAlreadyPaused.getPrepared(['prefix', 'p'], prefix, prefix));
            }
            else if (Stream.destroyed){
                channel.send(language.MusicPauseNotPlaying);
            }
            else{
                vars.Streams.get(guildID).pause();
                channel.send(language.MusicPausedPlaying);
            }
        }
    },
    resume: (bot, guildID, channel, language) => {
        if(vars.Streams.get(guildID) == undefined){
            channel.send(language.MusicResumeNotPlaying);
        }else{
            if(vars.Streams.get(guildID).paused){
                vars.Streams.get(guildID).resume();
                channel.send(language.MusicResumedPlaying);
            }
            else{
                channel.send(language.MusicResumeNotPlaying);
            }
        }
    },
    clear: (bot, guildID, channel, language) => {
        var Settings = vars.Settings(guildID);
        if(Settings.Query.length == 0){
            channel.send(language.MusicClearEmptyQuery);
        }
        else{
            vars.ClearQuery(guildID);
            channel.send(language.MusicQueryCleared);
        }
    },
    stop: (guildID, channel, language) => {
        if(vars.Streams.get(guildID) == undefined){
            channel.send(language.NoMusicPlaying);
        }
        else{
            vars.SetPlaying(guildID, false);
            vars.SetCurrentPlaying(guildID, "");
            vars.SetQueryPlaying(guildID, false);
            vars.SetMusicPosition(guildID, 0);
            vars.SetStopped(guildID, true);

            vars.Streams.get(guildID).end();
            channel.send(language.MusicStoppedPlaying);
        }
    },
    connect: (bot, guildID, userID, channelID) => connect(bot, guildID, userID, channelID),
    disconnect: (message, language) => {
        if(message.guild.voiceConnection == undefined){
            message.channel.send(language.MusicLeftAlready);
        }
        else{
            if(message.guild.voiceConnection.status == 4){
                message.channel.send(language.MusicLeftAlready);
            }
            else{
                var Settings = vars.Settings(message.guild.id);
                if(Settings.MusicIsPlaying){
                    vars.SetPlaying(message.guild.id, false);
                    vars.SetCurrentPlaying(message.guild.id, "");
                    vars.SetQueryPlaying(message.guild.id, false);
                    vars.SetMusicPosition(message.guild.id, 0);
                    vars.SetStopped(message.guild.id, true);
                    vars.Streams.get(message.guild.id).on('canGo', () => {
                        message.guild.voiceConnection.disconnect();
                        message.channel.send(language.MusicDisconnected);
                    });
                    vars.Streams.get(message.guild.id).end();
                }else{
                    message.guild.voiceConnection.disconnect();
                    message.channel.send(language.MusicDisconnected);
                }
            }
        }
    },
    setVolume: (bot, guildID, channelID, volume, language) => {
        var channel = bot.channels.get(channelID);
        vars.SetVolume(guildID, volume);
        if(vars.Streams.has(guildID)){
            var stream = vars.Streams.get(guildID);
            if(stream != undefined){
                stream.setVolume(parseFloat(volume) / 100);
            }
        }
        channel.send(language.MusicVolumeChanged.getPrepared('volume', volume));
    }
};


function DigitLength(number){
    return number.toString().length;
}

function PlayQuery(bot, channelID, userID, guildID, language){
    vars.SetQueryPlaying(guildID, true);
    var Settings = vars.Settings(guildID);
    var index = Settings.QueryIndex;
    var Link = Settings.Query[index].link;
    
    PlayYouTube(bot, Link, channelID, language, guildID, userID, Settings, () => {
        if(Settings.MusicStopped){
            vars.SetStopped(guildID, false);
            vars.Streams.get(guildID).emit('canGo');
            return;
        }
        Settings = vars.Settings(guildID);

        if(index == Settings.Query.length - 1){
            index = 0;
        }
        else{
            index++;
        }
        vars.SetQueryIndex(guildID, index);

        PlayQuery(bot, channelID, userID, guildID, language);
    });
}
function PlayYouTube(bot, link, channelID, language, guildID, userID, Settings, endCallback){
    var channel = bot.channels.get(channelID);
    getYouTubeTitle(link).then(name => {
        channel.send(language.MusicStartedPlaying.getPrepared('name', name));

        connect(bot, guildID, userID, channelID).then(voiceConnection => {
            var stream = GetMP3Stream(guildID, link);
            var Dispatcher = voiceConnection.playStream(stream, 
            {
                "volume": Settings.Volume / 100
            });

            Dispatcher.on("end", endCallback);
            
            vars.Streams.set(guildID, Dispatcher);
            vars.SetPlaying(guildID, true);
            vars.SetCurrentPlaying(guildID, link);
        });
    });
}

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

function GetMP3Stream(guildID, link) {
    var stream = ytdl(link);
    var proc = ffmpeg({source:stream});
    proc.toFormat('mp3');

    var stream = through();
    
    proc.pipe(stream);

    return stream;
}