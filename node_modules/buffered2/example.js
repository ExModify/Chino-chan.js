"use strict";
var fs = require("fs");
var http = require("http");
var BufferedStream = require("buffered2").BufferedStream;

http.createServer(function (req, res) {
	var buffer = new BufferedStream();
	req.pipe(buffer);
	setTimeout(function () {
		buffer.pipe(fs.createWriteStream('req'));
	}, 500);
}).listen(8000);
