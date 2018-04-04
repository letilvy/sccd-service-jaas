var ReadLine = require("readline");
var FS = require("fs");
var Child_Proc = require("child_process");
var Util = require("util");

module.exports = File;

function File(options){
	this._filePath = options.path;
};

File.prototype.getFilePath = function(){
	return this._filePath;
};

File.prototype.isExist = function(){
	return FS.existsSync(this._filePath);
};

File.prototype.beautifyXML = function(fnCallback){
	Child_Proc.exec(
		Util.format('xmllint --format %s -o %s', this._filePath, this._filePath), fnCallback);
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