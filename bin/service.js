#!/usr/bin/node

var HTTP = require("http");
var URL = require("url");
var DB = require("../lib/db");
var MySql = require("mysql");


var oServer = HTTP.createServer(function(request, response){
    var sUrl = request.url;
    console.log(sUrl);

    //Parse the URL and route to corresponding entityset
    var oUrl = URL.parse(sUrl, true);
    var sEntitySet, oUrlParam;
    if(oUrl.pathname.match(/(\w+)$/)){
        sEntitySet = oUrl.pathname.match(/(\w+)$/)[0];
        oUrlParam = oUrl.query
    }
    
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
            user: "guest",
            password: "guest",
            port: "3306",
            database: "sccd"
        });

        oDB.connect();

        switch(sEntitySet){
            case "HomeSet":
                var sHomeQuery = "select ut.projectId, ut.projectName, ut.teamId, ut.teamName, ut.passed+ut.failed totalUT, ut.assertion UTAssertion, it.passed+ut.failed totalIT, it.assertion ITAssertion from (select ut.tcid tcid, ut.pid projectId, p.name projectName, p.team teamId, t.name teamName, ut.passed passed, ut.failed failed, ut.assertion assertion, ut.branch branch, ut.timestamp timestamp from (select t.pid, substring_index(group_concat(t.tcid), ',', -1) last_commit_id from (select u.tcid, u.pid, u.timestamp  from UT u  where timestamp > 0  and branch = 'master'  order by u.pid asc, timestamp desc) t group by t.pid) l left join UT ut on l.last_commit_id = ut.tcid left join Project p on ut.pid = p.pid left join Team t on p.team = t.tid) ut left join (select it.tcid tcid, it.pid projectId, p.name projectName, p.team teamId, t.name teamName, it.passed passed, it.failed failed, it.assertion assertion, it.branch branch, it.timestamp timestamp from (select i.pid, substring_index(group_concat(i.tcid), ',', -1) last_commit_id from (select i.tcid, i.pid, i.timestamp  from IT i  where timestamp > 0  and branch = 'master'  order by i.pid asc, i.timestamp desc) i group by i.pid) l left join IT it on l.last_commit_id = it.tcid left join Project p on it.pid = p.pid left join Team t on p.team = t.tid) it on ut.projectId = it.projectId order by ut.teamId desc, ut.assertion desc, it.assertion desc";
                oDB.query(sHomeQuery, function(oError, aResult){
                    if(oError){
                        console.log("[Database error] - ", oError.message); //write header instead
                        return;
                    }

                    response.end(JSON.stringify(aResult));
                });
                break;

            case "UTSet":
                var sUTQuery = "select ut.tcid tcid, ut.pid projectId, p.name projectName, p.team teamId, t.name teamName, ut.passed passed, ut.failed failed, ut.assertion assertion, ut.branch branch, ut.timestamp timestamp from (select t.pid, substring_index(group_concat(t.tcid), ',', -1) last_commit_id from (select u.tcid, u.pid, u.timestamp from UT u where timestamp > 0 and branch = 'master' order by u.pid asc, timestamp desc) t group by t.pid) l left join UT ut on l.last_commit_id = ut.tcid left join Project p on ut.pid = p.pid left join Team t on p.team = t.tid order by p.team desc, ut.assertion desc";
                oDB.query(sUTQuery, function(oError, aResult){
                    if(oError){
                        console.log("[Database error] - ", oError.message); //write header instead
                        return;
                    }

                    response.end(JSON.stringify(aResult));
                });
                break;

            case "ProjectDetailUTSet":
                var sProDetailUTQuery = "select ut.tcid tcid, ut.pid projectId, p.name projectName, ut.passed passed, ut.failed failed, ut.assertion assertion, p.team teamId, t.name teamName, ut.timestamp timestamp from UT ut left join Project p on (ut.pid = p.pid ) left join Team t on (p.team = t.tid) where ut.pid = 'sap.support.sae'  and ut.branch='master' order by timestamp desc";
                oDB.query(sProDetailUTQuery, function(oError, aResult){
                    if(oError){
                        console.log("[Database error] - ", oError.message); //write header instead
                        return;
                    }

                    response.end(JSON.stringify(aResult));
                });
                break;
           
            case "ITSet":
                var sITQuery = "select  it.tcid tcid, it.pid projectId, p.name projectName, p.team teamId, t.name teamName, it.passed passed, it.failed failed, it.assertion assertion, it.branch branch, it.timestamp timestamp from (select  i.pid,  substring_index(group_concat(i.tcid), ',', -1) last_commit_id from  (select      i.tcid,     i.pid,     i.timestamp     from IT i     where timestamp > 0     and branch = 'master'     order by i.pid asc, i.timestamp desc) i group by i.pid) l left join IT it on l.last_commit_id = it.tcid left join Project p on it.pid = p.pid left join Team t on p.team = t.tid order by p.team desc, it.assertion desc";
                oDB.query(sITQuery, function(oError, aResult){
                    if(oError){
                        console.log("[Database error] - ", oError.message); //write header instead
                        return;
                    }

                    response.end(JSON.stringify(aResult));
                });
                break;

            case "ProjectDetailITSet":
                var sProjectDetailITQuery = "select  it.tcid tcid, it.pid projectId, p.name projectName, it.passed passed, it.failed failed, it.assertion assertion, p.team teamId, t.name teamName, it.timestamp timestamp from IT it left join Project p on (it.pid = p.pid ) left join Team t on (p.team = t.tid) where it.pid = 'sap.support.sae'  and it.branch='master' order by timestamp desc";
                oDB.query(sProjectDetailITQuery, function(oError, aResult){
                    if(oError){
                        console.log("[Database error] - ", oError.message); //write header instead
                        return;
                    }

                    response.end(JSON.stringify(aResult));
                });
                break;
        }

        //oDB.close();
        oDB.end();
    });
}).listen(1519);
