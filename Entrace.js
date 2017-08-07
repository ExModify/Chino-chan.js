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

var Process = undefined;

RunBot();

function RunBot(){
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
}

function OnExit(code, signal){
    switch(code){
        case 0:
        RunBot();
        break;
        case 1:
        Update();
        break;
        case 2:
        LogEntrace('Restarting Chino-chan..');
        RunBot();
        break;
        case 20:
        process.exit(0);
        break;
        default:
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
}
function LogBot(Message){
    console.log(chalk.cyan('[Bot] ') + Message);
}
function LogGit(Message){
    console.log(chalk.blue('[Git]' ) + Message);
}
function LogIRC(Message){
    console.log(chalk.magenta('[IRC] ') + Message);
}
function LogError(Message){
    console.log(chalk.red('[ERROR] ') + Message);
}