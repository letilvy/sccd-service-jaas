#! /usr/bin/env node

//var Http = require("http");
var Http = require("https");
var Project = require("../lib/project");
//var ODataModel = require("https://sapui5.hana.ondemand.com/resources/sap/ui/model/odata/v2/ODataModel.js"); 

var oProject  = new Project({
	workSpace: "../data/B1 SMP PUM"
});

oProject.getProjectId().then(function(sId){
	console.log("XC: " + sId);
});

oProject.getTestKpi("unit").then(function(oKpi){
	console.log("XC: " + oKpi.passed + ":" + oKpi.failed + ":" + oKpi.assertion);
});

oProject.getTestKpi("integration").then(function(oKpi){
	console.log("XC: " + oKpi.passed + ":" + oKpi.failed + ":" + oKpi.assertion);
});

/* 
 * Test http request to I7D
*/
/*var fnResponse = function(oResponse){
	console.log("Status Code: " + oResponse.statusCode + "\n");
	console.log("Headers: " + oResponse.headers);

	var vBody = [];

	oResponse.on("data", function(oChunk){
		vBody.push(oChunk);
	});

	oResponse.on("error", function(oError){
		console.error(oError);
	});

	oResponse.on("end", function(){
		vBody = Buffer.concat(vBody);
		console.log(vBody.toString());
	});
};*/

//Way 1
/*var options = {
	hostname: "i7d.wdf.sap.corp",
	port: 443,
	path: "/odata/sbou/ContacterSet('0006269256')",
	method: "GET",
	rejectUnauthorized: false,
	headers: {
		"Content-Type": "application/http"
	}
}; 

var oRequest = Http.request(options, fnResponse);*/

//oRequest.write("request body data");

/*oRequest.on("error", function(oError){
	console.error(oError);
});

oRequest.end();*/

//Way 2
//Http.get("https://i7d.wdf.sap.corp:443/odata/sbou/ContacterSet('0006269256')", fnResponse);


//Way 3
/*var oDataMode = new ODataModel("https://i7d.wdf.sap.corp/odata/sbou");
console.log(oDataMode.getMetadata().getName());*/

//Way 4
/*$.ajax({
	url: "https://i7d.wdf.sap.corp/odata/sbou/ContacterSet('0006269256')",
	success: function(){
		console.log("Hello");
	},
});*/
