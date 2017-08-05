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

var Client = new Discord.Client();

var token = fs.readFileSync('D:\\txt\\APIToken\\DiscordToken.txt').toString();
var LanguageHandler = require('./modules/langHandler.js');

var LogChannel = undefined;
var ErrorChannel = undefined;

var run = true;

Client.on('ready', () => {
    if(Client.user.username !== 'Chino-chan')
        Client.user.setUsername('Chino-chan');
    Client.user.setStatus("dnd");

    LogChannel = Client.channels.get("341885484592791556");
    ErrorChannel = Client.channels.get("342619532613124109");

    run = true;
});
Client.on('message', (message) => {
    if (!isOwner(message.author.id)){
        return;
    }
    var Prefix = '$';
    var Language = LanguageHandler.getLanguage('en');

    if(hasPrefix(message, Prefix)){
        var spaceIndex = message.content.indexOf(' ');
        spaceIndex = spaceIndex < 0 ? message.content.length : spaceIndex;

        var command = message.content.substring(Prefix.length, spaceIndex).trim();

        if(command == "start"){
            RunBot();
        }
        else if (command == "stopHandler"){
            if(Process !== undefined){     
                message.channel.send(Language.ShutDownMessage).then(Msg => {
                    Client.user.setStatus("invisible").then((usr) => {
                        process.exit(0);
                    });
                });
            }
            else{
                Client.user.setStatus("invisible").then((user) => {
                    process.exit(0);
                });
            }
        }
        else if (command == "reload"){
            message.channel.send(Language.ReloadMessage).then(Msg => {
                Client.user.setStatus("dnd").then((usr) => {
                    RunBot();
                    message.channel.send(Language.Reloaded);
                });
            });
        }
    }
    
});

Client.login(token).then((token) => {
    RunBot();
});

function hasPrefix(message, prefix){
    return message.content.startsWith(prefix);
}

function RunBot(){
    if(Process !== undefined)
    {
        run = false;
        Process.kill();
    }
    Process = exec('node ExMoBot.js --color');
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
    LogEntrace('ExMoBot started!');
}

function OnExit(code, signal){
    if(!run)
        return;
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
        default: //Restart
        LogEntrace('Restarting Chino-chan..');
        RunBot();
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
function isOwner(id){
    return id == "193356184806227969";
}