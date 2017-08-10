var Updater = require('./../Update.js');
var exec = require('child_process').exec;

module.exports = {
    name: 'update',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 3,
    execute: (bot, message, prefix, command, parameter, language) => {
        message.channel.send(language.Updating).then(msg => {
            if (Updater.update()){
                var proc = exec('git log --format=%B -n 1', (error, out, err) => {
                    var lines = out.split('\n');
                    message.channel.send(language.Updated.getPrepared('version', lines[0])).then(Msg => {
                        process.exit(0);
                    });
                });
            }
            else{
                message.channel.send(language.NoUpdates);
            }
        });
    }
};