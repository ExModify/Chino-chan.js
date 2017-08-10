const execSync = require('child_process').execSync;
const chalk = require('chalk');

module.exports = {
    update: () => {
        console.log(chalk.yellow('[Updater]') + ' Searching for updates...');
        var output = execSync('git pull origin master').toString();
        console.log(output);
        if(output.toLowerCase().indexOf('everything is up-to-date') >= 0){
            console.log(chalk.yellow('[Updater]') + ' No update found!');
            return false;
        }else{
            console.log(chalk.yellow('[Updater]') + ' Bot is updated!');
            return true;
        }

    }
};