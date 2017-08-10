# buffered2

Buffered stream which saves data until it is piped somewhere.

This module mainly exists to account for that fact that incoming HTTP requests aren't buffered and can result in data loss if they aren't piped somewhere synchronously.

Inspired by [@mmalecki's buffered](https://github.com/mmalecki/buffered) module. Basically the same functionality, but with a newer streams backing.

## Install

    npm install buffered2

## Example

```javascript
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
```
