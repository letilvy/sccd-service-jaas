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

DB.prototype.post = function(sGWName, oDContent) {
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
                    if (response.statusCode == 400) {
                        // console.log(response.socket._events.error);
                    } else {
                        console.log(sGWName + " Table has been modified successfully.\n");
                    }
                });
                response.on("error", function(e) {
                    console.error("error: " + e.message);
                });

            });
            var oContent = {
                "d": oDContent
            };
            reqPost.write(JSON.stringify(oDContent));
            reqPost.end();
        });
    });
    reqToken.end();
}

module.exports = DB;