process.on('uncaughtException', err => {
    LogError(err.stack);
});
process.on('unhandledRejection', (err, promise) => {
    LogError(err.stack);
});

const fs = require('fs');
const chalk = require('chalk');
const exec = require('child_process').exec;
const Updater = require('./Update.js');
const Discord = require("discord.js");

var Process = undefined;

var vars = require('./global/vars.js');

vars.Load();

var Client = new Discord.Client();

var LanguageHandler = require('./modules/langHandler.js');

var LogChannel = undefined;
var ErrorChannel = undefined;

Client.on('ready', () => {
    if(Client.user.username !== 'Chino-chan')
        Client.user.setUsername('Chino-chan');
    Client.user.setStatus("dnd");

    LogChannel = Client.channels.get("341885484592791556");
    ErrorChannel = Client.channels.get("342619532613124109");
});
Client.on('message', (message) => {
    if (!vars.IsOwner(message.author.id)){
        return;
    }
    var Prefix = '$';
    var Language = LanguageHandler.getLanguage('en');

    if(hasPrefix(message, Prefix)){
        var spaceIndex = message.content.indexOf(' ');
        spaceIndex = spaceIndex < 0 ? message.content.length : spaceIndex;

        var command = message.content.substring(Prefix.length, spaceIndex).trim().toLowerCase();

        if(command == "start"){
            RunBot();
        }
        else if (command == "stophandler"){
            if(Process == undefined){
                Client.user.setStatus("invisible").then((user) => {
                    process.exit(0);
                });
            }
        }
    }
    
});

Client.login(vars.DiscordToken).then((token) => {
    RunBot();
});

function hasPrefix(message, prefix){
    return message.content.startsWith(prefix);
}

function RunBot(channelid){
    if(Process !== undefined)
    {
        Process.kill();
    }
    Process = exec('node Chino-chan.js --color');
    Process.stdout.on('data', chunk => {
        var data = chunk.toString();
        var message = data.substring(0, data.length - 1);
        if(message.startsWith('IRC: '))
            LogIRC(message.substring(message.indexOf(' ')));
        else if (message.startsWith('Error: '))
            LogError(message.substring(message.indexOf(' ')));
        else if (message.startsWith('Git: '))
            LogError(message.substring(message.indexOf(' ')));
        else
            LogBot(message);
    });
    
    Process.on('exit', OnExit);
    LogEntrace('Chino-chan started!');
    if(channelid != undefined){
        var channel = Client.channels.get(channelid);
        var guildID = channel.guild == undefined ? channel.id : channel.guild.id;
        var Language = LanguageHandler.getLanguage(vars.Settings(guildID).Language);

        channel.send(Language.Reloaded);
    }
}

function OnExit(code, signal){
    HandleExit(code);
}

function HandleExit(exitCode){
    switch(exitCode){
        case 0:
        Client.user.setStatus("dnd");
        break;
        case 1: //Update
        Update();
        break;
        case 2:
        LogEntrace('Restarting Chino-chan..');
        RunBot();
        break;
        case 20:
        Client.user.setStatus("invisible").then((usr) => {
            process.exit(0);
        });
        break;
        default: //Restart
        LogEntrace('Restarting Chino-chan..');
        RunBot(exitCode.toString());
        break;
    }
}
function Update(){
    Updater.update();
    LogEntrace('Restarting Chino-chan...');
    RunBot();
}
function LogEntrace(Message){
    console.log(chalk.green('[Main] ') + Message);
    LogChannel.send({embed: createEmbed(0 << 16 | 150 << 8 | 0, Message, "Main")});
}
function LogBot(Message){
    console.log(chalk.cyan('[Bot] ') + Message);
    LogChannel.send({embed: createEmbed(255 << 16 | 255 << 8 | 0, Message, "Bot")});
}
function LogGit(Message){
    console.log(chalk.blue('[Git]' ) + Message);
    LogChannel.send({embed: createEmbed(0 << 16 | 0 << 8 | 200, Message, "Git")});
}
function LogIRC(Message){
    console.log(chalk.magenta('[IRC] ') + Message);
    LogChannel.send({embed: createEmbed(255 << 16 | 70 << 8 | 255, Message, "IRC")});
}
function LogError(Message){
    console.log(chalk.red('[ERROR] ') + Message);
    ErrorChannel.send({embed: createEmbed(255 << 16 | 0 << 8 | 50, Message, "Error")});
}
function createEmbed(Color, Message, Title){
    var Embed = new Discord.RichEmbed();
    Embed.setColor(Color);
    Embed.setDescription(Message);
    Embed.setTitle(Title);
    return Embed;
}