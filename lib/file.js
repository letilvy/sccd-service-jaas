var ReadLine = require("readline");
var FS = require("fs");

module.exports = File;

function File(options){
	this._filePath = options.path;
};

File.prototype.isExist = function(){
	return FS.existsSync(this._filePath);
};

File.prototype.readLineByLine = function(fnCallbackLine, fnCallbackEnd){
	var oReadStream = FS.createReadStream(this._filePath);
	var oReadLine = ReadLine.createInterface({
		input: oReadStream
	});

	oReadLine.on("line", fnCallbackLine);

	oReadLine.on("close", fnCallbackEnd || function(){
		console.log("Read file " + this._filePath + " finished.");
	}.bind(this));
};