#!/usr/bin/node

var HTTP = require("http");
var DB = require("../lib/db");
var MySql = require("mysql");

//var oDB = new DB({name: "sccd"});

var oServer = HTTP.createServer(function(request, response){
    var sUrl = request.url;
    //TODO: parse the url for entityset and parameter
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

        //projectId

        //HomeSet: list all test cases of UT and IT
        /*var queryStr = "";
       
        oDB.query(queryStr, function(oError, aResult){
            if(oError){
                console.log("[Database error] - ", oError.message); //write header instead
                return;
            }

            if(sUrl.match("UITSet")){
                response.end(JSON.stringify(aResult));
            }else{
                response.end(JSON.stringify({
                    "key1": "I306293",
                    "key2": "SAP-IUser"
                }));
            }
        });*/

        //UTSet: list the last commit UT data of all project
        /*
          select
                ut.tcid,
                ut.pid,
                ut.name,
                ut.team,
                t.name,
                ut.passed,
                ut.failed,
                ut.assertion,
                ut.branch,
                ut.timestamp
            from
                (select 
                    ut.tcid,
                    ut.pid,
                    p.name,
                    p.team,
                    ut.passed,
                    ut.failed,
                    ut.assertion,
                    ut.branch,
                    ut.timestamp
                from
                    (select 
                        ut.tcid,
                        ut.pid,
                        ut.passed,
                        ut.failed,
                        ut.assertion,
                        ut.branch,
                        ut.timestamp
                    from
                        (select 
                            t.pid, 
                            substring_index(group_concat(t.tcid), ',', -1) last_commit_id
                        from 
                            (select 
                                u.tcid,
                                u.pid,
                                u.timestamp
                            from UT u
                            where timestamp > 0
                            and branch = 'master'
                            order by u.pid asc, timestamp desc) t group by t.pid) l
                    left join UT ut
                    on l.last_commit_id = ut.tcid) ut
                left join Project p
                on ut.pid = p.pid) ut
            left join Team t
            on ut.team = t.tid
            order by ut.team, ut.assertion desc
        */
        var sUTQuery = "select ut.tcid, ut.pid, ut.name, ut.team, t.name, ut.passed, ut.failed, ut.assertion, ut.branch, ut.timestamp from (select ut.tcid, ut.pid, p.name, p.team, ut.passed, ut.failed, ut.assertion, ut.branch, ut.timestamp from (select ut.tcid, ut.pid, ut.passed, ut.failed, ut.assertion, ut.branch, ut.timestamp from (select t.pid, substring_index(group_concat(t.tcid), ',', -1) last_commit_id from (select u.tcid, u.pid, u.timestamp from UT u where timestamp > 0 and branch = 'master' order by u.pid asc, timestamp desc) t group by t.pid) l left join UT ut on l.last_commit_id = ut.tcid) ut left join Project p on ut.pid = p.pid) ut left join Team t on ut.team = t.tid order by ut.team, ut.assertion desc";
        oDB.query(sUTQuery, function(oError, aResult){
            if(oError){
                console.log("[Database error] - ", oError.message); //write header instead
                return;
            }

            if(sUrl.match("UTSet")){
                response.end(JSON.stringify(aResult));
            }else{
                response.end(JSON.stringify({
                    "key1": "I306293",
                    "key2": "SAP-IUser"
                }));
            }
        });

        //ProjectDetailUTSet: list history UT data with specified project
        oDB.query("select u.tcid, p.name, u.passed, u.failed, u.assertion, u.skipped, u.timestamp from Project p, UT u where p.pid = u.pid and p.pid='sap.support.expertchat' order by timestamp;", function(oError, aResult){
            if(oError){
                console.log("[Database error] - ", oError.message); //write header instead
                return;
            }

            if(sUrl.match("ProjectDetailUTSet")){
                response.end(JSON.stringify(aResult));
            }else{
                response.end(JSON.stringify({
                    "key1": "I306293",
                    "key2": "SAP-IUser"
                }));
            }
        });

        //ITSet

        //ProjectDetailITSet

        //oDB.close();
        oDB.end();
    });
}).listen(1519);
