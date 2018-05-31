var FS = require("fs");
var PATH = require("path");
var CHILD_PROC = require("child_process");
var UTIL = require("util");
var DB = require("./db");


exports.deleteFile = function(sPath, fnCallback){
	if(FS.existsSync(sPath)){
		CHILD_PROC.exec(
			UTIL.format('rm -rf %s', sPath), fnCallback);
	}
};

exports.getTimestamp = function(oDate){
	var sYear = oDate.getFullYear();
	var sMonth = oDate.getMonth() + 1;
	var sDay = oDate.getDate();
	var sHour = oDate.getHours();
	var sMin = oDate.getMinutes();
	var sSec = oDate.getSeconds();
	
	sMonth = sMonth < 10 ? ("0" + sMonth):sMonth;
	sDay = sDay < 10 ? ("0" + sDay):sDay;
	sHour = sHour < 10 ? ("0" + sHour):sHour;
	sMin = sMin < 10 ? ("0" + sMin):sMin;
	sSec = sSec < 10 ? ("0" + sSec):sSec;

	return String(sYear) + String(sMonth) + String(sDay) + String(sHour) + String(sMin) + String(sSec);
};

exports.executeSql = function(sSql, aParam, vExtra){
	if(sSql){
		var oDB = new DB({
			name: "sccd"
		});
		oDB.connect();
		if(typeof vExtra === "function"){
			oDB.query(sSql, aParam, vExtra);
		}else{
			oDB.query(sSql, aParam, function(oError, oResult){
		    	if(oError){
		    		console.log("DB error:" + oError.message);
		    		return;
		    	}
		    	console.log(vExtra);
		    });
		}
	    oDB.close();
	}
};

exports.selectDBItem = function(oParam){
	var aKey = Object.keys(oParam.keys);
	var sSql = "SELECT " + oParam.values.join(",") +
					" FROM " + oParam.table +
					" WHERE " + aKey.map(function(sKey){ return sKey + "=?"; }).join(" AND ") +
								(oParam.specialCondition !== undefined ? (" AND " + oParam.specialCondition) : "");
	var aParam = aKey.map(function(sKey){
		return oParam.keys[sKey];
	});

	this.executeSql(sSql, aParam, oParam.fnCallback);
};

exports.insertDBItem = function(oParam){
	var aValKey = Object.keys(oParam.values);
	var sSql = "INSERT INTO " + oParam.table +
					"(" + aValKey.join(",") + ")" +
					"VALUES(" + aValKey.map(function(sKey){ return "?"; }).join(",") + ")";
	var aParam = aValKey.map(function(sKey){
		return oParam.values[sKey];
	});

    this.executeSql(sSql, aParam, "Insert " + oParam.table + " values: " + JSON.stringify(oParam.values) + " successfully.");
};

exports.updateDBItem = function(oParam){
	var aValKey = Object.keys(oParam.values);
	var aKey = Object.keys(oParam.keys);
	var sSql = "UPDATE " + oParam.table + 
					" SET " + aValKey.map(function(sKey){ return sKey + "=?"; }).join(",") +
					" WHERE " + aKey.map(function(sKey){ return sKey + "=?"; }).join(" AND ");
	var aParam = aValKey.map(function(sKey){
		return oParam.values[sKey];
	}).concat(aKey.map(function(sKey){
		return oParam.keys[sKey];
	}));

	this.executeSql(sSql, aParam, "Update " + oParam.table + " keys: " + JSON.stringify(oParam.keys) + ", values: " + JSON.stringify(oParam.values) + " successfully.");
};

exports.insertNewUpdateExistDBItem = function(bUpdate, oParam){
	this.selectDBItem({
		table: oParam.table,
		values: Object.keys(oParam.keys),
		keys: oParam.keys,
		fnCallback: function(oError, aRow){
	    	if(oError){
	    		console.log("Check " + oParam.table + " (" + JSON.stringify(oParam.keys) + ") existence failed. Message: " + oError.message);
	    		return;
	    	}
	    	
	    	if(aRow.length === 0){ //Insert a new item
	    		console.log("Create a new " + oParam.table + " " + JSON.stringify(Object.assign({}, oParam.keys, oParam.values)));

		        ToolKit.insertDBItem({
	    			table: oParam.table,
	    			values: Object.assign({}, oParam.keys, oParam.values)
	    		});
	    	}else if(bUpdate){
	    		console.log("Update an existing " + oParam.table + ", keys: " + JSON.stringify(oParam.keys) + ", values: " + JSON.stringify(oParam.values));

	    		ToolKit.updateDBItem({
	    			table: oParam.table,
	    			keys: oParam.keys,
	    			values: oParam.values
	    		});
	    	}else{
	    		console.log(oParam.table + " with keys: " + JSON.stringify(oParam.keys) + " exist yet.");
	    	}
	    }
	});
};