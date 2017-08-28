var vars = require('./../global/vars.js');
var fs = require('fs');
var rerequire = require('./../modules/rerequire.js');
var langHandler = rerequire('./../modules/langHandler.js');

module.exports = {
    name: 'language',
    canPrivate: false,
    requirePrefix: true,
    minimumLevel: 1,
    type: "Customization",
    execute: (bot, message, prefix, command, parameter, language) => {
        if(parameter == ""){
            var langs = '';
            langHandler.languages.forEach((v, i, a) => {
                var lang = JSON.parse(fs.readFileSync('./langs/' + v, 'utf8').toString());
                langs += lang.id + ' - ' + lang.name;
                if(i !== langHandler.languages.length - 1)
                    langs += ', ';
            });
            
            message.channel.send(language.ListLanguages.getPrepared(['languages', 'currentlang'], [langs, language.name]));
        }else{
            var lang = langHandler.getLanguage(parameter);
            if(lang === undefined){
                message.channel.send(language.UnknownLanguage.getPrepared(['prefix', 'command'], [prefix, command]));
            }
            else{
                vars.SetLanguage(message.guild == null ? message.author.dmChannel.id : message.guild.id);
                message.channel.send(lang.LanguageChanged);
            }
        }
    }
};