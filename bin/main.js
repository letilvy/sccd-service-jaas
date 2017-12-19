#! /usr/bin/env node

//var Http = require("http");
var Project = require("../lib/project");

var oProject  = new Project({
	workSpace: "../data/B1 SMP PUM"
});

oProject.getProjectId().then(function(sId){
	console.log("Project id: " + sId);
});

oProject.getTestKpi("unit").then(function(oKpi){
	console.log("Unit test: passed-" + oKpi.passed + ", failed-" + oKpi.failed+ ", skipped-" + oKpi.skipped + ", assertions-" + oKpi.assertion);
});

oProject.getTestKpi("integration").then(function(oKpi){
	console.log("Integration test: passed-" + oKpi.passed + ", failed-" + oKpi.failed+ ", skipped-" + oKpi.skipped + ", assertions-" + oKpi.assertion);
});
