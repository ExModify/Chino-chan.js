const fs = require('fs');

module.exports = {
    languages: fs.readdirSync('./langs'),
    getLanguage: (langIDOrName) => {
        var ReturnValue = undefined;
        fs.readdirSync('./langs').forEach((v, i, a) => {
            if(!fs.statSync('./langs/' + v).isDirectory())
            {
                var lang = JSON.parse(fs.readFileSync('./langs/' + v, 'utf8').toString());
                if(lang.id === langIDOrName || lang.id === langIDOrName)
                {
                    ReturnValue = lang;
                }
            }
        });
        return ReturnValue;
    }
}