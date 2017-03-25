var rerequire = require('../modules/rerequire.js');
var compile = rerequire('./modules/compileNodeCommand.js');

module.exports = {
    name: 'execute',
    aliases: [],
    execute: (bot, message, prefix, command, parameter, language) => {
        compile.execute(parameter).then(res => {
            if(res.trim() !== "")
                message.channel.sendMessage('```' + res + '```');
            else
                message.channel.sendMessage("```css\nExecution didn't send any results!```");
        });
    }
};