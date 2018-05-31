#! /usr/bin/env node

var Project = require("../lib/project");
var Job = require("../lib/job");
var DB = require("../lib/db");
var ToolKit = require("../lib/toolkit");
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
var sWorkSpace = "../data/workspace/B1_SMP_PUM"; //Use "../data/B1_SMP_PUM" for UI5 code debug purpose
//var sWorkSpace = "../data/workspace/BCD_ABAP_UT"; //Use "../data/BCD_ABAP_UT" for ABAP code debug purpose

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

//Save project information
oProject.getProjectId().then(function(sProjectId){
	var sProjectName = sProjectId.substr(sProjectId.lastIndexOf(".")+1);
	ToolKit.insertNewUpdateExistDBItem(false, {
		table: "Project",
		keys: {
			pid: sProjectId,
			type: sProjectType
		},
		values: {
			name: sProjectName
		}
	});

	/*ToolKit.selectDBItem({
		table: "Project",
		values: ["pid"],
		keys: {
			pid: sProjectId,
			type: sProjectType
		},
		fnCallback: function(oError, aRow){
	    	if(oError){
	    		console.log("Check project " + sProjectId + " (type: " + sProjectType + ") existence failed. Message: " + oError.message);
	    		return;
	    	}
	    	
	    	if(aRow.length === 0){ //Insert a new test result
	    		var sProjectName = sProjectId.substr(sProjectId.lastIndexOf(".")+1);
	    		console.log("Create a project, id: " + sProjectId + ", name: " + sProjectName + ", type: " + sProjectType);

		        ToolKit.insertDBItem({
	    			table: "Project",
	    			values: {
						pid: sProjectId,
						name: sProjectName,
						type: sProjectType
	    			}
	    		});
	    	}else{
	    		console.log("Project " + sProjectId + " (type: " + sProjectType + ") exist yet.");
	    	}
	    }
	});*/
}).catch(function(sReason){
	console.log("Save project information failed: " + sReason);
});


//Save project test KPI
Promise.all([oProject.getProjectId(), oProject.getTestKpi(), oProject.getUTCoverage()]).then(function(aResult){
	var sProjectId = aResult[0], oKpi = aResult[1], oCoverage = aResult[2];
	var sTimestamp = ToolKit.getTimestamp(new Date());

	console.log("Get project id: " + sProjectId);

	(Object.keys(Project.TestType)).forEach(function(sTestTypeKey){
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

			ToolKit.selectDBItem({
				table: sTestType,
				values: ["tcid"],
				keys: {
					pid: sProjectId,
					type: sProjectType
				},
				specialCondition: "timestamp LIKE '" + sTimestamp.slice(0,8) +"%'",
				fnCallback: function(oError, aRow){
	            	if(oError){
	            		console.log("Check " + sProjectId + "-" + sTimestamp.slice(0,8) + " test kpi existence failed. Message: " + oError.message);
	            		return;
	            	}
	            	
	            	if(aRow.length){ //Update the record with the latest test result
	            		console.log("Update an existing " + sTestType +" test result: tcid = " + aRow[0].tcid + ", timestamp = " + sTimestamp);
			            ToolKit.updateDBItem({
			    			table: sTestType,
			    			keys: {
			    				tcid: aRow[0].tcid
			    			},
			    			values: Object.assign({
								pid: sProjectId,
								type: sProjectType,
								branch: sBranch,
								passed: oKpi[sTestType].passed,
								failed: oKpi[sTestType].failed,
								skipped: oKpi[sTestType].skipped,
								assertion: oKpi[sTestType].assertion,
								timestamp: sTimestamp
			    			}, (sTestType === Project.TestType.Unit ? {
			    				inclstmtlines: oCoverage.Included.validLines,
			    				inclstmtcover: oCoverage.Included.lineRate,
			    				allstmtlines: oCoverage.All.validLines,
			    				allstmtcover: oCoverage.All.lineRate
			    			}:{}))
			    		});
	            	}else{ //Insert a new test result
	            		console.log("Create a new " + sTestType +" test result: timestamp = " + sTimestamp);
			            ToolKit.insertDBItem({
			    			table: sTestType,
			    			values: Object.assign({
								pid: sProjectId,
								type: sProjectType,
								branch: sBranch,
								passed: oKpi[sTestType].passed,
								failed: oKpi[sTestType].failed,
								skipped: oKpi[sTestType].skipped,
								assertion: oKpi[sTestType].assertion,
								timestamp: sTimestamp
			    			}, (sTestType === Project.TestType.Unit ? {
			    				inclstmtlines: oCoverage.Included.validLines,
			    				inclstmtcover: oCoverage.Included.lineRate,
			    				allstmtlines: oCoverage.All.validLines,
			    				allstmtcover: oCoverage.All.lineRate
			    			}:{}))
			    		});
	            	}
				}
			});
		}
	});
}).catch(function(sReason){
	console.log("Save test kpi failed: " + sReason);
});



var oJob = new Job({
	workSpace: sWorkSpace
});

oProject.getProjectId().then(function(sProjectId){
	var sTestType = null;
	(Object.keys(Project.TestType)).every(function(sTestTypeKey){
		if(!!oProject.getTestReportPath(Project.TestType[sTestTypeKey])){
			sTestType = Project.TestType[sTestTypeKey];
			return false;
		}
	});
	if(!sTestType){
		console.log("Cannot determine test type of the job.");
		return;
	}

	ToolKit.selectDBItem({
		table: "Job",
		values: ["name"],
		keys: {
			pid: sProjectId,
			ptype: sProjectType,
			ttype: sTestType
		},
		fnCallback: function(oError, aRow){
			var sJobName = oJob.getJobBaseName();
			if(oError){
	    		console.log("Check job " + sJobName + " (project: " + sProjectId + ", type: " + sProjectType + ", test: " + sTestType + ") existence failed. Message: " + oError.message);
	    		return;
	    	}
	    	
	    	if(aRow.length === 0){
	    		ToolKit.insertDBItem({
	    			table: "Job",
	    			values: {
	    				pid: sProjectId,
	    				ptype: sProjectType,
	    				ttype: sTestType,
	    				name: sJobName,
	    				lastbuild: oJob.getLastBuildNumber()
	    			}
	    		});
	    	}else if(aRow[0].name !== sJobName){
	    		ToolKit.updateDBItem({
	    			table: "Job",
	    			keys: {
	    				pid: sProjectId,
	    				ptype: sProjectType,
	    				ttype: sTestType
	    			},
	    			values: {
						name: sJobName,
	    				lastbuild: oJob.getLastBuildNumber()
	    			}
	    		});
	    	}else{
	    		console.log("Job " + sJobName + " (project: " + sProjectId + ", type: " + sProjectType + ", test: " + sTestType + ") exist yet.");
	    	}
		}
	});
}).catch(function(sReason){
	console.log("Save job information failed: " + sReason);
});

// Job cleanup because of jenkins memory space limitation
if(sProjectType === Project.Type.FrontEnd){ //ABAP UT does not consume too much space. So we not do cleanup here. However daily job wil still cleanup its data
	oJob.deleteJobNoKeepFiles();
}
oJob.deleteUIArtifact();