const fs = require('fs');

var SFWPath = 'D:\\Saves\\Stuffs\\Imgs\\';
var NSFWPath = SFWPath + 'nsfw\\';
var NekoPath = SFWPath + 'neko\\';
var ChinoPath = SFWPath + 'Chino\\';
var MomijiPath = SFWPath + 'Momiji\\';

var localLanguages = new Map();
var localPrefixes = new Map();
var localStalked = new Map();

var admins = [];

if(fs.existsSync('./data/admins.txt')){
    admins = fs.readFileSync('./data/admins.txt').toString().split(';');
}
else{
    admins = ['193356184806227969', '194159784948269056'];
    saveAdmins();
}

function add (filename, guildID, value){
    var FilePath = "./data/" + filename + ".txt";

    var Content = [];
    var values = [];

    if(fs.existsSync(FilePath))
    {
        values = fs.readFileSync(FilePath).toString().split('\r\n');
        values.forEach((v, i, a) => {
            Content.push(v.split(':')[0]);
        });

        fs.unlinkSync(FilePath);
    }

    if(Content.indexOf(guildID) >= 0){
        values[Content.indexOf(guildID)] = guildID + ":" + value;
    }
    else{
        values.push(guildID + ':' + value);
    }

    if(filename == "prefixes"){
        localPrefixes.set(guildID, value);
    }
    else if(filename == "languages"){
        localLanguages.set(guildID, value);
    }
    fs.writeFileSync(FilePath, values.join('\r\n'));
}

function LoadMap(filename){
    var FilePath = "./data/" + filename + ".txt";
    var ReturnMap = new Map();

    if(fs.existsSync(FilePath))
    {
        var Content = fs.readFileSync(FilePath, "utf8").toString().split('\r\n');

        Content.forEach((v, i, a) => {
            if(v.trim() != "" && v.indexOf(':') > 0)
            {
                var Value = v.split(':');
                ReturnMap.set(Value[0], Value[1]);
            }
        });
    }

    return ReturnMap;
}

function LoadStalked(guildID){
    var Stalked = [];
    var filePath = './../data/' + guildID + '.txt';
    if(fs.existsSync(filePath)){
        var userNames = fs.readFileSync(filePath).toString().split("\r\n");
        Stalked = userNames;
    }
    localStalked.set(guildID, Stalked);
    return Stalked;
}

function SaveStalked(){
    localStalked.forEach((v, k, m) => {
        filePath = './../data/' + k + '.txt';
        if(fs.existsSync(filePath))
            fs.unlinkSync(filePath);
        fs.writeFileSync(filePath, v.join("\r\n"));
    });
}

function saveAdmins(){
    if(fs.existsSync('./data/admins.txt'))
       fs.unlinkSync('./data/admins.txt');
    fs.writeFileSync('./data/admins.txt', admins.join(';'));
}

module.exports = {
    Prefixes: () => { return LoadMap('prefixes'); },
    Languages: () => { return LoadMap('languages'); },
    StalkedPlayersSource: localStalked,
    StalkedPlayers: (guildID) => { 
        var Stalked = [];
        if(localStalked.has(guildID)){
            Stalked = localStalked.get(guildID);
        }
        return Stalked;
    },
    AddStalked: (guildID, playerName) => {
        var Stalked = [];
        if(localStalked.has(guildID)){
            Stalked = localStalked.get(guildID);
        }
        Stalked.push(playerName);
        localStalked.set(guildID, Stalked);
    },
    Admins: admins,
    SaveAdmins: () => saveAdmins(),
    set: (guildID, value, type) => add(type, guildID, value),
    LoadMap: (fileName) => LoadMap(fileName),
    DiscordToken: fs.readFileSync('D:\\txt\\APIToken\\DiscordToken.txt').toString(),
    osuAPI: fs.readFileSync('D:\\txt\\APIToken\\osu!API.txt').toString(),
    IRCPassword: fs.readFileSync('D:\\txt\\APIToken\\osu!IRC.txt').toString(),
    SFWPath: SFWPath,
    NSFWPath: NSFWPath,
    NekoPath: NekoPath,
    ChinoPath: ChinoPath,
    MomijiPath: MomijiPath,
    SFWFiles: fs.readdirSync(SFWPath).filter((v, i, a) => {
        if (fs.statSync(SFWPath + v).isDirectory())
            return false;
        return true;
    }),
    NSFWFiles: fs.readdirSync(NSFWPath).filter((v, i, a) => {
        if (fs.statSync(NSFWPath + v).isDirectory())
            return false;
        return true;
    }),
    NekoFiles: fs.readdirSync(NekoPath).filter((v, i, a) => {
        if (fs.statSync(NekoPath + v).isDirectory())
            return false;
        return true;
    }),
    ChinoFiles: fs.readdirSync(ChinoPath).filter((v, i, a) => {
        if (fs.statSync(ChinoPath + v).isDirectory())
            return false;
        return true;
    }),
    MomijiFiles: fs.readdirSync(MomijiPath).filter((v, i, a) => {
        if (fs.statSync(MomijiPath + v).isDirectory())
            return false;
        return true;
    }),
    SFWCount: fs.readdirSync(SFWPath).filter((v, i, a) => {
        if (fs.statSync(SFWPath + v).isDirectory())
            return false;
        return true;
    }).length,
    NSFWCount: fs.readdirSync(NSFWPath).filter((v, i, a) => {
        if (fs.statSync(NSFWPath + v).isDirectory())
            return false;
        return true;
    }).length,
    NekoCount: fs.readdirSync(NekoPath).filter((v, i, a) => {
        if (fs.statSync(NekoPath + v).isDirectory())
            return false;
        return true;
    }).length,
    ChinoCount: fs.readdirSync(ChinoPath).filter((v, i, a) => {
        if (fs.statSync(ChinoPath + v).isDirectory())
            return false;
        return true;
    }).length,
    MomijiCount: fs.readdirSync(MomijiPath).filter((v, i, a) => {
        if (fs.statSync(MomijiPath + v).isDirectory())
            return false;
        return true;
    }).length,
}