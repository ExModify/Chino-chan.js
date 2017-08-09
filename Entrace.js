process.on('uncaughtException', err => {
    Send('Error', err.stack);
});
process.on('unhandledRejection', (err, promise) => {
    Send('Error', err.stack);
});

const fs = require('fs');
const crypto = require('crypto');
const chalk = require('chalk');
const exec = require('child_process').exec;
const Updater = require('./Update.js');
const vars = require('./global/vars.js');
vars.Load();

var BaseServer = require('websocket').server;
var http = require('http');

var clientConnection;
var allowed = false;

var Messages = [];

var HTTPServer = http.createServer((req, resp) => { // Will have a webpage
    resp.writeHead(404);
    resp.end();
});

HTTPServer.listen(2465, () => {
    Send('WS', "HTTP Server is binded to 2465!");
});

var WSServer = new BaseServer({
    httpServer: HTTPServer,
    autoAcceptConnections: false,
});

WSServer.on('request', (req) => { // Currently only for owner
    clientConnection = req.accept(null, req.origin);
    clientConnection.on('message', (data) => {
        if(data.type == "utf8"){
            var msg;
            try{
                msg = JSON.parse(data.utf8Data);
            }
            catch(exception){
                Send('WS', 'Got wrong JSON: ' + data.utf8Data);
                return;
            }
            if(msg.type == "credentials"){
                if(msg.username.trim() == vars.IRCUsername.trim()
                && msg.password == crypto.createHash('md5').update(vars.IRCPassword).digest("hex")){
                    clientConnection.sendUTF("Validate_Server_Connection_Request_Credentials_JSON_Accepted");
                    allowed = true;

                    clientConnection.closeDescription = "Reconnect";

                    Send('WS', "Client connected from: " + clientConnection.remoteAddress);
                    Messages.forEach((v, i, a) => {
                        clientConnection.sendUTF(v);
                    });
                }
                else{
                    clientConnection.closeDescription = "Validate_Server_Connection_Request_Credentials_JSON_Declined";
                    clientConnection.close();
                }
            }
            else if (msg.type == "message"){
                var command = msg.content.split(' ')[0];
                var parameter = msg.content.split(' ').slice(0, 1).join(' ');
                handleCommand(command, parameter);
            }
        }
    });

    clientConnection.sendUTF("Validate_Server_Connection_Request_Credentials_JSON");
});

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
            Send('IRC', message.substring(message.indexOf(' ')));
        else if (message.startsWith('Error: '))
            Send('Error', message.substring(message.indexOf(' ')));
        else if (message.startsWith('Git: '))
            Send('Git', message.substring(message.indexOf(' ')));
        else
            Send('Bot', message);
    });
    
    Process.on('exit', OnExit);
    Send('Main', 'Chino-chan started!');
}

function OnExit(code, signal){
    switch(code){
        case 1:
        Update();
        break;
        case 20:
        process.exit(1);
        break;
        default:
        Send('Main', 'Restarting Chino-chan..');
        RunBot();
        break;
    }
}

function Update(){
    Updater.update();
    Send('Main', 'Restarting Chino-chan...');
    RunBot();
}

function Send(type, Message){
    var Time = `[${GetTime()}]`;
    var Prefix = `[${type}]`;
    if(type == "WS"){
        console.log(chalk.blue(Time) + " " + chalk.yellow(Prefix) + " " + Message);
    }
    else if (type == "Error"){
        console.log(chalk.blue(Time) + " " + chalk.red(Prefix) + " " + Message);
    }
    else if (type == "IRC"){
        console.log(chalk.blue(Time) + " " + chalk.magenta(Prefix) + " " + Message);
    }
    else if (type == "Git"){
        console.log(chalk.blue(Time) + " " + chalk.green(Prefix) + " " + Message);
    }
    else if (type == "Bot"){
        console.log(chalk.blue(Time) + " " + chalk.cyan(Prefix) + " " + Message);
    }
    else if (type == "Main"){
        console.log(chalk.blue(Time) + " " + chalk.green(Prefix) + " " + Message);
    }
    if (clientConnection != undefined){
        if (clientConnection.connected && allowed){
            clientConnection.sendUTF(Time + " " + Prefix + " " + Message);
        }
    }
    Messages.push(Time + " " + Prefix + " " + Message);
}
function GetTime(){
    var date = new Date();
    return Form(date.getFullYear())
    + "." + Form(date.getMonth())
    + "." + Form(date.getDay())
    + ". " + Form(date.getHours())

    + ":" + Form(date.getMinutes()) 
    + ":" + Form(date.getSeconds());
}
function Form(value){
    if(value < 10)
        return "0" + value;
    else
        return value;
}

function handleCommand(command, parameter){
    if(command == "restart"){
        process.exit(2);
    }
}