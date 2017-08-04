const fs = require('fs');
var GuildSettings = [];
var Settings = undefined;

var Streams = new Map();

var SFWPath = 'D:\\Saves\\Stuffs\\Imgs\\';
var NSFWPath = SFWPath + 'nsfw\\';
var NekoPath = SFWPath + 'neko\\';
var ChinoPath = SFWPath + 'Chino\\';
var MomijiPath = SFWPath + 'Momiji\\';

var SFWFiles;
var NSFWFiles;
var NekoFiles;
var ChinoFiles;
var MomijiFiles;

function LoadImages(){
    SFWFiles = fs.readdirSync(SFWPath).filter((v, i, a) => {
        if (fs.statSync(SFWPath + v).isDirectory())
            return false;
        return true;
    });
    NSFWFiles = fs.readdirSync(NSFWPath).filter((v, i, a) => {
        if (fs.statSync(NSFWPath + v).isDirectory())
            return false;
        return true;
    });
    NekoFiles = fs.readdirSync(NekoPath).filter((v, i, a) => {
        if (fs.statSync(NekoPath + v).isDirectory())
            return false;
        return true;
    });
    ChinoFiles = fs.readdirSync(ChinoPath).filter((v, i, a) => {
        if (fs.statSync(ChinoPath + v).isDirectory())
            return false;
        return true;
    });
    MomijiFiles = fs.readdirSync(MomijiPath).filter((v, i, a) => {
        if (fs.statSync(MomijiPath + v).isDirectory())
            return false;
        return true;
    });
}

LoadImages();

var DiscordToken = fs.readFileSync('D:\\txt\\APIToken\\DiscordToken.txt').toString();
var osuAPI = fs.readFileSync('D:\\txt\\APIToken\\osu!API.txt').toString();
var IRC = fs.readFileSync('D:\\txt\\APIToken\\osu!IRC.txt').toString().split('\n');
var IRCUsername = IRC[0];
var IRCPassword = IRC[1];

function LoadGuildSettings(){
    if(fs.existsSync('./data/GuildSettings.json'))
        GuildSettings = JSON.parse(fs.readFileSync('./data/GuildSettings.json').toString());
}
function LoadSettings(){
    if(fs.existsSync('./data/Settings.json'))
    {
        Settings = JSON.parse(fs.readFileSync('./data/Settings.json').toString());
    }
    else{
        Settings = JSON.parse(`{
            "Owner": "193356184806227969",
            "GlobalAdmins": [
                "194159784948269056",
                "191270200107204609",
                "139013515666128896",
                "143399021740818432"
            ]
        }`);
        SaveSettings();
    }
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

    GuildSettings.forEach((v, i, a) => {
        if(v["GuildID"] == guildID)
            Base = v;
    });

    if(Base == undefined){
        Base = JSON.parse(`{
            "GuildID": "${guildID}",
            "Prefix": "$",
            "Language": "en",
            "Admins": [],
            "Volume": 100,
            "Query":[]
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
    var index = GuildSettings.findIndex((t, v, i, o) => {
        return v.GuildID = guildID;
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
    for(var i = 0; i < GuildSettings.length; i++){
        if(GuildSettings[i]["GuildID"] == guildID)
        {
            GuildSettings[i] = Base;
        }
    }
    SaveGuildSettings();
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
    AddQueryLink: (guildID, link) => AddOrSet(guildID, "Query", link),
    RemoveQueryLink: (guildID, link) => Remove(guildID, "Query", link),
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
        if(guild == undefined)
            return true;
        else
            return Get(guild.id)["Admins"].indexOf(userID) >= 0 
                || Settings["Owner"] == userID 
                || Settings["GlobalAdmins"].indexOf(userID) >= 0 
                || guild.ownerID == userID;
    },
    IsOwner: (userID) => Settings.Owner == userID,
    IsGlobalAdmin: (userID) => Settings.GlobalAdmins.indexOf(userID) >= 0,
    SFWPath: SFWPath,
    NSFWPath: NSFWPath,
    NekoPath: NekoPath,
    ChinoPath: ChinoPath,
    MomijiPath: MomijiPath,
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
    NSFWExists: (file) => fs.existsSync(NSFWPath + file),
    NSFWDelete: (file) => fs.unlinkSync(NSFWPath + file)
}
