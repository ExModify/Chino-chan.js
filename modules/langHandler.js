const fs = require('fs');

module.exports = {
    languages: fs.readdirSync('./langs'),
    getLanguage: (langID) => {
        languages.forEach((v, i, a) => {
            var lang = JSON.parse('.langs/' + v);
            if(lang.id === langID)
            {
                lang.prepare = (txt, from, to) => {
                    if(typeof(from) === string){
                        if(txt.indexOf('%' + from.toUpperCase() + '%'))
                        {
                            
                        }
                    }else if (typeof(from) === string[]){

                    }
                };
                return lang;
            }
        });
        return false;
    }
}