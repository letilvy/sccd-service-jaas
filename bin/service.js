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
        
       /* var sHomeQuery = "select ut.projectId, ut.projectName, ut.teamId, ut.teamName, ut.passed+ut.failed totalUT, ut.assertion UTAssertion, it.passed+ut.failed totalIT, it.assertion ITAssertion from (select ut.tcid tcid, ut.pid projectId, p.name projectName, p.team teamId, t.name teamName, ut.passed passed, ut.failed failed, ut.assertion assertion, ut.branch branch, ut.timestamp timestamp from (select t.pid, substring_index(group_concat(t.tcid), ',', -1) last_commit_id from (select u.tcid, u.pid, u.timestamp  from UT u  where timestamp > 0  and branch = 'master'  order by u.pid asc, timestamp desc) t group by t.pid) l left join UT ut on l.last_commit_id = ut.tcid left join Project p on ut.pid = p.pid left join Team t on p.team = t.tid) ut left join (select it.tcid tcid, it.pid projectId, p.name projectName, p.team teamId, t.name teamName, it.passed passed, it.failed failed, it.assertion assertion, it.branch branch, it.timestamp timestamp from (select i.pid, substring_index(group_concat(i.tcid), ',', -1) last_commit_id from (select i.tcid, i.pid, i.timestamp  from IT i  where timestamp > 0  and branch = 'master'  order by i.pid asc, i.timestamp desc) i group by i.pid) l left join IT it on l.last_commit_id = it.tcid left join Project p on it.pid = p.pid left join Team t on p.team = t.tid) it on ut.projectId = it.projectId order by ut.teamId desc, ut.assertion desc, it.assertion desc";
        oDB.query(sHomeQuery, function(oError, aResult){
            if(oError){
                console.log("[Database error] - ", oError.message); //write header instead
                return;
            }

            if(sUrl.match("HomeSet")){
                response.end(JSON.stringify(aResult));
            }else{
                response.end(JSON.stringify({
                    "key1": "I306293",
                    "key2": "SAP-IUser"
                }));
            }
        });*/

        var sUTQuery = "select ut.tcid tcid, ut.pid projectId, p.name projectName, p.team teamId, t.name teamName, ut.passed passed, ut.failed failed, ut.assertion assertion, ut.branch branch, ut.timestamp timestamp from (select t.pid, substring_index(group_concat(t.tcid), ',', -1) last_commit_id from (select u.tcid, u.pid, u.timestamp from UT u where timestamp > 0 and branch = 'master' order by u.pid asc, timestamp desc) t group by t.pid) l left join UT ut on l.last_commit_id = ut.tcid left join Project p on ut.pid = p.pid left join Team t on p.team = t.tid order by p.team desc, ut.assertion desc";
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

        var sProDetailUTQuery = "select ut.tcid tcid, ut.pid projectId, p.name projectName, ut.passed passed, ut.failed failed, ut.assertion assertion, p.team teamId, t.name teamName, ut.timestamp timestamp from UT ut left join Project p on (ut.pid = p.pid ) left join Team t on (p.team = t.tid) where ut.pid = 'sap.support.sae'  and ut.branch='master' order by timestamp desc";
        oDB.query(sProDetailUTQuery, function(oError, aResult){
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
       
        var sITQuery = "select  it.tcid tcid, it.pid projectId, p.name projectName, p.team teamId, t.name teamName, it.passed passed, it.failed failed, it.assertion assertion, it.branch branch, it.timestamp timestamp from (select  i.pid,  substring_index(group_concat(i.tcid), ',', -1) last_commit_id from  (select      i.tcid,     i.pid,     i.timestamp     from IT i     where timestamp > 0     and branch = 'master'     order by i.pid asc, i.timestamp desc) i group by i.pid) l left join IT it on l.last_commit_id = it.tcid left join Project p on it.pid = p.pid left join Team t on p.team = t.tid order by p.team desc, it.assertion desc";
        oDB.query(sITQuery, function(oError, aResult){
            if(oError){
                console.log("[Database error] - ", oError.message); //write header instead
                return;
            }

            if(sUrl.match("ITSet")){
                response.end(JSON.stringify(aResult));
            }else{
                response.end(JSON.stringify({
                    "key1": "I306293",
                    "key2": "SAP-IUser"
                }));
            }
        });

        var sProjectDetailITQuery = "select  it.tcid tcid, it.pid projectId, p.name projectName, it.passed passed, it.failed failed, it.assertion assertion, p.team teamId, t.name teamName, it.timestamp timestamp from IT it left join Project p on (it.pid = p.pid ) left join Team t on (p.team = t.tid) where it.pid = 'sap.support.sae'  and it.branch='master' order by timestamp desc";
        oDB.query(sProjectDetailITQuery, function(oError, aResult){
            if(oError){
                console.log("[Database error] - ", oError.message); //write header instead
                return;
            }

            if(sUrl.match("ProjectDetailITSet")){
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
