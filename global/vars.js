const fs = require('fs');

module.exports = {
    Prefixes: new Map(),
    Languages: new Map(),
    SaveMap: (Map, fileName) => {
        if(Map.length === 0)
            return;
        
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
    SFWPath: 'D:\\Saves\\Cuccok\\Imgs\\',
    NSFWPath: 'D:\\Saves\\Cuccok\\Imgs\\nsfw\\',
    NekoPath: 'D:\\Saves\\Cuccok\\Imgs\\neko\\',
    ChinoPath: 'D:\\Saves\\Cuccok\\Imgs\\Chino\\',
    SFWFiles: fs.readdirSync('D:\\Saves\\Cuccok\\Imgs\\'),
    NSFWFiles: fs.readdirSync('D:\\Saves\\Cuccok\\Imgs\\nsfw\\'),
    NekoFiles: fs.readdirSync('D:\\Saves\\Cuccok\\Imgs\\neko\\'),
    ChinoFiles: fs.readdirSync('D:\\Saves\\Cuccok\\Imgs\\Chino\\'),
    SFWCount: fs.readdirSync('D:\\Saves\\Cuccok\\Imgs\\').length,
    NSFWCount: fs.readdirSync('D:\\Saves\\Cuccok\\Imgs\\nsfw\\').length,
    NekoCount: fs.readdirSync('D:\\Saves\\Cuccok\\Imgs\\neko\\').length,
    ChinoCount: fs.readdirSync('D:\\Saves\\Cuccok\\Imgs\\Chino\\').length
}