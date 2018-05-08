var FS = require("fs");
var PATH = require("path");
var ToolKit = require("./toolkit");


module.exports = Job;

Job.Config = {
	MaxKeepBuilds: 3
};

function Job(options){
	this._sWorkSpacePath = options.workSpace;
};

Job.prototype.getJobBaseName = function(){
	if(this._sWorkSpacePath){
		return this._sWorkSpacePath.substr(this._sWorkSpacePath.lastIndexOf("/") + 1);
	}
};

Job.prototype.getJobPath = function(){
	return PATH.join(this._sWorkSpacePath, "/../../jobs/" + this.getJobBaseName());
};

Job.prototype.travelJobNoKeepFiles = function(fnCallbackOnFile){
	var sDir = this.getJobPath();

	FS.readdirSync(sDir).forEach(function(sFile){
		var sPath = PATH.join(sDir, sFile);
		if(FS.existsSync(sPath) && FS.statSync(sPath).isDirectory()){
			if(sFile === "builds"){
				//Only reserve the final 3 builds
				var aBuild = [], sBuildPath;
				FS.readdirSync(sPath).forEach(function(sBuild){
					sBuildPath = PATH.join(sPath, sBuild);
					if(sBuild.match(/^\d+$/)){
						aBuild.push(sBuildPath);
					}else{
						fnCallbackOnFile(sBuildPath);
					}
				});

				aBuild.sort().forEach(function(sBuildPath, index, aSortedBuild){
					if(index < aSortedBuild.length - Job.Config.MaxKeepBuilds){
						fnCallbackOnFile(sBuildPath);
					}
				});
			}else if(sFile === "modules" || sFile === "cobertura"){
				fnCallbackOnFile(sPath);
			}else{
				this.travelJobNoKeepFiles(sPath, fnCallbackOnFile);
			}
		}
	});
};

Job.prototype.deleteJobNoKeepFiles = function(){
	this.travelJobNoKeepFiles(function(sPath){
		console.log("Job No Keep File: " + sPath);

		/*ToolKit.deleteFile(sPath, function(){
			console.log("Delete Job No Keep File: " + sPath);
		});*/
	});
};