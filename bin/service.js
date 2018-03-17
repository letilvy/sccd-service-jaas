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
        oUrlParam = oUrl.query;
        if(Object.keys(oUrlParam).length > 0){
            console.log("Get url parameter: " + JSON.stringify(oUrlParam));
        }
    }

    response.writeHead(200, HTTP.STATUS_CODES[200], {
        'Content-Type': 'text/plain'
    });

    request.on("data", function(chunk){
        response.write("XC Test");
    });

    request.on("end", function(){

        if(sEntitySet === "KpiSet"){
            var sSqlTotalProject = "select count(*) totalProjects from Project";
            var sSqlTop3Active = "select u.pid projectId, p.name projectName, u.passed, u.failed, u.passed+failed totalUT, count(*) commit_times, max(u.tcid) tcid from UT u, Project p where DATE_SUB(CURDATE(), INTERVAL 30 DAY) <= date(timestamp) and u.pid = p.pid group by u.pid order by commit_times desc, u.tcid desc limit 3";
            var sSqlHealthyUTProject = "select * from (select count(*) UT_TotalProject from (select t.pid, substring_index(group_concat(t.tcid), ',', -1) last_commit_id from (select u.tcid,   u.pid,   u.timestamp from UT u where timestamp > 0 and branch = 'master' order by u.pid asc, timestamp desc) t group by t.pid) l left join UT ut on l.last_commit_id = ut.tcid) total,  (select count(*) UT_FailedProject from (select t.pid, substring_index(group_concat(t.tcid), ',', -1) last_commit_id from (select u.tcid,   u.pid,   u.timestamp from UT u where timestamp > 0 and branch = 'master' order by u.pid asc, timestamp desc) t group by t.pid) l left join UT ut on l.last_commit_id = ut.tcid where ut.failed > 0) failed,  (select count(*) UT_PassedProject from (select t.pid, substring_index(group_concat(t.tcid), ',', -1) last_commit_id from (select u.tcid,   u.pid,   u.timestamp from UT u where timestamp > 0 and branch = 'master' order by u.pid asc, timestamp desc) t group by t.pid) l left join UT ut on l.last_commit_id = ut.tcid where ut.failed = 0) passed";
            var sSqlHealthyITProject = "select * from (select count(*) IT_TotalProject from (select i.pid, substring_index(group_concat(i.tcid), ',', -1) last_commit_id from (select i.tcid, i.pid, i.timestamp from IT i where timestamp > 0 and branch = 'master' order by i.pid asc, i.timestamp desc) i group by i.pid) l left join IT it on l.last_commit_id = it.tcid) total, (select count(*) IT_FailedProject from (select i.pid, substring_index(group_concat(i.tcid), ',', -1) last_commit_id from (select i.tcid, i.pid, i.timestamp from IT i where timestamp > 0 and branch = 'master' order by i.pid asc, i.timestamp desc) i group by i.pid) l left join IT it on l.last_commit_id = it.tcid where it.failed > 0) failed, (select count(*) IT_PassedProject from (select i.pid, substring_index(group_concat(i.tcid), ',', -1) last_commit_id from (select i.tcid, i.pid, i.timestamp from IT i where timestamp > 0 and branch = 'master' order by i.pid asc, i.timestamp desc) i group by i.pid) l left join IT it on l.last_commit_id = it.tcid where it.failed = 0) passed";

            var aKpiSql = [sqlPromise(sSqlTotalProject), sqlPromise(sSqlTop3Active), sqlPromise(sSqlHealthyUTProject), sqlPromise(sSqlHealthyITProject)];
            Promise.all(aKpiSql).then(function(aKpi){
                response.end(JSON.stringify({
                    "totalProjects": aKpi[0][0].totalProjects,
                    "topActive": aKpi[1],
                    "UTStatus": {
                        totalUTProjects: aKpi[2][0].UT_TotalProject,
                        healthyUTProjects: aKpi[2][0].UT_PassedProject,
                        unhealthyUTProjects: aKpi[2][0].UT_FailedProject
                    },
                    "ITStatus": {
                        totalITProjects: aKpi[3][0].IT_TotalProject,
                        healthyITProjects: aKpi[3][0].IT_PassedProject,
                        unhealthyITProjects: aKpi[3][0].IT_FailedProject,
                    }
                }));
            }, function(sErrorMsg){
                console.log(sErrorMsg); //write header instead
            });

        }else{
            var sQuery = null, bEntity = false;
            switch(sEntitySet){
                case "HomeSet":
                    sQuery = "select ut.projectId, ut.projectName, ut.teamId, ut.teamName, ut.inclstmtlines includedLine, ut.inclstmtcover includedCover, ut.allstmtlines allLine, ut.allstmtcover allCover, ut.passed+ut.failed totalUT, ut.assertion UTAssertion, it.passed+ut.failed totalIT, it.assertion ITAssertion from (select ut.tcid tcid, ut.pid projectId, p.name projectName, p.team teamId, t.name teamName, ut.inclstmtlines, ut.inclstmtcover, ut.allstmtlines, ut.allstmtcover, ut.passed passed, ut.failed failed, ut.assertion assertion, ut.branch branch, ut.timestamp timestamp from (select t.pid, substring_index(group_concat(t.tcid), ',', -1) last_commit_id from (select u.tcid, u.pid, u.timestamp  from UT u  where timestamp > 0  and branch = 'master'  order by u.pid asc, timestamp desc) t group by t.pid) l left join UT ut on l.last_commit_id = ut.tcid left join Project p on ut.pid = p.pid left join Team t on p.team = t.tid) ut left join (select it.tcid tcid, it.pid projectId, p.name projectName, p.team teamId, t.name teamName, it.passed passed, it.failed failed, it.assertion assertion, it.branch branch, it.timestamp timestamp from (select i.pid, substring_index(group_concat(i.tcid), ',', -1) last_commit_id from (select i.tcid, i.pid, i.timestamp  from IT i  where timestamp > 0  and branch = 'master'  order by i.pid asc, i.timestamp desc) i group by i.pid) l left join IT it on l.last_commit_id = it.tcid left join Project p on it.pid = p.pid left join Team t on p.team = t.tid) it on ut.projectId = it.projectId order by ut.teamId desc, ut.assertion desc, it.assertion desc";
                    break;

                case "UTSet":
                    /**
                     * Return unit test overview of all projects when project id is not specified,
                     *   and return unit test history of specical project when project id is provided. 
                     */
                    if(!oUrlParam.pid){
                        sQuery = "select ut.tcid tcid, ut.pid projectId, p.name projectName, p.team teamId, t.name teamName, ut.passed passed, ut.failed failed, ut.assertion assertion, ut.inclstmtlines includedLine, ut.inclstmtcover includedCover, ut.allstmtlines allLine, ut.allstmtcover allCover, ut.timestamp timestamp from (select t.pid, substring_index(group_concat(t.tcid), ',', -1) last_commit_id from (select u.tcid, u.pid, u.timestamp from UT u where timestamp > 0 and branch = 'master' order by u.pid asc, timestamp desc) t group by t.pid) l left join UT ut on l.last_commit_id = ut.tcid left join Project p on ut.pid = p.pid left join Team t on p.team = t.tid order by p.team desc, ut.assertion desc";
                    }else{
                        //sQuery = "select ut.tcid tcid, ut.pid projectId, p.name projectName, ut.passed passed, ut.failed failed, ut.assertion assertion, p.team teamId, t.name teamName, ut.timestamp timestamp from UT ut left join Project p on (ut.pid = p.pid ) left join Team t on (p.team = t.tid) where ut.pid = '" + oUrlParam.pid + "'  and ut.branch='master' order by timestamp asc";
                        sQuery = "select ut.tcid tcid, ut.pid projectId, p.name projectName, ut.passed passed, ut.failed failed,  ut.passed + ut.failed allTestCases, ut.assertion assertion, ut.inclstmtlines includedLine, ut.inclstmtcover includedCover, ut.allstmtlines allLine, ut.allstmtcover allCover, p.team teamId, t.name teamName, ut.timestamp timestamp from UT ut left join Project p on (ut.pid = p.pid ) left join Team t on (p.team = t.tid) where ut.pid = '" + oUrlParam.pid + "' and ut.branch='master' order by timestamp desc limit 30";
                        //aQuery = "select ut1.tcid, ut1.pid projectId, p.name projectName, p.team teamId, t.name teamName, ut1.type, ut1.branch, ut1.passed, ut1.failed, ut1.skipped, ut1.assertion, case when ut1.inclstmtcover is null then ut2.inclstmtcover else ut1.inclstmtcover end inclstmtcover, case when ut1.inclstmtlines is null then ut2.inclstmtlines else ut1.inclstmtlines end inclstmtlines, case when ut1.allstmtcover is null then ut2.allstmtcover else ut1.allstmtcover end allstmtcover, case when ut1.allstmtlines is null then ut2.allstmtlines else ut1.allstmtlines end allstmtlines, ut1.timestamp from UT ut1, UT ut2 left join Project p on (ut2.pid = p.pid ) left join Team t on (p.team = t.tid) where ut1.pid = ut2.pid and ut2.timestamp = ( select min(ut3.timestamp) from UT ut3 where ut3.pid = ut2.pid and inclstmtcover is not null) and ut1.pid = '"+ oUrlParam.pid +"' and ut1.branch = 'master' order by timestamp desc limit 30";
                    }
                    break;
               
                case "ITSet":
                    /**
                     * Return integration test overview of all projects when project id is not specified,
                     *   and return integration test history of specical project when project id is provided. 
                     */
                    if(!oUrlParam.pid){
                        sQuery = "select  it.tcid tcid, it.pid projectId, p.name projectName, p.team teamId, t.name teamName, it.passed passed, it.failed failed, it.assertion assertion, it.branch branch, it.timestamp timestamp from (select  i.pid,  substring_index(group_concat(i.tcid), ',', -1) last_commit_id from  (select      i.tcid,     i.pid,     i.timestamp     from IT i     where timestamp > 0     and branch = 'master'     order by i.pid asc, i.timestamp desc) i group by i.pid) l left join IT it on l.last_commit_id = it.tcid left join Project p on it.pid = p.pid left join Team t on p.team = t.tid order by p.team desc, it.assertion desc";
                    }else{
                        sQuery = "select it.tcid tcid, it.pid projectId, p.name projectName, it.passed passed, it.failed failed, it.passed + it.failed allTestCases, it.assertion assertion, p.team teamId, t.name teamName, it.timestamp timestamp from IT it left join Project p on (it.pid = p.pid ) left join Team t on (p.team = t.tid) where it.pid = '" + oUrlParam.pid + "' and it.branch='master' order by timestamp asc";
                    }
                    break;

                case "F4ProjectSet":
                    sQuery = "select p.pid projectId, p.name projectName, p.contact projectContact, p.team teamId, t.name teamName, t.contact teamContact from Project p left join Team t on (p.team = t.tid)";
                    break;
            }

            if(sQuery){
                sqlPromise(sQuery).then(function(aResult){
                    response.end(JSON.stringify(bEntity ? aResult[0] : aResult));
                }, function(sErrorMsg){
                    console.log(sErrorMsg); //write header instead
                });
            }
        }
    });
}).listen(1519);


function sqlPromise(sSql){
    return new Promise(function(resolve, reject){
        try{
            /*var oDB = new DB({name: "sccd"});*/
            var oDB = MySql.createConnection({
                host: "localhost",
                user: "guest",
                password: "guest",
                port: "3306",
                database: "sccd"
            });

            oDB.connect();

            oDB.query(sSql, function(oError, aResult){
                if(oError){
                    reject("[Database error] - " + oError.message);
                }

                resolve(aResult);
            });

            oDB.end();

        }catch(error){
            reject(error);
        }
    });
}
