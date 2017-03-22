const Discord = require('discord.js');
var MessageHandler = require('./MessageHandler.js');

var Client = new Discord.Client();
Client.on('message', message => {
    MessageHandler.handle(Client, message);
});