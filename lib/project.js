var FS = require("fs");
var Path = require("path");
var File = require("./file");


module.exports = Project;

/**
  	Test Type: 
		(1) unit: Unit Test
		(2) integration: Integration Test
		(3) system: System Test
	Values of test types here are the same with names of the corresponding database tables 
*/
Project.TestType = {
	Unit: "UT",
	Integration: "IT",
	System: "ST"
};

function Project(options){
	this._sWorkSpacePath = options.workSpace;
	this._sReportPath = Path.join(this._sWorkSpacePath, "/target/surefire-reports");
	this.oKpi = {};
	Object.keys(Project.TestType).forEach(function(sTestType){
		this.oKpi[Project.TestType[sTestType]] = { passed: 0, failed: 0, skipped: 0, assertion: 0 };
	}.bind(this));
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
				resolve(this.sProjectId);
			}
		});
	}.bind(this));	
};

Project.prototype.getTestReportPath = function(sTestType){
	var sTestReportPath, aReportPattern;
	switch(sTestType){
		case Project.TestType.Unit: aReportPattern = [new RegExp(/\.unitTests?\./i), new RegExp(/\.indexUnit\./i)];
				break;
		case Project.TestType.Integration: aReportPattern = [new RegExp(/\.opaTests?\./i), new RegExp(/\.indexOpa\./i)];
		        break;
		case Project.TestType.System: aReportPattern = [new RegExp(/\.systemTests?\./i), new RegExp(/\.indexSystem\./i)];
		        break;
		default: return null;
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

Project.prototype.getTestKpiByType = function(sTestType){
	return new Promise(function(resolve, reject){
		Object.keys(this.oKpi[sTestType]).forEach(function(sKey){
			this.oKpi[sTestType][sKey] = 0;
		}.bind(this));

		var sReportPath = this.getTestReportPath(sTestType);

		if(sReportPath){
			var oFileUT = new File({
				path: sReportPath
			});

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
		}else{
			resolve(this.oKpi[sTestType]);
		}
	}.bind(this));
};

Project.prototype.getTestKpi = function(){
	if((Object.keys(this.oKpi)).every(function(sKpiType){
		return this.oKpi[sKpiType].assertion !== 0;
	}.bind(this))){
		return Promise.resolve(this.oKpi);
	}else{
		return Promise.all(Object.keys(this.oKpi).map(function(sKpiType){
			return this.getTestKpiByType(sKpiType);
		}.bind(this))).then(function(aKpi){
			return Promise.resolve(this.oKpi);
		}.bind(this));
	}
};

