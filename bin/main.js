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
	return oProject.getTestKpi();
}).then(function(oKpi){
	console.log("Get project test kpi: " + JSON.stringify(oKpi));
});
