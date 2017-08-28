const clear = require('clear-module');

module.exports = (modulePath) => {
    var mod = modulePath;
    var resolvable = true;
    try{
        require.resolve(mod);
    }
    catch(Excpt){
        resolvable = false;
    }
    if(modulePath.startsWith('./') && !resolvable)
        mod = './../' + modulePath.substring(2);
    
    clear(require.resolve(mod));
    return require(require.resolve(mod));
}