var File = require("./file");

oFile = new File({
	path: "../data/manifest.json"
});

oFile.readLineByLine(function(sLine){
	var oRegExp = new RegExp(/^\s*"?id"?\s*:\s*"?(\w+)"?/);
	if(sLine.match(/^\s*"?id"?\s?:/)){
		console.log("Find id line: " + sLine);
	}
});
