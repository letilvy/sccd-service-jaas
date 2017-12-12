#!/usr/bin/node

var http = require("http");
var db = require("mysql");

var oServer = http.createServer(function(request, response){
    var sUrl = request.url;
    
    response.writeHead(200, http.STATUS_CODES[200], {
        'Content-Type': 'text/plain'
    });

    request.on("data", function(chunk){
        response.write("XC Test");
    });

    request.on("end", function(){
        var oConn = db.createConnection({
            host: "localhost",
            user: "guest",
            password: "guest",
            port: "3306",
            database: "i306293"
        });

        oConn.connect();

        oConn.query("select * from user", function(oError, aResult){
            if(oError){
                console.log("[Database error] - ", oError.message); //write header instead
                return;
            }
            if(sUrl.match("XCSet")){
                response.end(JSON.stringify(aResult));
            }else{
                response.end(JSON.stringify({
                    "key1": "I306293",
                    "key2": "SAP-IUser"
                }));
            }
        });

        oConn.end();
    });
}).listen(1918);