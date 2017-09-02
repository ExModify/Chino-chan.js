const execSync = require('child_process').execSync;
const chalk = require('chalk');
const ws = require("./modules/webserver.js");

module.exports = {
    update: () => {
        console.log(JSON.stringify({
            type: "Git",
            message: "Searching for updates.."
        }));
        var output = execSync('git pull origin master').toString();
        if(output.toLowerCase().startsWith('already up-to-date')){
            console.log(JSON.stringify({
                type: "Git",
                message: "Already up-to-date!"
            }));
            return false;
        }else{
            console.log(JSON.stringify({
                type: "Git",
                message: "Updated!"
            }));
            return true;
        }

    }
};