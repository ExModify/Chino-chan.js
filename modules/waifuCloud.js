var fs = require('fs');
var Random = require('random-js');
var random = new Random(Random.engines.mt19937().autoSeed());

var execSync = require('child_process').execSync;

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
                        console.log(JSON.stringify({
                            type: "Error",
                            message: "Got wrong JSON from WaifuCloud: " + data.utf8Data
                        }));
                    }
                    ResponseEvent.emit(response.job_id, response);
                }
            });
            WSConnection.on("close", (code, description) => {
                if (code == 1006)
                    Connect();
            });
            console.log(JSON.stringify({
                type: "WaifuCloud",
                message: "Connected to WaifuCloud successfully!"
            }));
        });
        WSClient.on("connectFailed", (error) => {
            if (error.toString().indexOf('ECONNREFUSED') >= 0) {
                var hostname = execSync("hostname").toString();
                if (hostname.trim() == vars.BoltzmannHostname){
                    Connect();
                }
                else{
                    console.log(JSON.stringify({
                        type: "WaifuCloud",
                        message: "Can't connect to WaifuCloud because I'm not on the same server where it is."
                    }));
                }
            }
            else{
                console.log(JSON.stringify({
                    type: "WaifuCloud",
                    message: "Connection Failed!\n" + error.stack
                }));
            }
        });

        Connect();
    },
    connected: () => {
        if (WSConnection)
            if (WSConnection.connected)
                return true;
        return false;
    },
    search: (tags) => {
        return new Promise((resolve, reject) => {
            if (!WSConnection)
                reject(new Error("Not connected to Waifu Cloud"));
            
            var id = rng();
            ResponseEvent.once(id, response => {
                resolve({
                    error: response.error,
                    url: response.response.fileurl,
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
            if(!WSConnection) {
                console.log(JSON.stringify({
                    type: "Error",
                    message: "Not connected to WaifuCloud!"
                }));
                return;
            }
    
            var WaifuCloudPath = vars.WaifuCloudImagePath + toFolder + "\\";
    
            var jsonScheme = {
                filename: "",
                tags: tags,
                url: "Unknown"
            };
            var pushedFiles = [];
            if (fs.existsSync(folder)){
                fs.readdirSync(folder).forEach((v, i, a) => {
                    if (!fs.existsSync(WaifuCloudPath))
                        fs.mkdirSync(WaifuCloudPath);

                    if (!fs.existsSync(WaifuCloudPath + v)){
                        fs.writeFileSync(WaifuCloudPath + v, fs.readFileSync(folder + v));
                        jsonScheme.filename = v.substring(0, v.lastIndexOf('.'));
                        pushedFiles.push(jsonScheme);
                    }
                });
            }
            if (pushedFiles.length == 0)
                resolve(0);
    
            console.log(JSON.stringify({
                type: "WaifuCloud",
                message: `Adding ${pushedFiles.length} images..`
            }));
            ProcessPosts(pushedFiles).then(() => {
                WSConnection.sendUTF(JSON.stringify({
                    name: "save",
                    job_id: rng()
                }));
                resolve(pushedFiles.length);
            });
        });
    },
    save: () => Save(),
    delete: (post_id) => {
        return new Promise((resolve, reject) => {
            if (!WSConnection)
                reject(new Error("Not connected to Waifu Cloud"));
            
            var id = rng();
            ResponseEvent.once(id, response => {
                resolve(response);
            });
            WSConnection.sendUTF(JSON.stringify({
                name: "del_post",
                job_id: rng(),
                id: post_id
            }));
        });
    }
};

function Save() {
    return new Promise((resolve, reject) => {
        if (!WSConnection)
            reject(new Error("Not connected to Waifu Cloud"));
        
        var id = rng();
        ResponseEvent.once(id, response => {
            resolve();
        });
        WSConnection.sendUTF(JSON.stringify({
            name: "save",
            job_id: rng()
        }));
    });
}

function rng(){
    return random.integer(0, 11132432211562);
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

function Connect(){
    WSClient.connect(vars.WaifuCloudServer, "echo-protocol", JSON.stringify({
        username: vars.WaifuCloudUsername,
        password: vars.WaifuCloudPassword
    }));
}