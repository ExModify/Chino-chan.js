var ws = require('./modules/webserver.js');
ws.Start();

// Handling errors and rejections
process.on('uncaughtException', err => {
    ws.LogDeveloper('Error', err.stack);
});
process.on('unhandledRejection', (err, promise) => {
    Send('Error', err.stack);
});

// Module import & Var definition

const exec = require('child_process').exec;

var Process = undefined;

// Load informations

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
            ws.LogDeveloper('IRC', message.substring(message.indexOf(' ')));
        else if (message.startsWith('Error: '))
            ws.LogDeveloper('Error', message.substring(message.indexOf(' ')));
        else if (message.startsWith('Git: '))
            ws.LogDeveloper('Git', message.substring(message.indexOf(' ')));
        else if (message.startsWith("Bot: "))
            ws.LogDeveloper('Bot', message.substring(message.indexOf(' ')));
        else
            console.log(message);
    });
    
    Process.on('exit', OnExit);
    ws.LogDeveloper('Main', 'Chino-chan started!');
}

function OnExit(code, signal){
    switch(code){
        case 20:
        process.exit(1);
        break;
        case 30:
        process.exit(2);
        break;
        default:
        ws.LogDeveloper('Main', 'Restarting Chino-chan..');
        RunBot();
        break;
    }
}
