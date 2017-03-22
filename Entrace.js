const fs = require('fs');
const chalk = require('chalk');
const exec = require('child_process').exec;
const Updater = require('./Update.js');

var Process = undefined;

LogEntrace('Starting ExMoBot...');
RunBot();

var Prefixes = {
    Bot: chalk.cyan('[Bot]'),
    IRC: chalk.blue('[IRC]'),
    Git: chalk.blue('[Git]'),
    Main: chalk.green('[Main]'),
    Error: chalk.red('[ERROR]')
};

function RunBot(){
    if(Process !== undefined)
    {     
        if(Process.connected)
        {
            Process.kill();
        }
    }
    Process = exec('node ExMoBot.js --color');
    Process.on('message', (data, sendHandle) => {
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
    Process.on('exit', (code, signal) => {
       HandleExit(code); 
    });
    LogEntrace('ExMoBot started!');
}

function HandleExit(exitCode){
    switch(exitCode){
        case 0: //Normal exit
        process.exit(0);
        break;
        case 1: //Update
        Update();
        break;
        default: //Restart
        LogEntrace('Restarting ExMoBot..');
        RunBot();
        break;
    }
}
function Update(){
    Updater.update();
    LogEntrace('Restarting ExMoBot..');
    RunBot();
}
function LogEntrace(Message){
    console.log(Prefixes.Main + ' ' + Message);
}
function LogBot(Message){
    console.log(Prefixes.Bot + ' ' + Message);
}
function LogGit(Message){
    console.log(Prefixes.Git + ' ' + Message);
}
function LogIRC(Message){
    console.log(Prefixes.IRC + ' ' + Message);
}
function LogError(Message){
    console.log(Prefixes.Error + ' ' + Message);
}