#!/usr/bin/node

var http = require("http");

var oServer = http.createServer(function(request, response){
    var sUrl = request.url;
    
    response.writeHead(200, http.STATUS_CODES[200], {
        'Content-Type': 'text/plain'
    });

    request.on("data", function(chunk){
        response.write("XC Test");
    });

    request.on("end", function(){
        if(sUrl.match("XCSet")){
            response.end(JSON.stringify({
                "key1": "Wei",
                "key2": "Xiaocheng"
            }));
        }else{
            response.end(JSON.stringify({
                "key1": "I306293",
                "key2": "SAP-IUser"
            }));
        }
    });
}).listen(1918);