"use strict";

var https = require("https");

function DB(){}

function setOptions(sMethod, sPath, oHeader) {
    return {
        hostname: "i7d.wdf.sap.corp",
        method: sMethod,
        auth: "i344121:19911105syq",
        rejectUnauthorized: false,
        path: "/odata/sccd/" + sPath,
        headers: Object.assign({
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/json; charset=utf-8",
            "DataServiceVersion": "2.0"
        }, oHeader)
    }
}

// DB.prototype.getToken = function(){
//     var options = setOptions("GET", "$metadata", {"X-CSRF-Token": "Fetch"});
//     return https.request(options);
// };

DB.prototype.insertNewUpdateExistDBItem = function(sGWName, oDContent) {
    var options = setOptions("GET", "$metadata", {"X-CSRF-Token": "Fetch"});
    var reqToken = https.request(options, function(response) {
        var body = [];
        response.on("data", function(chunk) {
            body.push(chunk);
        });

        response.on("end", function() {
            options = setOptions('POST', sGWName, {"Cookie": response.headers["set-cookie"],"X-CSRF-Token": response.headers["x-csrf-token"]});
            var reqPost = https.request(options, function(response) {
                body = [];
                response.on("data", function(chunk) {
                    body.push(chunk);
                });

                response.on("end", function() {
                    console.log("Project Table has been modified successfully.");
                });
            });
            var oContent = {
                "d": oDContent
            };
            reqPost.write(JSON.stringify(oConent));
            reqPost.end();
        });
    });
    reqPost.end();
}

module.exports = DB;