var ws = require('./webserver.js');
var fs = require('fs');
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
    connected: Connected,
    search: (tags) => {
        return new Promise((resolve, reject) => {
            if (!WSConnection)
                reject(new Error("Not connected to Waifu Cloud"));
            
            var id = rng();
            ResponseEvent.once(id, response => {
                resolve({
                    error: response.error,
                    url: response.response.url,
                    file: response.response.filepath
                });
            });
            WSConnection.sendUTF(JSON.stringify({
                name: "search_tags",
                mode: "random",
                job_id: id,
                tags: tags
            }));

        });
    },
    fill: (folder, tags, toFolder) => {
        return new Promise((resolve, reject) => {
            if (!WSConnection)
                ws.LogDeveloper("Error", "Not connected to Waifu Cloud");
    
            if(!WSConnection.connected)
                ws.LogDeveloper("Error", "Not connected to Waifu Cloud");
    
            var WaifuCloudPath = "D:\\waifucloud\\images\\" + toFolder + "\\";
    
            var jsonScheme = {
                filename: "",
                tags: tags,
                url: "Unknwon"
            };
            var pushedFiles = [];
            if (fs.existsSync(folder)){
                fs.readdirSync(folder).forEach((v, i, a) => {
                    if (!fs.existsSync(WaifuCloudPath))
                        fs.mkdirSync(WaifuCloudPath);

                    if (!fs.existsSync(WaifuCloudPath + v)){
                        fs.writeFileSync(WaifuCloudPath + v, fs.readFileSync(folder + v));
                        jsonScheme.filename = v;
                        pushedFiles.push(jsonScheme);
                    }
                });
            }
            if (pushedFiles.length == 0)
                resolve(0);
    
            ws.LogDeveloper("WaifuCloud", `Adding ${pushedFiles.length} images..`);
            ProcessPosts(pushedFiles).then(() => {
                WSConnection.sendUTF(JSON.stringify({
                    name: "save",
                    job_id: rng()
                }));
                resolve(pushedFiles.length);
            });
        });
    }
};

function rng(){
    return Math.floor(Math.random() * 11132432211562);
}

function ProcessPosts(posts){
    return new Promise((resolve, reject) => {
        processImage(posts, 0, resolve);
    });
}
function processImage(posts, index, resolve){
    var id = rng();
    ResponseEvent.on(id, () => {
        if (index == posts.length - 1)
            resolve();

        processImage(posts, index + 1, resolve);
    });

    WSConnection.sendUTF(JSON.stringify({
        job_id: id,
        name: "add_post",
        post: posts[index]
    }));
}

var Connected = WSConnection == undefined ? WSConnection.connected : false;