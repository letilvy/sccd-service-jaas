#!/usr/bin/node

var HTTP = require("http");
var DB = require("../lib/db");

var oServer = HTTP.createServer(function(request, response){
    var sUrl = request.url;
    
    response.writeHead(200, HTTP.STATUS_CODES[200], {
        'Content-Type': 'text/plain'
    });

    request.on("data", function(chunk){
        response.write("XC Test");
    });

    request.on("end", function(){
        var oDB = new DB({name: "i306293"});

        // var oConn = db.createConnection({
        //     host: "localhost",
        //     user: "guest",
        //     password: "guest",
        //     port: "3306",
        //     database: "i306293"
        // });

        oDB.connect();

        oDB.query("select * from user", function(oError, aResult){
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

        oDB.close();
    });
}).listen(1918);