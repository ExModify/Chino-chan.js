const execSync = require('child_process').execSync;
const chalk = require('chalk');
const ws = require("./modules/webserver.js");

module.exports = {
    update: () => {
        ws.LogDeveloper("Git", "Searching for updates..");
        var output = execSync('git pull origin master').toString();
        if(output.toLowerCase().startsWith('already up-to-date')){
            ws.LogDeveloper("Git", "Updated already");
            return false;
        }else{
            ws.LogDeveloper("Git", "Updated!");
            return true;
        }

    }
};