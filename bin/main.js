#! /usr/bin/env node

/***
	Run the program in CLI like:
	  node main.js jenkins_job_workspace_path
	You can get the first CLI parameter through process.argv[2]
*/

var Project = require("../lib/project");
var DB = require("../lib/db");

var aArgv = process.argv.slice(2);

function getTimestamp(){
	var oDate = new Date();
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

var oProject  = new Project({
	workSpace: aArgv[0] //"../data/B1 SMP PUM"
});

oProject.getProjectId().then(function(sId){
	console.log("Get project id: " + sId);
	return oProject.getTestKpi();
}).then(function(oKpi){
	console.log("Get project test kpi: " + JSON.stringify(oKpi));
});


console.log("Get time:" + getTimestamp() + "\n");
