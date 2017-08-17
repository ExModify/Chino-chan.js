var ws = require('./webserver.js');
var client = require('websocket').client;
var event = require('events').EventEmitter;

var WSClient = new client();
var WSConnection;
var ResponseEvent = new event();

var vars = require('./../global/vars.js');

module.exports = {
    connect: () => {
        WSClient.on("connect", (connection) => {
            WSConnection = connection;
            WSConnection.on("message", (data) => {
                if(data.type == "utf8"){
                    if(data.utf8Data == "Request_JSON_Password"){
                        WSConnection.sendUTF(JSON.stringify({
                            type: "auth",
                            username: vars.IRCUsername,
                            password: vars.WaifuCloudPassword
                        }));
                        return;
                    }
                    var response;
                    try{
                        response = JSON.parse(data.utf8Data);
                    }
                    catch(excpt){
                        console.log("Error: Wrong JSON got from WaifuCloud!\n" + data.utf8Data);
                    }
                    ResponseEvent.emit(response.job_id, response);
                }
            });
            ws.LogDeveloper("WaifuCloud", "Connected to Waifu Cloud server successfully!");
        });
        WSClient.on("connectFailed", (error) => {
            ws.LogDeveloper("WaifuCloud", "Connection Failed!\n" + error.stack);
        });

        WSClient.connect(vars.WaifuCloudServer, "echo-protocol", JSON.stringify({
            username: vars.WaifuCloudUsername,
            password: vars.WaifuCloudPassword
        }));
    },
    connected: () => {
        if (WSConnection){
            if (WSConnection.connected)
                return true;
        }
        return false;
    },
    search: (tags) => {
        return new Promise((resolve, reject) => {
            if (WSConnection == undefined)
                reject(new Error("Not connected to Waifu Cloud"));
            
            var id = rng();
            ResponseEvent.once(id, response => {
                resolve({
                    error: reponse.error,
                    url: response.post.url
                });
            });
            WSConnection.sendUTF(JSON.stringify({
                name: "search_tags",
                mode: "random",
                job_id: id,
                tags: tags
            }));

        });
    }
};




function rng(){
    return Math.floor(Math.random() * 11111562);
}