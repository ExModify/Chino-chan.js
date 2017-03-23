process.on('uncaughtException', err => {
    console.log('Error: ' + err.stack);
    process.exit(2);
});

String.prototype.getPrepared = function (from, to) {
    var Prepared = this.toString();
    if(typeof from == "string"){
        while(Prepared.indexOf('%' + from.toUpperCase() + '%') >= 0){
            Prepared = Prepared.replace('%' + from.toUpperCase() + '%', to.toString());
        }
    }else if (Array.isArray(from) && Array.isArray(to)){
        if(from.length != to.length)
            return Prepared;

        from.forEach((v, i, a) => {
            while(Prepared.indexOf('%' + v.toUpperCase() + '%') >= 0){
                Prepared = Prepared.replace('%' + v.toUpperCase() + '%', to[i].toString());
            }
        });
    }
    return Prepared;
};

const Discord = require('discord.js');


var vars = require('./global/vars.js');
var MessageHandler = require('./MessageHandler.js');

var Client = new Discord.Client();
Client.on('message', message => {
    MessageHandler.handle(Client, message);
});
Client.login(vars.DiscordToken);
console.log('ExMoBot logged in!');