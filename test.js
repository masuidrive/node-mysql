var sys = require('sys');
var mysql = require('./lib/mysql');

var conn = new mysql.Connection('localhost','nodejs_mysql', 'nodejs_mysql', 'nodejs_mysql');
setTimeout(function() {
    conn
	.query("SELECT now();")
	.addCallback(function(n) {
	    sys.puts("!");
	})
	.addErrback(function(type, message) {
	    sys.puts("Error: "+type+" "+message);
	});
//sys.puts(sys.inspect(conn.query_command("select now() as N;")));
}, 1000);

/*
  CREATE DATABASE nodejs_mysql;
  GRANT ALL ON nodejs_mysql.* TO nodejs_mysql@localhost IDENTIFIED BY "nodejs_mysql";
*/