var FS = require("fs");
var PATH = require("path");
var CHILD_PROC = require("child_process");
var UTIL = require("util");


exports.deleteFile = function(sPath, fnCallback){
	if(FS.existsSync(sPath)){
		CHILD_PROC.exec(
			UTIL.format('rm -rf %s', sPath), fnCallback);
	}
}