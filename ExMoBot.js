process.on('uncaughtException', err => {
    console.log('Error: ' + err.stack);
    process.exit(2);
});
const Discord = require('discord.js');


var vars = require('./global/vars.js');
var MessageHandler = require('./MessageHandler.js');

var Client = new Discord.Client();
Client.on('message', message => {
    MessageHandler.handle(Client, message);
});
Client.login(vars.DiscordToken);
console.log('ExMoBot logged in!');