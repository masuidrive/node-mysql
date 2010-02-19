var sys = require('sys');
var mysql = require('./lib/mysql');

/*
> mysql -u root
CREATE DATABASE nodejs_mysql;
GRANT ALL ON nodejs_mysql.* TO nodejs_mysql@localhost IDENTIFIED BY "nodejs_mysql";
*/
var conn = new mysql.Connection('localhost','nodejs_mysql', 'nodejs_mysql', 'nodejs_mysql');
conn.connect();
conn.query("CREATE TEMPORARY TABLE test1(intval INTEGER, strval TEXT, timestampval TIMESTAMP, boolval BOOLEAN);");
conn.query("INSERT INTO test1 VALUES(1,'a',now(),true);");
conn.query("SELECT * FROM test1;")
    .addCallback(function(result) {
        for(var i=0; i<result.records.length; ++i) {
            sys.puts("Result: "+sys.inspect(result.toHash(result.records[i])));
        };
        conn.close();
    })
    .addErrback(function(type, message) {
        sys.puts(type+": "+message);
        conn.close();
    });
