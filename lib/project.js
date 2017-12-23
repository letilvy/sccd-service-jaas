var FS = require("fs");
var Path = require("path");
var File = require("./file");


module.exports = Project;

function Project(options){
	this._sWorkSpacePath = options.workSpace;
	this._sReportPath = Path.join(this._sWorkSpacePath, "/target/surefire-reports");
	this.oKpi = {
		unit: { passed: 0, failed: 0, skipped: 0, assertion: 0 },
		integration: { passed: 0, failed: 0, skipped: 0, assertion: 0 }
	};
}

Project.prototype.getProjectId = function(){
	return new Promise(function(resolve, reject){
		if(this.sProjectId){
			resolve(this.sProjectId);
		}

		var sManiPath = Path.join(this._sWorkSpacePath, "webapp", "manifest.json");
		var oFileMani = new File({
			path: sManiPath
		});

		var oRegExp = new RegExp(/^\s*"?id"?\s*:\s*"?(sap[\w\.]+)"?/);
		oFileMani.readLineByLine(function(sLine){
			if(oRegExp.test(sLine)){
				this.sProjectId = oRegExp.exec(sLine)[1];
				//console.log("Find id: " + this.sProjectId);
				resolve(this.sProjectId);
			}
		});
	}.bind(this));	
};

/**
  	Test Type: 
		(1) unit: Unit Test
		(2) integration: Integration Test
		(3) system: System Test
*/
Project.prototype.getTestReportPath = function(sTestType){
	var sTestReportPath, aReportPattern;
	switch(sTestType.toLowerCase()){
		case "unit": aReportPattern = [new RegExp(/\.unitTests?\./i), new RegExp(/\.indexUnit\./i)];
				break;
		case "integration": aReportPattern = [new RegExp(/\.opaTests?\./i), new RegExp(/\.indexOpa\./i)];
		        break;
		default: return;
	}
	FS.readdirSync(this._sReportPath).forEach(function(sFileName){
		var sFile = Path.join(this._sReportPath, sFileName);
		if(FS.statSync(sFile).isFile() && aReportPattern.some(function(oPattern){
			return oPattern.test(sFileName);
		})){
			sTestReportPath = sFile;
			return false;
		}
	}.bind(this));
	return sTestReportPath;
};

Project.prototype.getTestKpi = function(sTestType){
	return new Promise(function(resolve, reject){
		sTestType = sTestType.toLowerCase();
		var sReportPath = this.getTestReportPath(sTestType);
		var oFileUT = new File({
			path: sReportPath
		});

		Object.keys(this.oKpi[sTestType]).forEach(function(sKey){
			this.oKpi[sTestType][sKey] = 0;
		}.bind(this));

		var oRegExp = new RegExp(/^\s*<testcase name=".*" tests="(\d+)" failures="(\d+)" errors="(\d+)"/i);
		oFileUT.readLineByLine(function(sLine){
			var aMatchKpi = oRegExp.exec(sLine);
			if(aMatchKpi){
				if(parseInt(aMatchKpi[1]) > 0){
					this.oKpi[sTestType].assertion += parseInt(aMatchKpi[1]);
					if(parseInt(aMatchKpi[2]) === 0 && parseInt(aMatchKpi[3]) === 0){
						this.oKpi[sTestType].passed++;
					}else{
						this.oKpi[sTestType].failed++;
					}
				}else{
					this.oKpi[sTestType].skipped++;
				}
			}
		}.bind(this), function(){
			resolve(this.oKpi[sTestType]);
		}.bind(this));
	}.bind(this));
};

