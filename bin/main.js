#! /usr/bin/env node

/***
	Run the program in CLI like:
	  node main.js jenkins_job_workspace_path
	You can get the first CLI parameter through process.argv[2]
*/

var Project = require("../lib/project");

var aArgv = process.argv.slice(2);

var oProject  = new Project({
	workSpace: aArgv[0] //"../data/B1 SMP PUM"
});

oProject.getProjectId().then(function(sId){
	console.log("Get project id: " + sId);
});

oProject.getTestKpi("unit").then(function(oKpi){
	console.log("Unit test: passed-" + oKpi.passed + ", failed-" + oKpi.failed+ ", skipped-" + oKpi.skipped + ", assertions-" + oKpi.assertion);
});

oProject.getTestKpi("integration").then(function(oKpi){
	console.log("Integration test: passed-" + oKpi.passed + ", failed-" + oKpi.failed+ ", skipped-" + oKpi.skipped + ", assertions-" + oKpi.assertion);
});
