var Path = require("path");
var File = require("./file");


module.exports = Project;

function Project(options){
	this._sWorkSpacePath = options.workSpace;
	this._sReportPath = Path.join(this._sWorkSpacePath, "/target/surefire-reports");
}

Project.prototype.getProjectId = function(){
	return new Promise(function(resolve, reject){
		var sManiPath = Path.join(this._sWorkSpacePath, "webapp", "manifest.json");
		var oFileMani = new File({
			path: sManiPath
		});

		oFileMani.readLineByLine(function(sLine){
			var oRegExp = new RegExp(/^\s*"?id"?\s*:\s*"?(sap[\w\.]+)"?/);
			if(oRegExp.test(sLine)){
				console.log("Find id: " + oRegExp.exec(sLine)[1]);
				resolve(oRegExp.exec(sLine)[1]);
			}
		});
	}.bind(this));	
};
