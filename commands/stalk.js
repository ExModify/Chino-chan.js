var vars = require('./../global/vars.js');
var request = require('request');

var UserRecent = [];

module.exports = {
    name: 'stalk',
    aliases: [],
    canPrivate: false,
    requirePrefix: true,
    execute: (bot, message, prefix, command, parameter, language) => {
        if(parameter == ""){
            message.channel.sendMessage(language.StalkParameterMissing);
            return;
        }
        IsValidUser(parameter, message.guild.id).then((userName) => {
            vars.AddStalked(message.guild.id, userName);
            var LastLength = vars.StalkedPlayersSource.size;
            var stalkingInterval = setInterval(() => {
                if(vars.StalkedPlayersSource.size != LastLength){

                }
            }, 1000 * LastLength);
        }).catch((reason) => {
            if(reason == "invalid_user"){
                message.channel.sendMessage(language.StalkInvalidUser);
            } 
            else if (reason == "user_stalked"){
                message.channel.sendMessage(language.StalkUserStalked);
            }
            else{
                console.log('Error: Unknown error during requesting the user! Error reason: \n' + reason);
                message.channel.sendMessage(language.UnknownError);
            }
        });
    }
};

function GetUser(user, guildID){
    new Promise((resolve, reject) => {
        IsValidUser(user, guildID).then((userName) => {
            request('https://osu.ppy.sh/api/get_user?k=' + vars.osuAPI + '&u=' + userName + '&type=string', (error, response, body) => {
                var UserParsed = JSON.parse(body.toString());
                resolve(UserParsed);
            });
        }).catch((reason) => {
            reject(reason);
        });
    });
}
function GetUserRecent(user, guildID){
    new Promise((resolve, reject) => {
        IsValidUser(user, guildID).then((userName) => {
            request('https://osu.ppy.sh/api/get_user_recent?k=' + vars.osuAPI + '&u=' + userName + '&type=string', (error, response, body) => {
                var RecentParsed = JSON.parse(body.toString());
                resolve(RecentParsed);
            });
        }).catch((reason) => {
            reject(reason);
        });
    });
}
function IsValidUser(user, guildID){
    return new Promise((resolve, reject) => {
        request('https://osu.pps.sh/u/' + user, (error, response, body) => {
            var Title = body.string.substring(body.toString().indexOf('<title>' + 7), body.toString().indexOf('</title>'));
            if(Title.toLowerCase().indexOf('profile') < 0)
                reject('invalid_user');
            else if (vars.StalkedPlayers(guildID).indexOf(resolve(Title.substring(0, Title.indexOf("'")))) <= 0)
                reject('user_stalked');
            else
                resolve(Title.substring(0, Title.indexOf("'")));
        });
    });
}
function IsStalkedSomewhere(user){
    var names = new Array();
    for(var key in vars.StalkedPlayersSource){
        names.push(vars.StalkedPlayersSource[key]);
    }
    return names.indexOf(user) >= 0;
}
function redoInterval(userName, guildID, interval, lastLength){
    clearInterval(interval);
    lastLength = vars.StalkedPlayersSource.size;
    interval = setInterval(DoStalk(userName, guildID, interval, lastLength), 1000 * lastLength);
}
function DoStalk(userName, guildID, interval, lastLength){
    if(vars.StalkedPlayersSource.size != lastLength){
        redoInterval(userName, guildID, interval, vars.StalkedPlayersSource.size);
        return;
    }
    
}