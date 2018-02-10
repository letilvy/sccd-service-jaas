#!/usr/bin/node

var HTTP = require("http");
var DB = require("../lib/db");
var MySql = require("mysql");

//var oDB = new DB({name: "sccd"});

var oServer = HTTP.createServer(function(request, response){
    var sUrl = request.url;

    console.log(sUrl);
    
    response.writeHead(200, HTTP.STATUS_CODES[200], {
        'Content-Type': 'text/plain'
    });

    request.on("data", function(chunk){
        response.write("XC Test");
    });

    request.on("end", function(){
        /*var oDB = new DB({name: "sccd"});*/

        var oDB = MySql.createConnection({
            host: "localhost",
            user: "root",
            password: "i306293",
            port: "3306",
            database: "sccd"
        });

        oDB.connect();

        oDB.query("select * from UT", function(oError, aResult){
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

        //oDB.close();
        oDB.end();
        
    });
}).listen(1519);
