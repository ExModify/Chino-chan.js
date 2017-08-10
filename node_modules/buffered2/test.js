"use strict";
var test = require("tape");
var BufferedStream = require("./").BufferedStream;
var through = require("through2");
var toStream = require("array-to-stream");
var toArray = require("stream-to-array");

test("Data that gets written before a read is buffered", function (t) {
	t.plan(1);
	t.timeoutAfter(1 * 1000);

	var data = ["Hello", "World", "!"];
	var expected = data.map(function (item) {
		return new Buffer(item);
	});
	var source = toStream(data);
	var buffer = new BufferedStream();
	var sink = through();

	source.pipe(buffer);

	toArray(sink, function (err, results) {
		if (err) return t.end(err);
		t.deepEqual(results, expected);
	});

	setTimeout(function () {
		buffer.pipe(sink);
	}, 10);

});

test("Data that gets written after a read is passed through", function (t) {
	t.plan(1);
	t.timeoutAfter(1 * 1000);

	var data = ["Hello", "World", "!"];
	var expected = data.map(function (item) {
		return new Buffer(item);
	});
	var source = toStream(data);
	var buffer = new BufferedStream();
	var sink = through();

	buffer.pipe(sink);

	setTimeout(function () {
		source.pipe(buffer);
	}, 10);

	toArray(sink, function (err, results) {
		if (err) return t.end(err);
		t.deepEqual(results, expected);
	});

});

test("Data that gets sent before and after a read goes through in order", function (t) {
	t.plan(1);
	t.timeoutAfter(1 * 1000);

	var data = ["Hello", "World", "!"];
	var expected = data.map(function (item) {
		return new Buffer(item);
	});
	var source = through();
	var buffer = new BufferedStream();
	var sink = through();

	source.pipe(buffer);

	source.push(data[0]);

	toArray(sink, function (err, results) {
		if (err) return t.end(err);
		t.deepEqual(results, expected);
	});

	setTimeout(function () {
		buffer.pipe(sink);
	}, 10);

	setTimeout(function () {
		source.push(data[1]);
	}, 20);

	setTimeout(function () {
		source.push(data[2]);
		source.end();
	}, 30);
});
