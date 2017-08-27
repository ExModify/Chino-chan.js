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
var ready = false;

var Guilds = [];
var GuildIDs = [];
var Users = new Map();

var Logs = [];

var HTTPServer = http.createServer((req, resp) => { // Will have a webpage
    var reqFor = url.parse(req.url).pathname;

    LogOwner("HTML", req.connection.remoteAddress + " requested for " + reqFor);

    resp.write(fs.readFileSync('webpage/index.html').toString());
    resp.end();
    return;

    fs.readFile('webpage' + reqFor, (err, data) => {
        if(err){
            resp.writeHead(404, {'Content-Type': 'text/html'});
            resp.write("Not found");
        }
        else{
            resp.writeHead(200, {'Content-Type': 'text/html'}); 
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
    if(IsChinoOrigin(req.origin)){
        Chino_chan = req.accept("echo-protocol", req.origin);
        Chino_chan.on("message", (data) => {
            if(data.type == "utf8"){
                var json = JSON.parse(data.utf8Data);
                if (json.type == "GuildCount"){
                    guildReadyCount = json.count;
                    if (Guilds.length == guildReadyCount)
                        ready = true;
                }
                else if (json.type == "GuildAvailable" || json.type == "NewGuild"){
                    if (GuildIDs.indexOf(json.guildID) < 0) {
                        GuildIDs.push(json.guildID);
                        Guilds.push({
                            users: json.users,
                            channels: json.channels,
                            roles: json.roles,
                            bans: json.bans,
                            name: json.name,
                            icon: json.icon,
                            guildID: json.guildID,
                            ownerID: json.ownerID,
                            region: json.region
                        });
                        json.users.forEach((v, i, a) => {
                            Users.set(v.userID, v.user);
                        });
                        if (Guilds.length == guildReadyCount)
                            ready = true;
                    }
                }

                else if (json.type == "NewTextChannel" || json.type == "NewVoiceChannel"){
                    var index = Guilds.findIndex((v, i, a) => v.guildID == json.guildID);
                    if(index == -1)
                        return;

                    var channel = {
                        name: json.name,
                        id: json.id
                    };
                    if(json.type == "NewTextChannel"){
                        channel.topic = json.topic;
                        channel.type = "text";
                    }
                    else{
                        channel.type = "voice";
                    }
                    Guilds[index].channels.push(channel);
                }
                else if (json.type == "TextChannelUpdate" || json.type == "VoiceChannelUpdate") {
                    var guildIndex = Guilds.findIndex((v, i, a) => v.guildID == json.guildID);

                    if(guildIndex == -1)
                        return;

                    var channelIndex = Guilds[guildIndex].channels.findIndex((v, i, a) => v.id == json.id);
                    
                    if(channelIndex == -1)
                        return;

                    Guilds[guildIndex].channels[channelIndex].name = json.name;

                    if(json.type == "TextChannelUpdate"){
                        Guilds[guildIndex].channels[channelIndex].topic = json.topic;
                    }
                }
                else if (json.type == "ChannelDeleted"){
                    var guildIndex = Guilds.findIndex((v, i, a) => v.guildID == json.guildID);
                    
                    if(guildIndex == -1)
                        return;

                    var channelIndex = Guilds[guildIndex].channels.findIndex((v, i, a) => v.id == json.id);
                    
                    if(channelIndex == -1)
                        return;
                    
                    Guilds[guildIndex].channels = Guilds[guildIndex].channels.splice(channelIndex, 1);
                }

                else if (json.type == "NewGuildMember" || json.type == "GuildMemberUpdate") {
                    var guildIndex = Guilds.findIndex((v, i, a) => v.guildID == json.guildID);
                    
                    if(guildIndex == -1)
                        return;

                    var user = {
                        userID: json.userID,
                        username: json.username,
                        displayName: json.displayName,
                        status: json.status,
                        game: json.game,
                        roleIDs: json.roleIDs
                    };

                    Users.set(user.userID, user);

                    if(json.type == "NewGuildMember"){
                        Guilds[guildIndex].users.push(user);
                    }
                    else{
                        var userIndex = Guilds[guildIndex].users.findIndex((v, i, a) => v.userID = json.userID);

                        if(userIndex == -1)
                            return;

                        Guilds[guildIndex].users[userID] = user;
                    }
                    
                }
                else if (json.type == "GuildMemberPresenceUpdate"){
                    var guildIndex = Guilds.findIndex((v, i, a) => v.guildID == json.guildID);
                    
                    if(guildIndex == -1)
                        return;

                    var userIndex = Guilds[guildIndex].users.findIndex((v, i, a) => v.userID = json.userID);

                    if(userIndex == -1)
                        return;

                    Guilds[guildIndex].users[userIndex].status = json.status;
                    Guilds[guildIndex].users[userIndex].game = json.game;
                    
                    Users.set(json.userID, Guilds[guildIndex].users[userIndex]);
                }
                else if (json.type == "GuildMemberLeft"){
                    var guildIndex = Guilds.findIndex((v, i, a) => v.guildID == json.guildID);
                    
                    if(guildIndex == -1)
                        return;

                    var userIndex = Guilds[guildIndex].users.findIndex((v, i, a) => v.userID = json.userID);

                    if(userIndex == -1)
                        return;

                    Guilds[guildIndex].users = Guilds[guildIndex].users.splice(userIndex, 1);

                    Users.delete(json.userID);
                }

                else if (json.type == "NewBan"){
                    var guildIndex = Guilds.findIndex((v, i, a) => v.guildID == json.guildID);
                    
                    if(guildIndex == -1)
                        return;
                    
                    Guilds[guildIndex].bans.push({
                        id: json.userID,
                        username: json.username
                    });
                }
                else if (json.type == "RemoveBan"){
                    var guildIndex = Guilds.findIndex((v, i, a) => v.guildID == json.guildID);
                    
                    if(guildIndex == -1)
                        return;

                    var banIndex = Guilds[guildIndex].bans.findIndex((v, i, a) => v.id = json.userID);

                    if(banIndex == -1)
                        return;
                    
                    Guilds[guildIndex].bans = Guilds[guildIndex].bans.splice(banIndex, 1);
                }

                else if (json.type == "GuildRemove") {
                    if (GuildIDs.indexOf(json.id) > 0) {
                        var index = GuildIDs.indexOf(json.id);
                        Guilds = Guilds.splice(index, 1);
                        GuildIDs = GuildIDs.splice(index, 1);
                    }
                }

                else if (json.type == "NewMessage") {
                    var guildIndex = Guilds.findIndex((v, i, a) => v.guildID == json.guildID);
                    
                    if(guildIndex == -1)
                        return;

                    var channelIndex = Guilds[guildIndex].channels.findIndex((v, i, a) => v.id = json.channelID);

                    if(channelIndex == -1)
                        return;

                    Guilds[guildIndex].channels[channelIndex].messages.push({
                        id: json.id,
                        userID: json.userID,
                        content: json.content,
                        attachments: json.attachments,
                        embeds: json.embeds,
                        time: new Date(json.time)
                    });
                }
                else if (json.type == "MessageUpdated"){
                    var guildIndex = Guilds.findIndex((v, i, a) => v.guildID == json.guildID);
                    
                    if(guildIndex == -1)
                        return;

                    var channelIndex = Guilds[guildIndex].channels.findIndex((v, i, a) => v.id = json.channelID);

                    if(channelIndex == -1)
                        return;

                    var messageIndex = Guilds[guildIndex].channels[channelIndex].messages.findIndex((v, i, a) => v.id == json.id);

                    if(messageIndex == -1)
                        return;

                    Guilds[guildIndex].channels[channelIndex].messages[messageIndex].content = json.content;
                    Guilds[guildIndex].channels[channelIndex].messages[messageIndex].attachments = json.attachments;
                    Guilds[guildIndex].channels[channelIndex].messages[messageIndex].embeds = json.embeds;
                    Guilds[guildIndex].channels[channelIndex].messages[messageIndex].editedTime = new Date(json.editedTime)
                }
                else if (json.type == "MessageDelete") {
                    var guildIndex = Guilds.findIndex((v, i, a) => v.guildID == json.guildID);
                    
                    if(guildIndex == -1)
                        return;

                    var channelIndex = Guilds[guildIndex].channels.findIndex((v, i, a) => v.id = json.channelID);

                    if(channelIndex == -1)
                        return;

                    var messageIndex = Guilds[guildIndex].channels[channelIndex].messages.findIndex((v, i, a) => v.id == json.id);

                    if(messageIndex == -1)
                        return;

                    Guilds[guildIndex].channels[channelIndex].messages = Guilds[guildIndex].channels[channelIndex].messages.splice(messageIndex, 1);
                }

                else if (json.type == "RoleCreate") {
                    var guildIndex = Guilds.findIndex((v, i, a) => v.guildID == json.guildID);
                    
                    if(guildIndex == -1)
                        return;

                    Guilds[guildIndex].roles.push({
                        name: json.name,
                        id: json.id,
                        mentionable: json.mentionable,
                        permissions: json.permissions,
                        color: json.color
                    });
                }
                else if (json.type == "RoleUpdate") {
                    var guildIndex = Guilds.findIndex((v, i, a) => v.guildID == json.guildID);
                    
                    if(guildIndex == -1)
                        return;

                    var roleIndex = Guilds[guildIndex].roles.findIndex((v, i, a) => v.id == json.id);
                    
                    var role = {
                        name: json.name,
                        id: json.id,
                        mentionable: json.mentionable,
                        permissions: json.permissions,
                        color: json.color
                    };

                    if(roleIndex == -1){
                        Guilds[guildIndex].roles.push(role);
                    }
                    else{
                        Guilds[guildIndex].roles[roleIndex] = role;
                    }
                }
                else if (json.type == "RoleDeleted"){
                    var guildIndex = Guilds.findIndex((v, i, a) => v.guildID == json.guildID);
                    
                    if(guildIndex == -1)
                        return;

                    var roleIndex = Guilds[guildIndex].roles.findIndex((v, i, a) => v.id == json.id);

                    if (roleIndex > -1){
                        Guilds[guildIndex].roles = Guilds[guildIndex].roles.splice(roleIndex, 1);
                    }
                }

                else if (json.type == "TypingStarted"){
                    var guildIndex = Guilds.findIndex((v, i, a) => v.guildID == json.guildID);
                    
                    if(guildIndex == -1)
                        return;

                    var channelIndex = Guilds[guildIndex].channels.findIndex((v, i, a) => v.id == json.channelID);

                    if (channelIndex == -1)
                        return;

                    Guilds[guildIndex].channels[channelIndex].typingUserIDs.push(json.userID);
                }
                else if (json.type == "TypingStarted"){
                    var guildIndex = Guilds.findIndex((v, i, a) => v.guildID == json.guildID);
                    
                    if(guildIndex == -1)
                        return;

                    var channelIndex = Guilds[guildIndex].channels.findIndex((v, i, a) => v.id == json.channelID);

                    if (channelIndex == -1)
                        return;

                    Guilds[guildIndex].channels[channelIndex].typingUserIDs = Guild[guildIndex].channels[channelIndex].typingUserIDs.splice(json.userID, 1);
                }
                ClientConnections.forEach((connection, i, a) => {
                    if(connection.auth)
                        connection.client.sendUTF(data.utf8Data);
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
        if(data.type == "utf8"){
            var msg;
            try{
                msg = JSON.parse(data.utf8Data);
            }
            catch(exception){
                Connection.client.sendUTF(JSON.stringify({ type: "Error", data: "Wrong_Message_Provided" }));
                return;
            }
            if(msg.type == "credentials"){
                var creds;
                try{
                    creds = JSON.parse(msg.data);
                }
                catch(excpt){
                    Connection.client.sendUTF(JSON.stringify({ type: "Error", data: "Wrong_Message_Provided" }));
                    return;
                }
                var userID = creds.userID;
                var passwordHash = creds.password;
                if(userID == undefined || passwordHash == undefined){
                    Connection.client.sendUTF(JSON.stringify({ type: "Error", data: "Wrong_Message_Provided" }));
                    return;
                }
                else{
                    if(vars.HasAnyAdmin(userID)){
                        if(passwordHash.trim() == ""){
                            Connection.client.sendUTF(JSON.stringify({ type: "Credentials", data: "Wrong_Message_Provided_Missing_Password" }));
                        }
                        else{
                            var Credentials = vars.GetLoginCredentials(userID);
                            if(crypto.createHash('md5').update(Credentials.password).digest("hex") == passwordHash){
                                Connection.client.sendUTF(JSON.stringify({ type: "Credentials", data: "Validate_Server_Connection_Request_Credentials_JSON_Accepted" }));
                                Connection.auth = true;

                                if(vars.IsOwner(userID)){
                                    Connection.level = 3;
                                    SendSpecified(Connection, "WS", "Welcome here~");
                                    Logs.forEach((v, i, a) => {
                                        Connection.client.sendUTF(JSON.stringify({ type: "log", data: v }));
                                    });
                                }
                                else if (vars.IsGlobalAdmin(userID)){
                                    Connection.level = 2;
                                }
                                else{
                                    Connection.adminAt = vars.GetAdminIDs(userID);
                                    Connection.level = 1;
                                }

                                Connection.name = Users.get(userID).username;

                                sendDiscordMessage(userID, "Logged into Chino-chan webserver with IP: " + Connection.client.remoteAddress);
                            }
                            else{
                                Connection.client.sendUTF("Validate_Server_Connection_Request_Credentials_JSON_Declined");
                                Connection.client.close();
                            }
                        }
                    }
                }
            }
            else if (msg.type == "message"){
                if(msg.data.startsWith('!')){
                    var command = msg.data.split(' ')[0].substring(1);
                    var parameter = msg.data.split(' ').slice(0, 1).join(' ');
                    handleCommand(Connection, command, paramter)
                }
                else{
                    SendAll("Chat", Connection.name, msg.data);
                }
            }
        }
    });
    Connection.client.on('close', (number, desc) => {
        ClientConnections.slice(Connection.arrayIndex, 1);
        for(var i = Connection.arrayIndex; i < ClientConnections.length; i++){
            if(ClientConnections[i] != undefined)
                ClientConnections[i].arrayIndex--;
        }
    });

    ClientConnections.push(Connection);
    Connection.client.sendUTF(JSON.stringify({ type: "Credentials", data: "Validate_Server_Connection_Request_Credentials_JSON" }));
});

module.exports = {
    Start: () => {
        HTTPServer.listen(2465, () => {
            LogOwner('WS', "HTTP Server is binded to 2465!");
        })
    },
    LogDeveloper: (type, Message) => LogOwner(type, Message)
};

function handleCommand(client, command, parameter){
    if(command == "restart" && client.level == 3){
        ClientConnections.forEach((v, i, a) => {
            v.client.sendUTF(JSON.stringify({
                type: "WS",
                data: "Server_Restarting_Reconnect_Two_Seconds"
            }));
        });
        setTimeout(() => process.exit(2), 2000);
    }
}

function SendSpecified(connection, type, message){
    LogOwner("WS", `Said to ${connection.name}: ${message}`);
    var Time = `[${GetTime()}]`;
    var Prefix = `[${type}]`;
    connection.client.sendUTF(JSON.stringify({ type: "message", data: `${Time} ${Prefix} ${message}`}));
}

function SendAll(type, who, message){
    LogConsole("WS", who + " said: " + message);
    var Time = `[${GetTime()}]`;
    var Prefix = `[${type}]`;
    ClientConnections.forEach((v, i, a) => {
        v.client.sendUTF(JSON.stringify({ type: "message", data: `${Time} ${Prefix} ${who}: ${message}` }));
    });
}

function LogOwner(type, Message){
    LogConsole(type, Message);
    var Time = `[${GetTime()}]`;
    var Prefix = `[${type}]`;
    var connection = getOwner();
    if (connection != undefined){
        if (connection.connected){
            connection.sendUTF({type: "log", data: Time + " " + Prefix + " " + Message});
        }
    }
    Logs.push(Time + " " + Prefix + " " + Message);
}
function LogConsole(type, Message){
    var Time = `[${GetTime()}]`;
    var Prefix = `[${type}]`;
    if(type == "WS"){
        console.log(chalk.blue(Time) + " " + chalk.yellow(Prefix) + " " + Message);
    }
    else if (type == "Error"){
        console.log(chalk.blue(Time) + " " + chalk.red(Prefix) + " " + Message);
    }
    else if (type == "IRC"){
        console.log(chalk.blue(Time) + " " + chalk.magenta(Prefix) + " " + Message);
    }
    else if (type == "Git"){
        console.log(chalk.blue(Time) + " " + chalk.yellow(Prefix) + " " + Message);
    }
    else if (type == "Bot"){
        console.log(chalk.blue(Time) + " " + chalk.cyan(Prefix) + " " + Message);
    }
    else if (type == "Main"){
        console.log(chalk.blue(Time) + " " + chalk.green(Prefix) + " " + Message);
    }
    else if (type == "HTML"){
        console.log(chalk.blue(Time) + " " + chalk.green(Prefix) + " " + Message);
    }
    else if (type = "WaifuCloud"){
        console.log(chalk.blue(Time) + " " + chalk.magenta(Prefix) + " " + Message);
    }
}

function GetTime(){
    var date = new Date();
    return Form(date.getFullYear())
    + "." + Form(date.getMonth() + 1)
    + "." + Form(date.getDate())

    + ". " + Form(date.getHours())
    + ":" + Form(date.getMinutes()) 
    + ":" + Form(date.getSeconds());
}
function Form(value){
    if(value < 10)
        return "0" + value;
    else
        return value;
}

function IsChinoOrigin(value){
    return value == crypto.createHash('sha1').update(crypto.createHash('md5').update(vars.IRCPassword).digest("hex")).digest("hex");
}
function getOwner(){
    var index = ClientConnections.findIndex((v, i, a) => {
        return v.level == 3;
    });
    if(index == -1)
        return undefined;
    else
        ClientConnections[index];
}

function sendDiscordMessage(userID, message){
    if(Chino_chan != undefined){
        if(Chino_chan.connected){
            Chino_chan.sendUTF({
                type: "sendMessage",
                id: userID,
                message: message
            });
        }
    }
}