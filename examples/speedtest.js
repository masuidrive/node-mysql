var
  sys   = require("sys"),
  mysql = require('../lib/mysql');

var puts = sys.puts;
var inspect = sys.inspect;

function readTest(db) {
  var t0 = new Date;
  var rows = 0;
  conn.query("SELECT * FROM t1;", function(result) {
      var d = ((new Date)-t0)/1000;
      puts("**** " + result.records.length + " rows in " + d + "s (" + (result.records.length/d) + "/s)");
      
      conn.close();
  });
}

function writeTest(db, i, callback) {
  conn.query("INSERT INTO t1 VALUES (1);", function (row) {
    if (!--i) {
      // end of results
      var dt = ((new Date)-t0)/1000;
      puts("**** " + count + " insertions in " + dt + "s (" + (count/dt) + "/s)");

      if (callback) callback(db);
    }
    else {
      writeTest(db, i--, callback);
    }
  });
}

var count = 100000;
var t0;

/*
> mysql -u root
CREATE DATABASE nodejs_mysql  DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
GRANT ALL ON nodejs_mysql.* TO nodejs_mysql@localhost IDENTIFIED BY "nodejs_mysql";
*/
var conn = new mysql.Connection('localhost','nodejs_mysql', 'nodejs_mysql', 'nodejs_mysql');
conn.connect();

conn.query("DROP TABLE t1;");

conn.query("CREATE TABLE t1 (alpha INTEGER) TYPE=MEMORY;", function () {
  puts("create table callback" + inspect(arguments));
  t0 = new Date;
  writeTest(conn, count, readTest);
});

