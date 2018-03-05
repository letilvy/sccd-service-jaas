var FS = require("fs");
var Path = require("path");
var File = require("./file");


module.exports = Project;

/**
  	Test Type: 
		(1) Unit: Unit Test
		(2) Integration: Integration Test
		(3) System: System Test
	Values of test types here are the same with names of the corresponding database tables 
*/
Project.TestType = {
	Unit: "UT",
	Integration: "IT",
	System: "ST"
};
/**
  	Unit Test Coverage Type: 
		(1) Included: Only calculate files which included in unit test 
		(2) All: Calculate all valid files
	Values of test types here are the same with names of the corresponding database tables 
*/
Project.UTCoverageType = {
	Included: "Included",
	All: "All"
};


function Project(options){
	this._sWorkSpacePath = options.workSpace;
	this._sReportPath = Path.join(this._sWorkSpacePath, "/target/surefire-reports");
	this._sCoveragePath = Path.join(this._sWorkSpacePath, "/target/jscoverage");

	this.oKpi = {};
	Object.keys(Project.TestType).forEach(function(sTestType){
		this.oKpi[Project.TestType[sTestType]] = { passed: 0, failed: 0, skipped: 0, assertion: 0 };
	}.bind(this));

	this.oUTCoverage = {};
	Object.keys(Project.UTCoverageType).forEach(function(sType){
		this.oUTCoverage[Project.UTCoverageType[sType]] = { validLines: 0, lineRate: 0 };
	}.bind(this));
};

Project.prototype.getProjectId = function(){
	return this.getProjectIdFromManifest().then(function(sProjectId){
		if(sProjectId){
			return Promise.resolve(sProjectId);
		}else{
			return this.getProjectIdFromPom.call(this);
		}
	}.bind(this));
}

Project.prototype.getProjectIdFromManifest = function(){
	return new Promise(function(resolve, reject){
		if(this.sProjectId){
			resolve(this.sProjectId);
		}

		var sManiPath = Path.join(this._sWorkSpacePath, "webapp", "manifest.json");
		var oFileMani = new File({
			path: sManiPath
		});

		if(oFileMani.isExist()){
			var oRegExp = new RegExp(/^\s*"?id"?\s*:\s*"?(sap[\w\.]+)"?/);
			oFileMani.readLineByLine(function(sLine){
				if(oRegExp.test(sLine)){
					this.sProjectId = oRegExp.exec(sLine)[1];
					resolve(this.sProjectId);
				}
			}, function(){
				console.log("Read file " + sManiPath + " finished.");
				resolve(null);
			});
		}else{
			resolve(null);
		}
	}.bind(this));	
};


Project.prototype.getProjectIdFromPom = function(){
	return new Promise(function(resolve, reject){
		if(this.sProjectId){
			resolve(this.sProjectId);
		}

		var sPomPath = Path.join(this._sWorkSpacePath, "pom.xml");
		var oFilePom = new File({
			path: sPomPath
		});

		if(oFilePom.isExist()){
			var bParentGroup = false;
			var oRegExp = new RegExp(/^\s*<groupId>(sap[\w\.]+)<\/groupId>\s*$/);
			oFilePom.readLineByLine(function(sLine){
				if(sLine.match(/^\s*<parent>/)){
					bParentGroup = true;
				}else if(sLine.match(/^\s*<\/parent>/)){
					bParentGroup = false;
				}else if(!bParentGroup && oRegExp.test(sLine)){
					this.sProjectId = oRegExp.exec(sLine)[1];
					resolve(this.sProjectId);
				}
			}, function(){
				console.log("Read file " + sPomPath + " finished.");
				resolve(null);
			});
		}else{
			resolve(null);
		}
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
			var oFile = new File({
				path: sReportPath
			});

			if(oFile.isExist()){
				var oRegExp = new RegExp(/^\s*<testcase name=".*" tests="(\d+)" failures="(\d+)" errors="(\d+)"/i);
				oFile.readLineByLine(function(sLine){
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


Project.prototype.getUTCoverageReportPath = function(sType){
	var sCoverageReportPath, aReportPattern;
	switch(sType){
		case Project.UTCoverageType.Included: aReportPattern = [new RegExp(/^coverage\.xml$/i), new RegExp(/^jscoverage\.xml_ORIGINAL$/i)];
				break;
		case Project.UTCoverageType.All: aReportPattern = [new RegExp(/^cobertura\.xml$/i), new RegExp(/^jscoverage\.xml$/i)];
		        break;
		default: return null;
	}
	FS.readdirSync(this._sCoveragePath).forEach(function(sFileName){
		var sFile = Path.join(this._sCoveragePath, sFileName);
		if(FS.statSync(sFile).isFile() && aReportPattern.some(function(oPattern){
			return oPattern.test(sFileName);
		})){
			sCoverageReportPath = sFile;
			return false;
		}
	}.bind(this));
	return sCoverageReportPath;
};

Project.prototype.getUTCoverageByType = function(sType){
	return new Promise(function(resolve, reject){
		Object.keys(this.oUTCoverage[sType]).forEach(function(sKey){
			this.oUTCoverage[sType][sKey] = 0;
		}.bind(this));

		var sReportPath = this.getUTCoverageReportPath(sType);

		if(sReportPath){
			var oFile = new File({
				path: sReportPath
			});

			if(oFile.isExist()){
				var oRegExp = new RegExp(/^\s*<coverage files="\d+" line-rate="(0\.\d+)" lines-covered="\d+" lines-valid="(\d+)"/i);
				oFile.readLineByLine(function(sLine){
					var aMatchKpi = oRegExp.exec(sLine);
					if(aMatchKpi){
						this.oUTCoverage[sType].lineRate = parseFloat(aMatchKpi[1]).toFixed(2);
						this.oUTCoverage[sType].validLines = parseInt(aMatchKpi[2]);
					}
				}.bind(this), function(){
					resolve(this.oUTCoverage[sType]);
				}.bind(this));
			}else{
				resolve(this.oUTCoverage[sType]);
			}
		}else{
			resolve(this.oUTCoverage[sType]);
		}
	}.bind(this));
};

Project.prototype.getUTCoverage = function(){
	if((Object.keys(this.oUTCoverage)).every(function(sType){
		return this.oUTCoverage[sType].lineRate !== 0;
	}.bind(this))){
		return Promise.resolve(this.oUTCoverage);
	}else{
		return Promise.all(Object.keys(this.oUTCoverage).map(function(sType){
			return this.getUTCoverageByType(sType);
		}.bind(this))).then(function(aKpi){
			return Promise.resolve(this.oUTCoverage);
		}.bind(this));
	}
};

