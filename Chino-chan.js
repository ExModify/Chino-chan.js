process.on('uncaughtException', err => {
    console.log('Error: ' + err.stack);
    process.exit(2);
});
process.on('unhandledRejection', (reason, promise) => {
    console.log('Error: Promise Error: +' + reason.stack);
});

String.prototype.getPrepared = function (from, to) {
    var Prepared = this.toString();
    if(typeof from == "string"){
        while(Prepared.indexOf('%' + from.toUpperCase() + '%') >= 0){
            Prepared = Prepared.replace('%' + from.toUpperCase() + '%', to.toString());
        }
    }else if (Array.isArray(from) && Array.isArray(to)){
        if(from.length != to.length)
            return Prepared;

        from.forEach((v, i, a) => {
            while(Prepared.indexOf('%' + v.toUpperCase() + '%') >= 0){
                Prepared = Prepared.replace('%' + v.toUpperCase() + '%', to[i].toString());
            }
        });
    }
    return Prepared;
};

const Discord = require('discord.js');

var junkChannel;

Discord.TextChannel.prototype.sendImageEmbed = (file, type, channel) => {
    junkChannel.send({files:[file]}).then(Message => {
        channel.sendImageEmbedOnline(Message.attachments.first().url, type, channel, file);
    });
};
Discord.DMChannel.prototype.sendImageEmbed = (file, type, channel) => {
    junkChannel.send({files:[file]}).then(Message => {
        channel.sendImageEmbedOnline(Message.attachments.first().url, type, channel, file);
    });
};

Discord.TextChannel.prototype.sendImageEmbedOnline = (url, type, channel, file) => {
    var Embed = new Discord.RichEmbed();
    Embed.setImage(url.startsWith('//') ? "https:" + url : url);
    Embed.setColor(0 << 16 | 255 << 8 | 255);
    Embed.setTitle(type);
    if(type.toLowerCase() == "nsfw")
        Embed.setDescription("Filename: " + file.substring(file.lastIndexOf('\\') + 1));
    channel.send({embed:Embed});
};
Discord.DMChannel.prototype.sendImageEmbedOnline = (url, type, channel, file) => {
    var Embed = new Discord.RichEmbed();
    Embed.setImage(url.startsWith('//') ? "https:" + url : url);
    Embed.setColor(0 << 16 | 255 << 8 | 255);
    Embed.setTitle(type);
    if(type.toLowerCase() == "nsfw")
        Embed.setDescription("Filename: " + file.substring(file.lastIndexOf('\\') + 1));
    channel.send({embed:Embed});
};


const rerequire = require('./modules/rerequire.js');
const musicModule = require('./modules/musicModule.js');

var vars = require('./global/vars.js');

var Client = new Discord.Client();

var uptime = 0;

setInterval(() => {
    uptime++;
}, 1000);

Client.on('ready', () => {
    Client.user.setStatus("online");
    Client.user.setGame('with ExMo');
    vars.Load();
    junkChannel = Client.channels.get("342989459609878538");
});
Client.on('message', message => {
    if(message.content == "/gamerescape")
    {
        message.delete();
        message.channel.send(`\`${(message.member.nickname ? message.member.nickname : message.author.username)}\` ¯\\\_(ツ)_/¯`);
    }
    rerequire('./MessageHandler.js').handle(Client, message, uptime);
});

Client.login(vars.DiscordToken).then(token => {
    console.log("Chino-chan logged in!");
});