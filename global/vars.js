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
    SFWPath: 'D:\\Saves\\Cuccok\\Imgs\\',
    NSFWPath: this.SFWPath + 'nsfw\\',
    NekoPath: this.SFWPath + 'neko\\',
    ChinoPath: this.SFWPath + 'Chino\\',
    SFWFiles: fs.readdirSync(this.SFWPath),
    NSFWFiles: fs.readdirSync(this.NSFWPath),
    NekoFiles: fs.readdirSync(this.NekoPath),
    ChinoFiles: fs.readdirSync(this.ChinoPath),
    SFWCount: this.SFWFiles.length,
    NSFWCount: this.NSFWFiles.length,
    NekoCount: this.NekoFiles.length,
    ChinoCount: this.ChinoFiles.length
}