//The entire logic is from legekka, I just implemented it, because it can be very useful, because this environment what I use now can't really handle the changes, so I had to restart the whole bot, but now, it's enough to call this method :v
module.exports = (modulePath) => {
    var module = '';
    if(modulePath.startsWith('./'))
        module = './../' + modulePath.substring(1);
    else
        module = modulePath;
    
    delete require.cache[require.resolve(module)];
    return require(module);
}