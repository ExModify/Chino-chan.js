const execSync = require('child_process').execSync;
const chalk = require('chalk');

module.exports = {
    update: () => {
        console.log('Git: Searching for updates...');
        var output = execSync('git pull origin master').toString();
        if(output.toLowerCase().startsWith('already up-to-date')){
            console.log('Git: No update found!');
            return false;
        }else{
            console.log('Git: Bot is updated!');
            return true;
        }

    }
};