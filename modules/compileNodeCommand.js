//TODO
var exec = require('child_process').exec;

module.exports = {
    execute: (command) => {
        return new Promise((res, rej) => {
            var proc = exec(`node -e ${command}`);
            var result = '';
            proc.stdout.on('data', chunk => {
                result += chunk.toString();
            });
            proc.stderr.on('data', chunk => {
                result += chunk.toString();
            });
            proc.on('close', (code, signal) => {
                res(result);
            });
        });
    }
};