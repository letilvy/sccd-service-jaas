#! /usr/bin/env node

var Project = require("../lib/project");
var Job = require("../lib/job");
var DB = require("../lib/db");
var Argv = require("optimist").boolean("cors").argv;

/***
	Run the program in CLI like:
	  node main.js -p <jenkins_job_workspace_path> -b <branch_name>
	Or
	  node main.js <jenkins_job_workspace_path> <branch_name>
	Or
	  sccd <jenkins_job_workspace_path> <branch_name> //on jenkins server
	Or
	  sccd -p <jenkins_job_workspace_path> -b <branch_name> -i <project_id> //on jenkins server
	You can get the first CLI parameter through process.argv[2]
*/
if(Argv.h || Argv.help){
  	console.log([
  		'',
	    'usage: node main.js [options]',
	    '',
	    'options:',
	    '  -p           Jenkins job workspace path. e.g.:/var/lib/jenkins/workspace/B1_SMP_PUM',
	    '  -i           Project id. This is mandatory when it is a back-end service job for UI5 app',
	    '  -b           Branch which test case run on [master]',
	    '  -h --help    Print this list and exit.'
  	].join('\n'));
  	process.exit();
}


var aArgv = process.argv.slice(2);

//var sWorkSpace = Argv.p || aArgv[0] || "./";
//var sWorkSpace = "../data/workspace/B1_SMP_PUM"; //Use "../data/B1_SMP_PUM" for UI5 code debug purpose
var sWorkSpace = "../data/workspace/BCD_ABAP_UT"; //Use "../data/BCD_ABAP_UT" for ABAP code debug purpose

var oProject = new Project({
	workSpace: sWorkSpace,
	projectId: Argv.i
});

var sProjectType = oProject.getProjectType();
//Need to specify project id when run sccd command for an back-end jenkins job
if(sProjectType === Project.Type.BackEnd && !Argv.i){
	console.log("Project id is mandatory when it is a back-end service job for UI5 app.");
	process.exit();
}

var oDB = new DB({
	name: "sccd"
});

//${GIT_BRANCH} has a prefix "origin/", while ${GERRIT_BRANCH} does not
var sBranch = "master";
if(Argv.b && Argv.b.match(/^.*\/(\w+)$/)){
	sBranch = (Argv.b.match(/^.*\/(\w+)$/))[1];
}else if(Argv.b){
	sBranch = Argv.b;
}else if(aArgv[1] && aArgv[1].match(/^.*\/(\w+)$/)){
	sBranch = (aArgv[1].match(/^.*\/(\w+)$/))[1];
}else if(aArgv[1]){
	sBranch = aArgv[1];
}
console.log("Get branch name: " + sBranch);

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

//Save project information
oProject.getProjectId().then(function(sProjectId){
	oDB.connect();
	//Check project record exist or not
	sSqlCheck = "SELECT pid FROM Project WHERE pid=? AND type=?";
    aParamCheck = [sProjectId, sProjectType];
    oDB.query(sSqlCheck, aParamCheck, function(oError, aRow){
    	if(oError){
    		console.log("Check project " + sProjectId + " (type: " + sProjectType + ") existence failed. Message: " + oError.message);
    		return;
    	}
    	
    	var sSqlSave, aParamSave;
    	if(aRow.length === 0){ //Insert a new test result
    		var sProjectName = sProjectId.substr(sProjectId.lastIndexOf(".")+1);
    		console.log("Create a project, id: " + sProjectId + ", name: " + sProjectName + ", type: " + sProjectType);
			sSqlSave = "INSERT INTO Project(pid, name, type) VALUES(?,?,?)";
            aParamSave = [sProjectId, sProjectName, sProjectType];

            var oDBSave = new DB({
				name: "sccd"
			});
			oDBSave.connect();
	    	oDBSave.query(sSqlSave, aParamSave, function(oError, oResult){
	        	if(oError){
	        		console.log("DB error:" + oError.message);
	        		return;
	        	}
	        	console.log("Save project id: " + sProjectId + ", name: " + sProjectName + ", type: " + sProjectType + " successfully.");
	        });
	        oDBSave.close();
    	}else{
    		console.log("Project " + sProjectId + " (type: " + sProjectType + ") exist yet.");
    	}
    });          
	oDB.close();
}).catch(function(sReason){
	console.log("Save project information failed: " + sReason);
	oDB.close();
});


//Save project test KPI
Promise.all([oProject.getProjectId(), oProject.getTestKpi(), oProject.getUTCoverage()]).then(function(aResult){
	var sProjectId = aResult[0], oKpi = aResult[1], oCoverage = aResult[2];
	var sTimestamp = getTimestamp(new Date());

	console.log("Get project id: " + sProjectId);

	oDB.connect();
	(Object.keys(Project.TestType)).forEach(function(sTestTypeKey){
		var sSqlCheck, aParamCheck;
		var sTestType = Project.TestType[sTestTypeKey];

		if(oKpi[sTestType].assertion){
			console.log("Get " + sTestType + " test kpi: passed-" + oKpi[sTestType].passed + ", " +
														"failed-" + oKpi[sTestType].failed + ", " +
														"skipped-" + oKpi[sTestType].skipped + ", " +
														"assertion-" + oKpi[sTestType].assertion +
														(sTestType === Project.TestType.Unit ?
															(", included stmt lines-" + oCoverage.Included.validLines + ", " + 
															"included stmt coverage-" + oCoverage.Included.lineRate + ", " + 
															"all stmt lines-" + oCoverage.All.validLines + ", " + 
															"all stmt coverage-" + oCoverage.All.lineRate):"")
														);

			//Check test kpi of today has been recorded or not
			sSqlCheck = "SELECT tcid FROM " + sTestType +
				   " WHERE pid=? AND type=? AND timestamp LIKE '" + sTimestamp.slice(0,8) +"%'" +
				   " ORDER BY timestamp desc";
		    aParamCheck = [sProjectId, sProjectType];
		    oDB.query(sSqlCheck, aParamCheck, function(oError, aRow){
            	if(oError){
            		console.log("Check " + sProjectId + "-" + sTimestamp.slice(0,8) + " test kpi existence failed. Message: " + oError.message);
            		return;
            	}
            	
            	var sSqlSave, aParamSave;
            	var aCoverage = [oCoverage.Included.validLines, oCoverage.Included.lineRate, oCoverage.All.validLines, oCoverage.All.lineRate];
            	if(aRow.length){ //Update the record with the latest test result
            		console.log("Update an existing " + sTestType +" test result: tcid = " + aRow[0].tcid + ", timestamp = " + sTimestamp);
            		sSqlSave = "UPDATE " + sTestType +
            			   " SET pid=?, type=?, branch=?, passed=?, failed=?, skipped=?, assertion=?, timestamp=?" +
            			   (sTestType === Project.TestType.Unit ? ", inclstmtlines=?, inclstmtcover=?, allstmtlines=?, allstmtcover=?" : "") +
            			   " WHERE tcid=?";
            		aParamSave = [sProjectId, sProjectType, sBranch, oKpi[sTestType].passed, oKpi[sTestType].failed, oKpi[sTestType].skipped,
		            			oKpi[sTestType].assertion, sTimestamp].concat(
		            				(sTestType === Project.TestType.Unit ? aCoverage : []),
		            				[aRow[0].tcid]
		            			);
            	}else{ //Insert a new test result
            		console.log("Create a new " + sTestType +" test result: timestamp = " + sTimestamp);
					sSqlSave = "INSERT INTO " + sTestType + 
					       "(pid, type, branch, passed, failed, skipped, assertion, timestamp" +
					       (sTestType === Project.TestType.Unit ? ", inclstmtlines, inclstmtcover, allstmtlines, allstmtcover" : "") +
					       ")" +
					       " VALUES(?,?,?,?,?,?,?,?" +
					       (sTestType === Project.TestType.Unit ? ",?,?,?,?" : "") +
					       ")";
		            aParamSave = [sProjectId, sProjectType, sBranch, oKpi[sTestType].passed, oKpi[sTestType].failed, oKpi[sTestType].skipped,
		            			oKpi[sTestType].assertion, sTimestamp].concat(
		            				(sTestType === Project.TestType.Unit ? aCoverage : [])
		            			);
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


// Job cleanup because of jenkins memory space limitation
var oJob = new Job({
	workSpace: sWorkSpace
});

if(sProjectType === Project.Type.FrontEnd){ //ABAP UT does not consume too much space. So we not do cleanup here. However daily job wil still cleanup its data
	oJob.deleteJobNoKeepFiles();
}
oJob.deleteUIArtifact();