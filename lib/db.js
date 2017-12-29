var MySQL = require("mysql");

module.exports = DB;

function DB(options){
    this.sDbName = options.name;
    this._oConnection = null;
};

DB.prototype.connect = function(){
    this._oConnection = MySQL.createConnection({
        host: "localhost",
        user: "guest",
        password: "guest",
        database: this.sDbName,
        port: "3306"
    });
    this._oConnection.connect();
};

DB.prototype.close = function(){
    if(this._oConnection){
        this._oConnection.end();
        this._oConnection = null;
    }
};

DB.prototype.query = function(sSql, aParam, fnCallback){
    if(aParam && Array.isArray(aParam)){
        this._oConnection.query(sSql, aParam, fnCallback);
    }else{
        this._oConnection.query(sSql, fnCallback);
    }
};

