const fs = require('fs');

var SFWPath = 'D:\\Saves\\Cuccok\\Imgs\\';
var NSFWPath = SFWPath + 'nsfw\\';
var NekoPath = SFWPath + 'neko\\';
var ChinoPath = SFWPath + 'Chino\\';

module.exports = {
    Prefixes: new Map(),
    Languages: new Map(),
    SaveMap: (Map, fileName) => {
        if(fs.existsSync(fileName))
            fs.unlinkSync(fileName);
        
        var content = '';
        Map.forEach((v, k, m) => {
            content += k + ':' + v + '\r\n';
        });
        fs.writeFileSync(fileName, content, 'utf8');
    },
    LoadMap: (fileName) => {
        var content = fs.readFileSync(fileName, 'utf8').toString();
        var ReturnMap = new Map();
        content.split('\r\n').forEach((v, i, a) => {
            var lines = v.split(':', 1);
            ReturnMap.set(lines[0], lines[1]);
        });
        return ReturnMap;
    },
    DiscordToken: fs.readFileSync('D:\\txt\\APIToken\\DiscordToken.txt').toString(),
    osuAPI: fs.readFileSync('D:\\txt\\APIToken\\osu!API.txt').toString(),
    IRCPassword: fs.readFileSync('D:\\txt\\APIToken\\osu!IRC.txt').toString(),
    SFWPath: SFWPath,
    NSFWPath: NSFWPath,
    NekoPath: NekoPath,
    ChinoPath: ChinoPath,
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
}