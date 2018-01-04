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

//${GIT_BRANCH} has a prefix "origin/", while ${GERRIT_BRANCH} does not
var sBranch = "master";
if(aArgv[1] && aArgv[1].match(/^.*\/(\w+)$/)){
	sBranch = (aArgv[1].match(/^.*\/(\w+)$/))[1];
}else if(aArgv[1]){
	sBranch = aArgv[1];
}
console.log("Get branch name: " + sBranch);

Promise.all([oProject.getProjectId(), oProject.getTestKpi()]).then(function(aResult){
	var sProjectId = aResult[0], oKpi = aResult[1];
	var sTimestamp = getTimestamp(new Date());

	oDB.connect();
	(Object.keys(Project.TestType)).forEach(function(sTestTypeKey){
		var sSqlCheck, aParamCheck;
		var sTestType = Project.TestType[sTestTypeKey];

		if(oKpi[sTestType].assertion){
			console.log("Get " + sTestType + " test kpi: passed-" + oKpi[sTestType].passed + ", " +
														"failed-" + oKpi[sTestType].failed + ", " +
														"skipped-" + oKpi[sTestType].skipped + ", " +
														"assertion-" + oKpi[sTestType].assertion);

			//Check test kpi of today has been recorded or not
			sSqlCheck = "SELECT tcid FROM " + sTestType +
				   " WHERE pid=? AND timestamp LIKE '" + sTimestamp.slice(0,8) +"%'" +
				   " ORDER BY timestamp desc";
		    aParamCheck = [sProjectId];
		    oDB.query(sSqlCheck, aParamCheck, function(oError, aRow){
            	if(oError){
            		console.log("Check " + sProjectId + "-" + sTimestamp.slice(0,8) + " test kpi existence failed. Message: " + oError.message);
            		return;
            	}
            	
            	var sSqlSave, aParamSave;
            	if(aRow.length){ //Update the record with the latest test result
            		console.log("Update an existing " + sTestType +" test result: tcid = " + aRow[0].tcid + ", timestamp = " + sTimestamp);
            		sSqlSave = "UPDATE " + sTestType +
            			   " SET pid=?, branch=?, passed=?, failed=?, skipped=?, assertion=?, timestamp=?" +
            			   " WHERE tcid=?";
            		aParamSave = [sProjectId, sBranch, oKpi[sTestType].passed, oKpi[sTestType].failed, oKpi[sTestType].skipped,
		            			oKpi[sTestType].assertion, sTimestamp, aRow[0].tcid];
            	}else{ //Insert a new test result
            		console.log("Create a new " + sTestType +" test result: timestamp = " + sTimestamp);
					sSqlSave = "INSERT INTO " + sTestType + 
					       "(pid, branch, passed, failed, skipped, assertion, timestamp) VALUES(?,?,?,?,?,?,?)";
		            aParamSave = [sProjectId, sBranch, oKpi[sTestType].passed, oKpi[sTestType].failed, oKpi[sTestType].skipped,
		            			oKpi[sTestType].assertion, sTimestamp];
            	}

				var oDBSave = new DB({
					name: "sccd"
				});
				oDBSave.connect();
            	oDBSave.query(sSqlSave, aParamSave, function(oError, oResult){
	            	if(oError){
	            		console.log("DB error:" + oError.message);
	            		return;
	            	}
	            	console.log("Save " + sTestType +" test kpi successfully.");
	            });
	            oDBSave.close();
            });
		}
	});
	oDB.close();
}).catch(function(sReason){
	console.log("Save test kpi failed: " + sReason);
	oDB.close();
});