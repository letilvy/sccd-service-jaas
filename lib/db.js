var mysql = require("mysql");

module.exports = {
    connection: null,

    connect: function(sDbName){
        this.connection = mysql.createConnection({
            host: "localhost",
            user: "guest",
            password: "guest",
            database: "i306293",
            port: "3306"
        });
        return this.connection.connect();
    },

    close: function(){
        if(this.connection){
            this.connection.end();
            this.connection = null;
        }
    },

    query: function(sSql, fnCallback){
        this.connection.query(sSql, fnCallback);
    }
};