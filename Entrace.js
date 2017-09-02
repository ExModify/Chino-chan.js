var fs = require('fs');
if (fs.existsSync('lockMain')){
    var pid = fs.readFileSync('lockMain');
    try{
        if (process.kill(parseInt(pid), 0)){
            process.exit(772362);
        }
    }
    catch (excpt){
        if (excpt.code == "EPERM"){
            process.exit(772362);
        }
    }
}
if (fs.existsSync('lockMain'))
    fs.unlinkSync('lockMain');
fs.writeFileSync('lockMain', process.pid);

var ws = require('./modules/webserver.js');
ws.Start();

// Handling errors and rejections
process.on('uncaughtException', err => {
    ws.LogDeveloper('Error', err.stack);
});
process.on('unhandledRejection', (err, promise) => {
    ws.LogDeveloper('Error', err.stack);
});

// Module import & Var definition

const exec = require('child_process').exec;

var Process = undefined;

// Load informations

RunBot();
function RunBot(){
    if(Process !== undefined) {
        Process.kill();
    }
    Process = exec('node Chino-chan.js --color', {
        maxBuffer: 1000 * 1024
    });
    Process.stdout.on('data', async chunk => {
        var data = chunk.toString();
        var obj;
        try{
            obj = JSON.parse(data);
            ws.LogDeveloper(obj.type, obj.message);
        }catch(excpt){
            var message = data;
            var type = "Log"
            if (data.indexOf(': ') >= 0)
            {
                message = message.substring(message.indexOf(':') + 1, message.length - 1);
                type = message.substring(0, message.indexOf(':') + 1);
            }
            ws.LogDeveloper(type, message);
        }
        if (data.startsWith('Error: ')){
            ws.LogDeveloper(type, message);
        }
    });
    Process.on('exit', OnExit);
    ws.LogDeveloper('Main', 'Chino-chan started!');
}

function OnExit(code, signal){
    switch(code){
        case 10: // Multirun protection
        ws.LogDeveloper("Multirun", "Process stopped..");
        break;
        case 20: // Exit
        process.exit(1);
        break;
        case 30: // Restarting
        process.exit(2);
        break;
        default: // Reload
        ws.LogDeveloper('Main', 'Restarting Chino-chan..');
        RunBot();
        break;
    }
}
