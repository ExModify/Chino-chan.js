var fs = require('fs');
if (fs.existsSync('lock')){
    var pid = fs.readFileSync('lock');
    try{
        if (process.kill(parseInt(pid), 0)) {
            process.exit(10);
        }
    }
    catch (excpt){
        if (excpt.code == "EPERM") {
            process.exit(10);
        }
    }
}
if (fs.existsSync('lock'))
    fs.unlinkSync('lock');
fs.writeFileSync('lock', process.pid);

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
var BaseClient = require('websocket').client;
var crypto = require('crypto');

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
    var Embed = new Discord.MessageEmbed();
    Embed.setImage(url.startsWith('//') ? "https:" + url : url);
    Embed.setColor(0 << 16 | 255 << 8 | 255);
    Embed.setTitle(type);
    if(type.toLowerCase() == "nsfw")
        Embed.setDescription("Filename: " + file.substring(file.lastIndexOf('\\') + 1));
    channel.send({embed:Embed});
};
Discord.DMChannel.prototype.sendImageEmbedOnline = (url, type, channel, file) => {
    var Embed = new Discord.MessageEmbed();
    Embed.setImage(url.startsWith('//') ? "https:" + url : url);
    Embed.setColor(0 << 16 | 255 << 8 | 255);
    Embed.setTitle(type);
    if(type.toLowerCase() == "nsfw")
        Embed.setDescription("Filename: " + file.substring(file.lastIndexOf('\\') + 1));
    channel.send({embed:Embed});
};


var musicModule = require('./modules/musicModule.js');
var waifucloud = require('./modules/waifuCloud.js');

var vars = require('./global/vars.js');

var msgHandler = require('./MessageHandler.js');

var WSConnection;
var WSClient = new BaseClient();

var Client = new Discord.Client();

Client.on('ready', () => {
    Client.user.setStatus("online");
    Client.user.setActivity("with ExMo");
    vars.Load();
    junkChannel = Client.channels.get("342989459609878538");

    WSClient.on("connect", (connection) => {
        connection.on("message", (message) => {
            if(message.type == "utf8"){
                var obj = undefined;
                try{
                    obj = JSON.parse(message.utf8Data);
                }
                catch(exception){
                    console.log(JSON.stringify({
                        type: "Error",
                        message: "Got wrong JSON: " + exception.stack + "\r\n" + message.utf8Data.toString()
                    }));
                    return;
                }
                if(obj.type == "SendDMMessage"){
                    var User = Client.users.get(obj.id);
                    User.createDM().then(channel => {
                        channel.send(obj.message);
                    });
                }
                if(obj.type == "SendMessage"){
                    var channel = Client.channels.get(obj.id);
                    channel.send(obj.message);
                }
            }
        });
        connection.sendUTF(JSON.stringify({
            type: "GuildCount",
            count: Client.guilds.size
        }));
        Client.guilds.forEach((guild, i, a) => {
            sendGuildInfo(guild, connection, "GuildAvailable");
        });
        connection.sendUTF(JSON.stringify({
            type: "ClientUsers",
            users: convertClientUsers(Client.users)
        }));
        WSConnection = connection;
    });
    WSClient.connect(vars.WSServer, "echo-protocol", crypto.createHash('sha1').update(crypto.createHash('md5').update(vars.IRCPassword).digest("hex")).digest("hex"));
    waifucloud.connect();
});
Client.on('message', message => {
    if(message.content == "/gamerescape") {
        message.delete();
        message.channel.send(`\`${(message.member.nickname ? message.member.nickname : message.author.username)}\` ¯\\\_(ツ)_/¯`);
    }
    msgHandler.handle(Client, message, waifucloud);
});

Client.login(vars.DiscordToken).then(token => {
    console.log(JSON.stringify({
        type: "Bot",
        message: "Chino-chan logged in!"
    }));
});

// WS Information sending
Client.on('channelCreate', channel => {
    if (!WSConnection)
        return;

    if(channel.type == "dm" || channel.type == "group" || channel.guild == undefined)
        return;

    var wsChannel = {
        guildID: channel.guild.id,
        id: channel.id,
        name: channel.name,
        permissionOverwrites: convertPermissionOverwrites(channel.permissionOverwrites)
    };

    if(channel.type == "text"){
        wsChannel.type = "NewTextChannel";
        wsChannel.topic = channel.topic;
        wsChannel.messages = [];
        wsChannel.typingUserIDs = [];
    }
    else{
        wsChannel.type = "NewVoiceChannel"
    }
    WSConnection.sendUTF(JSON.stringify(wsChannel));
});
Client.on("channelUpdate", (oldCh, newCh) => {
    if (!WSConnection)
        return;

    if(newCh.guild == undefined)
        return;

    if (newCh.type == "voice"){
        if(newCh.name == oldCh.name)
            return;

        WSConnection.sendUTF(JSON.stringify({
            type: "VoiceChannelUpdate",
            guildID: newCh.guild.id,
            id: newCh.id,
            name: newCh.name,
            permissionOverwrites: convertPermissionOverwrites(newCh.permissionOverwrites)
        }));
    }
    else if (newCh.type == "text"){
        if(newCh.name == oldCh.name && newCh.topic == oldCh.topic)
            return;
        WSConnection.sendUTF(JSON.stringify({
            type: "TextChannelUpdate",
            guildID: newCh.guild.id,
            id: newCh.id,
            name: newCh.name,
            topic: newCh.topic,
            permissionOverwrites: convertPermissionOverwrites(newCh.permissionOverwrites)
        }));
    }
});
Client.on('channelDelete', (channel) => {
    if (!WSConnection)
        return;

    if(channel.type == "dm" || channel.type == "group" || channel.guild == undefined)
        return;

    WSConnection.sendUTF(JSON.stringify({
        type: "ChannelDeleted",
        guildID: channel.guild.id,
        id: channel.id
    }));

});

Client.on("guildMemberAdd", member => {
    if (!WSConnection)
        return;

    WSConnection.sendUTF(JSON.stringify({
        type: "NewGuildMember",
        guildID: member.guild.id,
        userID: member.id,
        status: member.presence.status,
        game: member.presence.game,
        username: member.user.username,
        displayName: member.displayName,
        roles: member.roles.map((v, i, a) => v.id)
    }));
    
});
Client.on("guildMemberUpdate", (oldMem, newMem) => {
    if (!WSConnection)
        return;

    if (newMem.user.username == oldMem.user.username
     && newMem.displayName   == oldMem.displayName)
        return;
    WSConnection.sendUTF(JSON.stringify({
        type: "GuildMemberUpdate",
        guildID: newMem.guild.id,
        userID: newMem.id,
        status: newMem.presence.status,
        game: newMem.presence.game,
        userName: newMem.user.username,
        displayName: newMem.displayName,
        roles: newMem.roles.map((v, i, a) => v.id)
    }));
});
Client.on("presenceUpdate", (oldMem, newMem) => {
    if (!WSConnection)
        return;

    WSConnection.sendUTF(JSON.stringify({
        type: "GuildMemberPresenceUpdate",
        guildID: newMem.guild.id,
        userID: newMem.id,
        status: newMem.presence.status,
        game: newMem.presence.game
    }));
});
Client.on("guildMemberRemove", (remove) => {
    if (!WSConnection)
        return;

    WSConnection.sendUTF(JSON.stringify({
        type: "GuildMemberLeft",
        userID: remove.id,
        guildID: remove.guild.id
    }));
});

Client.on("guildBanAdd", (guild, user) => {
    if (!WSConnection)
        return;

    WSConnection.sendUTF(JSON.stringify({
        type: "NewBan",
        guildID: guild.id,
        userID: user.id,
        username: user.username
    }));
});
Client.on("guildBanRemove", (guild, user) => {
    if (!WSConnection)
        return;

    WSConnection.sendUTF(JSON.stringify({
        type: "RemoveBan",
        guildID: guild.id,
        userID: user.id
    }));
});

Client.on("guildCreate", (guild) => {
    if (!WSConnection)
        return;

    sendGuildInfo(guild, WSConnection, "NewGuild");
});
Client.on("guildUpdate", (oldGuild, newGuild) => {
    if (!WSConnection)
        return;

    sendGuildInfo(newGuild, WSConnection, "GuildUpdate");
});
Client.on("guildDelete", guild => {
    if (!WSConnection)
        return;

    WSConnection.sendUTF(JSON.stringify({
        type: "GuildRemove",
        id: guild.id
    }));
});


Client.on("message", (msg) => {
    if (!WSConnection)
        return;

    if(msg.channel.type == "dm" || msg.channel.type == "group")
        return;

    WSConnection.sendUTF(JSON.stringify({
        type: "NewMessage",
        id: msg.id,
        guildID: msg.guild.id,
        userID: msg.author.id,
        channelID: msg.channel.id,
        content: msg.content,
        attachments: convertAttachments(msg.attachments),
        embeds: convertEmbeds(msg.embeds),
        time: msg.createdAt.toJSON(),
        editedTime: msg.createdAt.toJSON()
    }));
});
Client.on("messageUpdate", (oldMsg, newMsg) => {
    if (!WSConnection)
        return;

    if(oldMsg.channel.type == "dm" || oldMsg.channel.type == "group" || newMsg.editedAt == undefined)
        return;

    WSConnection.sendUTF(JSON.stringify({
        type: "MessageUpdated",
        id: newMsg.id,
        channelID: newMsg.channel.id,
        guildID: newMsg.guild.id,
        content: newMsg.content,
        attachments: convertAttachments(newMsg.attachments),
        embeds: convertEmbeds(newMsg.embeds),
        editedTime: newMsg.editedAt.toJSON()
    }));
});
Client.on("messageDelete", (msg) => {
    if (!WSConnection)
        return;

    if(msg.channel.type == "dm" || msg.channel.type == "group" || msg.guild == undefined)
        return;
    WSConnection.sendUTF(JSON.stringify({
        type: "MessageDelete",
        id: msg.id,
        guildID: msg.guild.id,
        channelID: msg.channel.id
    }));
});

Client.on("roleCreate", (role) => {
    if (!WSConnection)
        return;

    WSConnection.sendUTF(JSON.stringify({
        type: "RoleCreate",
        guildID: role.guild.id,
        name: role.name,
        id: role.id,
        mentionable: role.mentionable,
        permissions: role.permissions,
        color: role.color
    }));
});
Client.on("roleUpdate", (oldRole, newRole) => {
    if (!WSConnection)
        return;

    WSConnection.sendUTF(JSON.stringify({
        type: "RoleUpdate",
        name: newRole.name,
        guildID: newRole.guild.id,
        id: newRole.id,
        mentionable: newRole.mentionable,
        permissions: newRole.permissions,
        color: newRole.color
    }));
});
Client.on("roleDelete", (role) => {
    if (!WSConnection)
        return;

    WSConnection.sendUTF(JSON.stringify({
        type: "RoleDeleted",
        guildID: role.guild.id,
        id: role.id
    }));
});


Client.on("typingStart", (channel, user) => {
    if (!WSConnection)
        return;

    if(channel.type == "dm" || channel.type == "group" || channel.guild == undefined)
        return;

    WSConnection.sendUTF(JSON.stringify({
        type: "TypingStarted",
        guildID: channel.guild.id,
        channelID: channel.id,
        userID: user.id
    }));
});
Client.on("typingStop", (channel, user) => {
    if (!WSConnection)
        return;

    if(channel.type == "dm" || channel.type == "group" || channel.guild == undefined)
        return;

    WSConnection.sendUTF(JSON.stringify({
        type: "TypingStopped",
        guildID: channel.guild.id,
        channelID: channel.id,
        userID: user.id
    }));
});


function convertMembers(users) {
    var Users = [];

    if(users.length == 0)
        return Users;

    users.forEach((v, i, a) => {
        Users.push({
            userID: v.id,
            username: v.user.username,
            displayName: v.displayName,
            status: v.presence.status,
            game: v.presence.game,
            roleIDs: v.roles.map((val, ind, arr) => val.id),
            typing: v.typing
        });
    });

    return Users;
}
function convertClientUsers(users) {
    var Users = [];

    if(users.length == 0)
        return Users;

    users.forEach((v, i, a) => {
        Users.push({
            userID: v.id,
            username: v.username,
            status: v.presence.status,
            game: v.presence.game
        });
    });

    return Users;
}
/*
function convertChannels(channels) {
    var Channels = [];
    if(channels.length == 0)
        return Channels;

    channels.forEach((v, i, a) => {
        var channel = {
            id: v.id,
            name: v.name,
            type: v.type,
            permissionOverwrites: convertPermissionOverwrites(v.permissionOverwrites)
        };
        if(channel.type == "text")
        {
            channel.topic = v.topic;
            channel.messages = [];
            channel.typingUserIDs = [];
        }
        Channels.push(channel);
    });
    return Channels;
}
*/
function convertChannels(channels) {
    var textChannels = [];
    var voiceChannels = [];
    if(channels.length == 0)
        return [];

    channels.forEach((v, i, a) => {
        var channel = {
            id: v.id,
            name: v.name,
            type: v.type,
            permissionOverwrites: convertPermissionOverwrites(v.permissionOverwrites)
        };
        if(channel.type == "text")
        {
            channel.topic = v.topic;
            channel.messages = [];
            channel.typingUserIDs = [];

            textChannels.push(channel);
        }
        else{
            voiceChannels.push(channel);
        }
    });
    return {
        textChannels: textChannels,
        voiceChannels: voiceChannels
    };
}
function convertRoles(roles) {
    var Roles = [];
    if(roles.size == 0)
        return Roles;

    roles.forEach((v, i, a) => {
        Roles.push(convertRole(v));
    });

    return Roles;
}
function convertAttachments(attachments) {
    var Attachments = [];
    if(attachments.length == 0)
        return Attachments;
    attachments.forEach((v, i, a) => {
        Attachments.push({
            filename: v.filename,
            filesize: v.filesize,
            url: v.url
        });
    });
    return Attachments;
}
function convertEmbeds(embeds) {
    var Embeds = [];
    
    if(embeds.length == 0)
        return Embeds;

    embeds.forEach((v, i, a) => {
        var Embed = {};
        if (v.author != undefined){
            Embed.author = {
                iconURL: v.author.iconURL,
                url: v.author.url,
                name: v.author.name
            };
        }
        if (v.color != undefined){
            Embed.color = v.color;
        }
        if (v.description != undefined){
            Embed.description = v.description;
        }
        if (v.fields != undefined){
            Embed.fields = [];
            v.fields.forEach((v, i, a) => {
                Embed.fields.push(convertField(v));
            });
        }
        if (v.footer != undefined){
            Embed.footer = {
                iconURL: v.footer.iconURL,
                text: v.footer.text
            }
        }
        if (v.image != undefined){
            Embed.image = v.image.url;
        }
        if (v.thumbnail != undefined){
            Embed.thumbnail = v.thumbnail.url;
        }
        if (v.title != undefined){
            Embed.title = v.title;
        }
        if (v.video != undefined){
            Embed.video = v.video.url;
        }
        Embeds.push(Embed);
    });
    return Embeds;
}
function convertBans(bans){
    var Bans = [];
    if(bans.size > 0){
        bans.forEach((v, i, a) => {
            Bans.push({
                id: v.id,
                username: v.username
            });
        });
    }
    return Bans;
}
function sendGuildInfo(guild, connection, type){
    var chns = convertChannels(guild.channels);
    if (guild.members.get(Client.user.id).hasPermission("BAN_MEMBERS") ||
        guild.members.get(Client.user.id).hasPermission("ADMINISTRATOR")){
        guild.fetchBans().then(Bans => {
            connection.sendUTF(JSON.stringify({
                type: type,
                users: convertMembers(guild.members),
                textChannels: chns.textChannels,
                voiceChannels: chns.voiceChannels,
                roles: convertRoles(guild.roles),
                bans: convertBans(Bans),
                name: guild.name,
                icon: guild.iconURL,
                guildID: guild.id,
                ownerID: guild.ownerID,
                region: guild.region
            }));
        });
    }
    else{
        connection.sendUTF(JSON.stringify({
            type: type,
            users: convertMembers(guild.members),
            textChannels: chns.textChannels,
            voiceChannels: chns.voiceChannels,
            roles: convertRoles(guild.roles),
            bans: [],
            name: guild.name,
            icon: guild.iconURL,
            guildID: guild.id,
            ownerID: guild.ownerID,
            region: guild.region
        }));
    }
}

function convertRole(role) {
    var Role = {
        name: role.name,
        id: role.id,
        mentionable: role.mentionable,
        permissions: role.permissions,
        color: role.color
    };
    return Role;
}
function convertField(field){
    // field: inline, name, value
    return {
        inline: field.inline,
        name: field.name,
        value: field.value
    };
}

function convertPermissionOverwrites(pw){
    if (pw.size == 0)
        return [];

    var permissionOverwrites = [];
    pw.forEach((v, i, a) => {
        permissionOverwrites.push({
            id: v.id,
            allow: v.allowed.bitfield,
            deny: v.denied.bitfield,
            type: v.type
        });
    });

    return permissionOverwrites;
}