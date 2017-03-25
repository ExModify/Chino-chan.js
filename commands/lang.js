const rerequire = require('./../modules/rerequire.js');
var vars = require('./../global/vars.js');
var fs = rerequire('fs');
var langHandler = rerequire('./modules/langHandler.js');

module.exports = {
    name: 'language',
    aliases: ['lang'],
    execute: (bot, message, prefix, command, parameter, language) => {
        if(parameter === ""){
            var langs = '';
            langHandler.languages.forEach((v, i, a) => {
                var lang = JSON.parse(fs.readFileSync('./langs/' + v, 'utf8').toString());
                langs += lang.id + ' - ' + lang.name;
                if(i !== langHandler.languages.length - 1)
                    langs += ', ';
            });
            
            message.channel.sendMessage(language.ListLanguages.getPrepared('languages', langs));
        }else{
            var lang = langHandler.getLanguage(parameter);
            if(lang === undefined){
                message.channel.sendMessage(language.UnknownLanguage.getPrepared(['prefix', 'command'], [prefix, command]));
            }
            else{
                vars.Languages.set(message.guild.id, lang.id);
                vars.SaveMap(vars.Languages, './data/languages.txt');
                message.channel.sendMessage(lang.LanguageChanged);
            }
        }
    }
};