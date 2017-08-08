var DefaultSettings = `{
    "Owner": "193356184806227969",
    "GlobalAdmins": [
        "194159784948269056",
        "191270200107204609",
        "143399021740818432",
        "148531387962490880"
    ],
    "SFWPath": "D:\\Saves\\Stuffs\\Imgs\\",
    "NSFWPath": "D:\\Saves\\Stuffs\\Imgs\\nsfw\\",
    "NekoPath": "D:\\Saves\\Stuffs\\Imgs\\neko\\",
    "ChinoPath": "D:\\Saves\\Stuffs\\Imgs\\Chino\\",
    "MomijiPath": "D:\\Saves\\Stuffs\\Imgs\\Momiji\\",
    "DiscordTokenPath": "D:\\txt\\APIToken\\DiscordToken.txt",
    "osuAPIPath": "D:\\txt\\APIToken\\osu!API.txt",
    "osuIRCPath": "D:\\txt\\APIToken\\osu!IRC.txt"
}`;

var fs = require('fs');
var rerequire = require('./../modules/rerequire.js');
var GuildSettings = [];

var Settings = undefined;
function LoadSettings(){
    if(fs.existsSync('./data/Settings.json'))
    {
        Settings = JSON.parse(fs.readFileSync('./data/Settings.json').toString());
    }
    else{
        Settings = JSON.parse(DefaultSettings);
        SaveSettings();
    }
}

LoadSettings();

var Streams = new Map();


var SFWFiles = [];
var NSFWFiles = [];
var NekoFiles = [];
var ChinoFiles = [];
var MomijiFiles = [];

function LoadImages(){
    fs = rerequire('fs');
    if(fs.existsSync(Settings.SFWPath)){
        SFWFiles = fs.readdirSync(Settings.SFWPath).filter((v, i, a) => {
            if (fs.statSync(Settings.SFWPath + v).isDirectory())
                return false;
            return true;
        });
    }
    if(fs.existsSync(Settings.NSFWPath)){
        NSFWFiles = fs.readdirSync(Settings.NSFWPath).filter((v, i, a) => {
            if (fs.statSync(Settings.NSFWPath + v).isDirectory())
                return false;
            return true;
        });
    }
    if(fs.existsSync(Settings.NekoPath)){
        NekoFiles = fs.readdirSync(Settings.NekoPath).filter((v, i, a) => {
            if (fs.statSync(Settings.NekoPath + v).isDirectory())
                return false;
            return true;
        });
    }
    if(fs.existsSync(Settings.ChinoPath)){
        ChinoFiles = fs.readdirSync(Settings.ChinoPath).filter((v, i, a) => {
            if (fs.statSync(Settings.ChinoPath + v).isDirectory())
                return false;
            return true;
        });
    }
    if(fs.existsSync(Settings.MomijiPath)){
        MomijiFiles = fs.readdirSync(Settings.MomijiPath).filter((v, i, a) => {
            if (fs.statSync(Settings.MomijiPath + v).isDirectory())
                return false;
            return true;
        });
    }
}

LoadImages();

var DiscordToken = fs.readFileSync(Settings.DiscordTokenPath).toString();
var osuAPI = fs.readFileSync(Settings.osuAPIPath).toString();
var IRC = fs.readFileSync(Settings.osuIRCPath).toString().split('\n');
var IRCUsername = IRC[0];
var IRCPassword = IRC[1];

function LoadGuildSettings(){
    if(fs.existsSync('./data/GuildSettings.json'))
        GuildSettings = JSON.parse(fs.readFileSync('./data/GuildSettings.json').toString());
}
function SaveGuildSettings(){
    if(fs.existsSync('./data/GuildSettings.json'))
        fs.unlinkSync('./data/GuildSettings.json');
    fs.writeFileSync('./data/GuildSettings.json', JSON.stringify(GuildSettings));
}
function SaveSettings(){
    if(fs.existsSync('./data/Settings.json'))
        fs.unlinkSync('./data/Settings.json');
    fs.writeFileSync('./data/Settings.json', JSON.stringify(Settings));
}
function Get(guildID){
    var Base = undefined;
    
    var index = GuildSettings.findIndex((e, i, a) => {
        return e.GuildID == guildID;
    });

    if(index >= 0)
        Base = GuildSettings[index];
    
    if(Base == undefined){
        Base = JSON.parse(`{
            "GuildID": "${guildID}",
            "Prefix": "$",
            "Language": "en",
            "Admins": [],
            "Volume": 100,
            "Query":[],
            "MusicCurrent": "",
            "MusicIsPlaying": false,
            "MusicStopped": false,
            "QueryPlaying": false,
            "QueryIndex": 0,
            "MusicPosition": 0
        }`);
        GuildSettings.push(Base);
        SaveGuildSettings();
    }
    return Base;
}
function AddOrSet(guildID, property, value){
    var Base = Get(guildID);

    if(property == "Query" || property == "Admins"){
        Base[property].push(value);
    }else{
        Base[property] = value;
    }
    var index = GuildSettings.findIndex((e, i, a) => {
        return e.GuildID == guildID;
    });
    
    GuildSettings[index] = Base;
    SaveGuildSettings();
}
function Remove(guildID, property, value){
    var Base = Get(guildID);
    if(Base[property] instanceof Array){
        var index = Base[property].indexOf(value);
        if(index >= 0)
        {
            Base[property].splice(index, 1);
        }
    }
    var index = GuildSettings.findIndex((e, i, a) => {
        return e.GuildID == guildID;
    });
    
    GuildSettings[index] = Base;
    SaveGuildSettings();
}
function RemoveAt(guildID, property, at){
    var Base = Get(guildID);
    if(Base[property] instanceof Array){
        Base[property].slice(at, 1);
    }
    var index = GuildSettings.findIndex((e, i, a) => {
        return e.GuildID == guildID;
    });
    
    GuildSettings[index] = Base;
    SaveGuildSettings();
}
function RemoveAll(guildID, property){
    var Base = Get(guildID);
    if(Base[property] instanceof Array){
        Base[property] = [];
    }
    var index = GuildSettings.findIndex((e, i, a) => {
        return e.GuildID == guildID;
    });
    
    GuildSettings[index] = Base;
    SaveGuildSettings();
}
function IsOwner(UserID){
    return Settings.Owner == UserID;
}

module.exports = {
    Load: () => {
        LoadSettings();
        LoadGuildSettings();
    },
    ReloadImages: () => LoadImages(),
    DiscordToken: DiscordToken,
    osuAPI: osuAPI,
    IRCUsername: IRCUsername,
    IRCPassword: IRCPassword,
    Settings: (guildID) => Get(guildID),
    Streams: Streams,
    SetPrefix: (guildID, prefix) => AddOrSet(guildID, "Prefix", prefix),
    SetLanguage: (guildID, languageID) => AddOrSet(guildID, "Language", languageID),
    SetVolume: (guildID, volume) => AddOrSet(guildID, "Volume", volume),
    AddQueryLink: (guildID, title, link) => AddOrSet(guildID, "Query", {"title": title, "link": link}),
    RemoveQueryLink: (guildID, link) => Remove(guildID, "Query", link),
    RemoveQueryAt: (guildID, index) => RemoveAt(guildID, "Query", index),
    ClearQuery: (guildID) => RemoveAll(guildID, "Query"),
    SetPlaying: (guildID, isPlaying) => AddOrSet(guildID, "MusicIsPlaying", isPlaying),
    SetCurrentPlaying: (guildID, current) => AddOrSet(guildID, "MusicCurrent", current),
    SetStopped: (guildID, stopped) => AddOrSet(guildID, "MusicStopped", stopped),
    SetQueryPlaying: (guildID, playing) => AddOrSet(guildID, "QueryPlaying", playing),
    SetQueryIndex: (guildID, index) => AddOrSet(guildID, "QueryIndex", index),
    SetMusicPosition: (guildID, position) => AddOrSet(guildID, "MusicPosition", position),
    GetAdminNames: (bot, guildID) => {
        var Names = [];
        var Admins = Get(guildID)["Admins"];

        Names.push(bot.users.get(Settings["Owner"]).username);

        Settings["GlobalAdmins"].forEach((v, i, a) => {
            Names.push(bot.users.get(v).username);
        });

        Admins.forEach((v, n, a) => {
            Names.push(bot.users.get(v).username);
        });
        return Names;
    },
    AddAdmin: (guildID, userID) => AddOrSet(guildID, "Admins", userID),
    AddGlobalAdmin: (userID) => {
        GuildSettings.forEach((v, i, a) => {
            if(v["Admins"].indexOf(userID) >= 0){
                Remove(v.GuildID, "Admins", userID);
            }
        });
        Settings["GlobalAdmins"].push(userID);
        SaveGuildSettings();
        SaveSettings();
    },
    RemoveAdmin: (guildID, userID) => Remove(guildID, "Admins", userID),
    RemoveGlobalAdmin: (userID) => {
        var index = Settings["GlobalAdmins"].indexOf(userID);
        if(index >= 0)
            Settings["GlobalAdmins"].splice(Index, 1);
        SaveSettings();
    },
    HasAdmin: (guild, userID) => {
        if(IsOwner(userID))
            return true;
        else if(guild == undefined)
            return false;
        else
            return Get(guild.id)["Admins"].indexOf(userID) >= 0 
                || Settings["Owner"] == userID 
                || Settings["GlobalAdmins"].indexOf(userID) >= 0 
                || guild.ownerID == userID;
    },
    IsOwner: (userID) => IsOwner(userID),
    IsGlobalAdmin: (userID) => Settings.GlobalAdmins.indexOf(userID) >= 0,
    SFWPath: Settings.SFWPath,
    NSFWPath: Settings.NSFWPath,
    NekoPath: Settings.NekoPath,
    ChinoPath: Settings.ChinoPath,
    MomijiPath: Settings.MomijiPath,
    SFWFiles: SFWFiles,
    NSFWFiles: NSFWFiles,
    NekoFiles: NekoFiles,
    ChinoFiles: ChinoFiles,
    MomijiFiles: MomijiFiles,
    AllCount: SFWFiles.length + NSFWFiles.length + NekoFiles.length + ChinoFiles.length + MomijiFiles.length,
    SFWCount: SFWFiles.length,
    NSFWCount: NSFWFiles.length,
    NekoCount: NekoFiles.length,
    ChinoCount: ChinoFiles.length,
    MomijiCount: MomijiFiles.length,
    NSFWExists: (file) => fs.existsSync(Settings.NSFWPath + file),
    NSFWDelete: (file) => fs.unlinkSync(Settings.NSFWPath + file)
}
