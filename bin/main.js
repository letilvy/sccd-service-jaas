#! /usr/bin/env node

/***
	Run the program in CLI like:
	  node main.js jenkins_job_workspace_path branch_name
	Or
	  sccd jenkins_job_workspace_path branch_name //on jenkins server
	You can get the first CLI parameter through process.argv[2]
*/

var Project = require("../lib/project");
var DB = require("../lib/db");

var aArgv = process.argv.slice(2);

function getTimestamp(oDate){
	var sYear = oDate.getFullYear();
	var sMonth = oDate.getMonth() + 1;
	var sDay = oDate.getDate();
	var sHour = oDate.getHours();
	var sMin = oDate.getMinutes();
	var sSec = oDate.getSeconds();
	
	sMonth = sMonth < 10 ? ("0" + sMonth):sMonth;
	sDay = sDay < 10 ? ("0" + sDay):sDay;
	sHour = sHour < 10 ? ("0" + sHour):sHour;
	sMin = sMin < 10 ? ("0" + sMin):sMin;
	sSec = sSec < 10 ? ("0" + sSec):sSec;
		
	return String(sYear) + String(sMonth) + String(sDay) + String(sHour) + String(sMin) + String(sSec);
}

var oProject = new Project({
	workSpace: aArgv[0] || "./" //Use "../data/B1 SMP PUM" as debug purpose
});
var oDB = new DB({
	name: "sccd"
});
var sBranch = aArgv[1] || "master";

Promise.all([oProject.getProjectId(), oProject.getTestKpi()]).then(function(aResult){
	var sProjectId = aResult[0], oKpi = aResult[1];
	var sSql, sDbTable, aParam;

	oDB.connect();
	(Object.keys(Project.TestType)).forEach(function(sTestTypeKey){
		var sTestType = Project.TestType[sTestTypeKey];
		if(oKpi[sTestType].assertion){
			switch(sTestType){
				case Project.TestType.Unit: sDbTable = "UT"; break;
				case Project.TestType.Integration: sDbTable = "IT"; break;
				case Project.TestType.System: sDbTable = "ST"; break;
				default: return false;
			}
			sSql = "INSERT INTO " + sDbTable + 
			       "(pid, branch, passed, failed, skipped, assertion, timestamp) VALUES(?,?,?,?,?,?,?)";
            aParam = [sProjectId, sBranch, oKpi[sTestType].passed, oKpi[sTestType].failed, oKpi[sTestType].skipped,
            			oKpi[sTestType].assertion, getTimestamp(new Date())];
            oDB.query(sSql, aParam, function(oError, oResult){
            	if(oError){
            		console.log("DB error:" + oError.message);
            	}
            	console.log("Save " + sTestType +" test kpi successfully, DB record key: " + oResult.insertId);
            });
		}
	});
	oDB.close();
}).catch(function(sReason){
	console.log("Save test kpi failed:" + sReason);
	oDB.close();
});