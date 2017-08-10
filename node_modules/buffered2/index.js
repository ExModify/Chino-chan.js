"use strict";
var Duplex = require("readable-stream").Duplex;
var util = require("util");

util.inherits(BufferedStream, Duplex);

BufferedStream.prototype._read = read;
BufferedStream.prototype._write = write;

BufferedStream.prototype.hasFlushed = false;
BufferedStream.prototype.dataBuffer = null;

exports.BufferedStream = BufferedStream;

function BufferedStream(options) {
	if (!(this instanceof BufferedStream))
		return new BufferedStream(options);
	Duplex.call(this, options);
	this.dataBuffer = [];
	this.on("finish", function () {
		if (this.hasFlushed)
			this.push(null);
	}.bind(this));
}

function read() {
	if (this.hasFlushed) return;

	var buffer = this.dataBuffer;
	var shouldFlush = buffer.length;

	while (shouldFlush) {
		var data = buffer.shift();
		shouldFlush = this.push(data) && buffer.length;
	}

	if (buffer.length === 0) {
		this.hasFlushed = true;
		if (this._writableState.ended)
			this.push(null);
	}

}

function write(chunk, encoding, cb) {
	if (this.hasFlushed) {
		this.push(chunk);
	} else {
		this.dataBuffer.push(chunk);
	}
	cb();
}
