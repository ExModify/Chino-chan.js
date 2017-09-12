var BaseServer = require('websocket').server;
var http = require('http');
const fs = require('fs');
var url = require('url');
var vars = require('./../global/vars.js');
var crypto = require('crypto');
const chalk = require('chalk');
var EventEmitter = require('events').EventEmitter;

var event = new EventEmitter();

var Chino_chan = undefined;
var ClientConnections = [];

var guildReadyCount = -1;

var Guilds = new Map();
var Users = new Map();

var Logs = [];

var HTTPServer = http.createServer((req, resp) => { // Will have a webpage
    var reqFor = url.parse(req.url).pathname;

    LogOwner("HTML", req.connection.remoteAddress + " requested for " + reqFor);

    resp.write(fs.readFileSync('webpage/index.html').toString());
    resp.end();
    return;

    fs.readFile('webpage' + reqFor, (err, data) => {
        if (err) {
            resp.writeHead(404, { 'Content-Type': 'text/html' });
            resp.write("Not found");
        }
        else {
            resp.writeHead(200, { 'Content-Type': 'text/html' });
            resp.write(data.toString());
        }
        resp.end();
    });
});

var WSServer = new BaseServer({
    httpServer: HTTPServer,
    autoAcceptConnections: false,
});

WSServer.on('request', (req) => {
    if (IsChinoOrigin(req.origin)) {
        Chino_chan = req.accept("echo-protocol", req.origin);
        Chino_chan.on("message", (data) => {
            var Ids = new Array(Guilds.keys());
            if (data.type == "utf8") {
                var json = JSON.parse(data.utf8Data);
                if (json.type == "GuildCount") {
                    if (guildReadyCount != -2) {
                        guildReadyCount = json.count;
                        if (Guilds.size == guildReadyCount) {
                            LogOwner("WS", "Ready to handle connections!");
                            guildReadyCount = -2;
                        }
                    }
                }
                else if (json.type == "GuildAvailable" || json.type == "NewGuild") {
                    Guilds.set(json.guildID, {
                        users: json.users,
                        textChannels: json.textChannels,
                        voiceChannels: json.voiceChannels,
                        roles: json.roles,
                        bans: json.bans,
                        name: json.name,
                        icon: json.icon,
                        guildID: json.guildID,
                        ownerID: json.ownerID,
                        region: json.region
                    });
                    if (guildReadyCount != -2) {
                        guildReadyCount = json.count;
                        if (Guilds.size == guildReadyCount) {
                            LogOwner("WS", "Ready to handle connections!");
                            guildReadyCount = -2;
                        }
                    }
                }
                else if (json.type == "ClientUsers"){
                    json.users.forEach((v, i, a) => {
                        Users.set(v.userID, v);
                    });
                }
                else if (json.type == "NewTextChannel") {
                    if (Guilds.has(json.guildID))
                        return;

                    var channel = {
                        name: json.name,
                        id: json.id,
                        topic: json.topic,
                        type: "text",
                        messages: json.messages,
                        typingUserIDs: json.typingUserIDs,
                        permissionOverwrites: json.permissionOverwrites
                    };
                    Guilds.get(json.guildID).textChannels.push(channel);
                }
                else if (json.type == "NewVoiceChannel"){
                    if (Guilds.has(json.guildID))
                        return;

                    var channel = {
                        name: json.name,
                        id: json.id,
                        type: "voice",
                        permissionOverwrites: json.permissionOverwrites
                    };
                    Guilds.get(json.guildID).voiceChannels.push(channel);
                }
                else if (json.type == "TextChannelUpdate") {
                    var guild = Guilds.get(json.guildID);

                    if (!guild)
                        return;

                    var channelIndex = guild.textChannels.findIndex((v, i, a) => v.id == json.id);

                    if (channelIndex == -1)
                        return;

                    Guilds.get(json.guildID).textChannels[channelIndex].name = json.name;
                    Guilds.get(json.guildID).textChannels[channelIndex].topic = json.topic;
                    Guilds.get(json.guildID).textChannels[channelIndex].permissionOverwrites = json.permissionOverwrites;
                }
                else if (json.type == "VoiceChannelUpdate"){
                    var guild = Guilds.get(json.guildID);

                    if (!guild)
                        return;

                    var channelIndex = guild.voiceChannels.findIndex((v, i, a) => v.id == json.id);

                    if (channelIndex == -1)
                        return;

                    Guilds.get(json.guildID).voiceChannels[channelIndex].name = json.name;
                    Guilds.get(json.guildID).voiceChannels[channelIndex].permissionOverwrites = json.permissionOverwrites;
                }
                else if (json.type == "ChannelDeleted") {
                    var guild = Guilds.get(json.guildID);

                    if (!guild)
                        return;

                    var channelIndex = guild.textChannels.findIndex((v, i, a) => v.id == json.id);

                    if (channelIndex < 0){
                        channelIndex = guild.voiceChannels.findIndex((v, i, a) => v.id == json.id);
                        
                        if (channelIndex < 0){
                            return;
                        }
                        else{
                            Guilds.get(json.guildID).voiceChannels.splice(channelIndex, 1);
                        }
                    }
                    else{
                        Guilds.get(json.guildID).textChannels.splice(channelIndex, 1);
                    }
                }

                else if (json.type == "NewGuildMember" || json.type == "GuildMemberUpdate") {
                    if (Guilds.has(json.guildID))
                        return;

                    var user = {
                        userID: json.userID,
                        username: json.username,
                        displayName: json.displayName,
                        status: json.status,
                        game: json.game,
                        roleIDs: json.roleIDs
                    };

                    if (!Users.has(json.userID))
                        Users.set(json.userID, user);

                    if (json.type == "NewGuildMember") {
                        Guilds.get(json.guildID).users.push(user);
                    }
                    else {
                        var userIndex = Guilds.get(json.guildID).users.findIndex((v, i, a) => v.userID = json.userID);

                        if (userIndex == -1)
                            return;

                        Guilds.get(json.guildID).users[userID] = user;
                    }

                }
                else if (json.type == "GuildMemberPresenceUpdate") {
                    var guild = Guilds.get(json.guildID);

                    if (!guild)
                        return;

                    var userIndex = guild.users.findIndex((v, i, a) => v.userID = json.userID);

                    if (userIndex == -1)
                        return;

                    Guilds.get(json.guildID).users[userIndex].status = json.status;
                    Guilds.get(json.guildID).users[userIndex].game = json.game;
                }
                else if (json.type == "GuildMemberLeft") {
                    var guild = Guilds.get(json.guildID);

                    if (!guild)
                        return;

                    var userIndex = guild.users.findIndex((v, i, a) => v.userID = json.userID);

                    if (userIndex == -1)
                        return;

                    Guilds.get(json.guildID).users.splice(userIndex, 1);
                }

                else if (json.type == "NewBan") {
                    if (Guilds.has(json.guildID))
                        return;

                    Guilds.get(json.guildID).bans.push({
                        id: json.userID,
                        username: json.username
                    });
                }
                else if (json.type == "RemoveBan") {
                    var guild = Guilds.get(json.guildID);

                    if (!guild)
                        return;

                    var banIndex = guild.bans.findIndex((v, i, a) => v.id = json.userID);

                    if (banIndex == -1)
                        return;

                    Guilds.get(json.guildID).bans.splice(banIndex, 1);
                }

                else if (json.type == "GuildRemove") {
                    if (Ids.indexOf(json.id) > 0) {
                        Guilds.delete(json.id);
                    }
                }

                else if (json.type == "NewMessage") {
                    var guild = Guilds.get(json.guildID);

                    if (!guild)
                        return;

                    var channelIndex = guild.textChannels.findIndex((v, i, a) => v.id = json.channelID);

                    if (channelIndex == -1)
                        return;

                    Guilds.get(json.guildID).textChannels[channelIndex].messages.push({
                        id: json.id,
                        userID: json.userID,
                        content: json.content,
                        attachments: json.attachments,
                        embeds: json.embeds,
                        time: new Date(json.time)
                    });
                }
                else if (json.type == "MessageUpdated") {
                    var guild = Guilds.get(json.guildID);

                    if (!guild)
                        return;

                    var channelIndex = guild.textChannels.findIndex((v, i, a) => v.id = json.channelID);

                    if (channelIndex == -1)
                        return;

                    var messageIndex = guild.textChannels[channelIndex].messages.findIndex((v, i, a) => v.id == json.id);

                    if (messageIndex == -1)
                        return;

                    Guilds.get(json.guildID).textChannels[channelIndex].messages[messageIndex].content = json.content;
                    Guilds.get(json.guildID).textChannels[channelIndex].messages[messageIndex].attachments = json.attachments;
                    Guilds.get(json.guildID).textChannels[channelIndex].messages[messageIndex].embeds = json.embeds;
                    Guilds.get(json.guildID).textChannels[channelIndex].messages[messageIndex].editedTime = new Date(json.editedTime)
                }
                else if (json.type == "MessageDelete") {
                    var guild = Guilds.get(json.guildID);

                    if (!guild)
                        return;

                    var channelIndex = guild.textChannels.findIndex((v, i, a) => v.id = json.channelID);

                    if (channelIndex == -1)
                        return;

                    var messageIndex = guild.textChannels[channelIndex].messages.findIndex((v, i, a) => v.id == json.id);

                    if (messageIndex == -1)
                        return;

                    Guilds.get(json.guildID).textChannels[channelIndex].messages.splice(messageIndex, 1);
                }

                else if (json.type == "RoleCreate") {
                    var guild = Guilds.get(json.guildID);

                    if (!guild)
                        return;

                    Guilds.get(json.guildID).roles.push({
                        name: json.name,
                        id: json.id,
                        mentionable: json.mentionable,
                        permissions: json.permissions,
                        color: json.color
                    });
                }
                else if (json.type == "RoleUpdate") {
                    var guild = Guilds.get(json.guildID);

                    if (!guild)
                        return;

                    var roleIndex = guild.roles.findIndex((v, i, a) => v.id == json.id);

                    var role = {
                        name: json.name,
                        id: json.id,
                        mentionable: json.mentionable,
                        permissions: json.permissions,
                        color: json.color
                    };

                    if (roleIndex == -1) {
                        Guilds.get(json.guildID).roles.push(role);
                    }
                    else {
                        Guilds.get(json.guildID).roles[roleIndex] = role;
                    }
                }
                else if (json.type == "RoleDeleted") {
                    var guild = Guilds.get(json.guildID);

                    if (!guild)
                        return;

                    var roleIndex = guild.roles.findIndex((v, i, a) => v.id == json.id);

                    if (roleIndex > -1) {
                        Guilds.get(json.guildID).roles.splice(roleIndex, 1);
                    }
                }

                else if (json.type == "TypingStarted") {
                    var guild = Guilds.get(json.guildID);

                    if (!guild)
                        return;

                    var channelIndex = guild.textChannels.findIndex((v, i, a) => v.id == json.channelID);

                    if (channelIndex == -1)
                        return;

                    Guilds.get(json.guildID).textChannels[channelIndex].typingUserIDs.push(json.userID);
                }
                else if (json.type == "TypingStopped") {
                    var guild = Guilds.get(json.guildID);

                    if (!guild)
                        return;

                    var channelIndex = Guilds.get(json.guildID).textChannels.findIndex((v, i, a) => v.id == json.channelID);

                    if (channelIndex == -1)
                        return;

                    Guilds.get(json.guildID).textChannels[channelIndex].typingUserIDs.splice(json.userID, 1);
                }
                ClientConnections.forEach((connection, i, a) => {
                    if (connection.auth){
                        connection.client.sendUTF(JSON.stringify({
                            type: json.type,
                            data: data.utf8Data
                        }));
                    }
                });
            }
        });
        LogOwner("WS", "Chino-chan connected");
        return;
    }
    var Connection = {
        client: req.accept(null, req.origin),
        auth: false,
        name: "",
        level: 0,
        adminAt: [],
        arrayIndex: ClientConnections.length - 1
    };
    Connection.client.on('message', (data) => {
        if (data.type == "utf8") {
            var msg;
            try {
                msg = JSON.parse(data.utf8Data);
            }
            catch (exception) {
                Connection.client.sendUTF(JSON.stringify({
                    type: "Error",
                    data: JSON.stringify({
                        message: "Wrong_Message_Provided",
                        error: exception.stack
                    })
                }));
                return;
            }
            if (msg.type == "Credentials") {
                var creds;
                try {
                    creds = JSON.parse(msg.data);
                }
                catch (excpt) {
                    Connection.client.sendUTF(JSON.stringify({
                        type: "Credentials",
                        data: JSON.stringify({
                            message: "Wrong_Message_Provided",
                            error: excpt.stack
                        })
                    }));
                    return;
                }
                var userID = creds.userID;
                var passwordHash = creds.password;
                if (userID == undefined || passwordHash == undefined) {
                    Connection.client.sendUTF(JSON.stringify({
                        type: "Credentials",
                        data: JSON.stringify({
                            message: "Wrong_Message_Provided",
                            error: "Missing UserID or Password Hash!"
                        })
                    }));
                    return;
                }
                else {
                    if (vars.HasAnyAdmin(userID)) {
                        if (passwordHash.trim() == "") {
                            Connection.client.sendUTF(JSON.stringify({
                                type: "Credentials",
                                data: JSON.stringify({
                                    message: "Wrong_Message_Provided",
                                    error: "Missing UserID or Password Hash!"
                                })
                            }));
                        }
                        else {
                            var Credentials = vars.GetLoginCredentials(userID);
                            if (crypto.createHash('md5').update(Credentials.password).digest("hex") == passwordHash) {
                                Connection.client.sendUTF(JSON.stringify({
                                    type: "Credentials",
                                    data: JSON.stringify({
                                        message: "Auth_Accepted"
                                    })
                                }));

                                Connection.auth = true;
                                Connection.name = Users.get(userID).username;

                                if (vars.IsOwner(userID)) {
                                    Connection.level = 3;
                                    SendSpecified(Connection, "Message", "Welcome here~");
                                    Logs.forEach((v, i, a) => {
                                        Connection.client.sendUTF(JSON.stringify({
                                            type: "Log",
                                            data: JSON.stringify({
                                                message: v
                                            })
                                        }));
                                    });
                                }
                                else if (vars.IsGlobalAdmin(userID)) {
                                    Connection.level = 2;
                                }
                                else {
                                    Connection.adminAt = vars.GetAdminIDs(userID);
                                    Connection.level = 1;
                                }

                                sendDiscordDMMessage(userID, "Logged into Chino-chan webserver with IP: " + Connection.client.remoteAddress);

                                Connection.client.sendUTF(JSON.stringify({
                                    type: "UserInformation",
                                    data: JSON.stringify({
                                        level: Connection.level,
                                        availableGuilds: Connection.adminAt,
                                        name: Connection.name
                                    })
                                }));
                                var guildsToSend = [];
                                if (Connection.adminAt.length == 0){
                                    Guilds.forEach((v, k, a) => {
                                        guildsToSend.push(v);
                                    });
                                }
                                else{
                                    Connection.adminAt.forEach((v, i, a) => {
                                        guildsToSend.push(Guilds.get(v));
                                    });
                                }

                                Connection.client.sendUTF(JSON.stringify({
                                    type: "DiscordInformation",
                                    data: JSON.stringify(guildsToSend)
                                }));
                            }
                            else {
                                Connection.client.sendUTF(JSON.stringify({
                                    type: "Credentials",
                                    data: JSON.stringify({
                                        message: "Auth_Declined"
                                    })
                                }));
                                Connection.client.close();
                            }
                        }
                    }
                }
            }
            else if (msg.type == "Message") {
                if (msg.data.startsWith('!')) {
                    var command = msg.data.split(' ')[0].substring(1);
                    var parameter = msg.data.split(' ').splice(0, 1).join(' ');
                    handleCommand(Connection, command, paramter)
                }
                else {
                    SendAll("Chat", Connection.name, msg.data);
                }
            }
            else if (msg.type == "DiscordChannelMessage"){
                var msgContent;
                try {
                    msgContent = JSON.parse(msg.data);
                }
                catch (excpt) {
                    Connection.client.sendUTF(JSON.stringify({
                        type: "Error",
                        data: JSON.stringify({
                            message: "Wrong_Message_Provided",
                            error: excpt.stack
                        })
                    }));
                    return;
                }
                sendDiscordChannelMessage(msgContent.id, msgContent.message);
            }
            else if (msg.type == "RequestDiscordInfo"){
                let info;
                let requestedObject;
                try{
                    info = JSON.parse(msg.data);
                }
                catch(e) {
                    Connection.client.sendUTF(JSON.stringify({
                        type: "Error",
                        data: JSON.stringify({
                            message: "Wrong_Message_Provided",
                            error: e.stack
                        })
                    }));
                }
                if (info.type == "Guild"){
                    requestedObject = Guilds.get(info.id);
                    if (requestedObject){
                        Connection.client.sendUTF(JSON.stringify({
                            type: "Guild",
                            success: true,
                            data: JSON.stringify(requestedObject)
                        }));
                    }
                    else{
                        Connection.client.sendUTF(JSON.stringify({
                            type: "Guild",
                            success: false,
                            data: "NotFound"
                        }));
                    }
                }
            }
        }
    });
    Connection.client.on('close', (number, desc) => {
        LogOwner("WS", Connection.name + " has been disconnected!");
        ClientConnections.splice(Connection.arrayIndex, 1);
        for (var i = Connection.arrayIndex; i < ClientConnections.length; i++) {
            if (ClientConnections[i] != undefined)
                ClientConnections[i].arrayIndex--;
        }
        if (ClientConnections.length == 0){
            event.emit("everyoneDisconnected");
        }
    });

    ClientConnections.push(Connection);
    Connection.client.sendUTF(JSON.stringify({
        type: "Credentials",
        data: JSON.stringify({
            message: "Auth_Requested"
        })
    }));
});

module.exports = {
    Start: () => {
        HTTPServer.listen(2465, () => {
            LogOwner('WS', "HTTP Server is binded to 2465!");
        })
    },
    LogDeveloper: (type, Message) => LogOwner(type, Message)
};

function handleCommand(client, command, parameter) {
    if (command == "restart" && client.level == 3) {
        ClientConnections.forEach((v, i, a) => {
            v.client.sendUTF(JSON.stringify({
                type: "WebSocket",
                data: JSON.stringify({
                    message: "Restarting_WebSocket_Server"
                })
            }));
        });
        event.once("everyoneDisconnected", () => {
            process.exit(2)
        });
        setTimeout(() => {
            DisconnectEveryone();
        }, 2000);
    }
}

function SendSpecified(connection, type, message) {
    LogOwner("WS", `Said to ${connection.name}: ${message}`);
    var Time = `[${GetTime()}]`;
    var Prefix = `[${type}]`;
    connection.client.sendUTF(JSON.stringify({
        type: "Message",
        data: JSON.stringify({
            message: `${Time} ${Prefix} ${message}`
        })
    }));
}

function SendAll(type, who, message) {
    LogConsole("WS", who + " said: " + message);
    var Time = `[${GetTime()}]`;
    var Prefix = `[${type}]`;
    ClientConnections.forEach((v, i, a) => {
        v.client.sendUTF(JSON.stringify({
            type: "Message",
            data: JSON.stringify({
                message: `${Time} ${Prefix} ${who}: ${message}`
            })
        }));
    });
}

function LogOwner(type, Message) {
    LogConsole(type, Message);
    var Time = `[${GetTime()}]`;
    var Prefix = `[${type}]`;
    var connection = getOwner();
    if (connection != undefined) {
        if (connection.connected) {
            connection.sendUTF({
                type: "Log",
                data: JSON.stringify({
                    message: Time + " " + Prefix + " " + Message
                })
            });
        }
    }
    Logs.push(Time + " " + Prefix + " " + Message);
}
function LogConsole(type, Message) {
    var Time = `[${GetTime()}]`;
    var Prefix = `[${type}]`;
    if (type == "WS") {
        console.log(chalk.blue(Time) + " " + chalk.yellow(Prefix) + " " + Message);
    }
    else if (type == "Error") {
        console.log(chalk.blue(Time) + " " + chalk.red(Prefix) + " " + Message);
    }
    else if (type == "IRC") {
        console.log(chalk.blue(Time) + " " + chalk.magenta(Prefix) + " " + Message);
    }
    else if (type == "Git") {
        console.log(chalk.blue(Time) + " " + chalk.yellow(Prefix) + " " + Message);
    }
    else if (type == "Bot") {
        console.log(chalk.blue(Time) + " " + chalk.cyan(Prefix) + " " + Message);
    }
    else if (type == "Main") {
        console.log(chalk.blue(Time) + " " + chalk.green(Prefix) + " " + Message);
    }
    else if (type == "HTML") {
        console.log(chalk.blue(Time) + " " + chalk.green(Prefix) + " " + Message);
    }
    else if (type = "WaifuCloud") {
        console.log(chalk.blue(Time) + " " + chalk.magenta(Prefix) + " " + Message);
    }
}

function GetTime() {
    var date = new Date();
    return Form(date.getFullYear())
        + "." + Form(date.getMonth() + 1)
        + "." + Form(date.getDate())

        + ". " + Form(date.getHours())
        + ":" + Form(date.getMinutes())
        + ":" + Form(date.getSeconds());
}
function Form(value) {
    if (value < 10)
        return "0" + value;
    else
        return value;
}

function IsChinoOrigin(value) {
    return value == crypto.createHash('sha1').update(crypto.createHash('md5').update(vars.IRCPassword).digest("hex")).digest("hex");
}
function getOwner() {
    var index = ClientConnections.findIndex((v, i, a) => {
        return v.level == 3;
    });
    if (index == -1)
        return undefined;
    else
        ClientConnections[index];
}

function sendDiscordDMMessage(userID, message) {
    if (Chino_chan != undefined) {
        if (Chino_chan.connected) {
            Chino_chan.sendUTF(JSON.stringify({
                type: "SendDMMessage",
                id: userID,
                message: message
            }));
        }
    }
}
function sendDiscordChannelMessage(id, message){
    if (Chino_chan != undefined) {
        if (Chino_chan.connected) {
            Chino_chan.sendUTF(JSON.stringify({
                type: "DiscordChannelMessage",
                id: id,
                message: message
            }));
        }
    }
}
function DisconnectEveryone(){
    ClientConnections.forEach((v, i, a) => {
        v.close();
    });
}