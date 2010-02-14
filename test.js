var sys = require('sys');
var mysql = require('./lib/mysql');

var conn = new mysql.Connection();
conn.connect('localhost','nodejs_mysql', 'nodejs_mysql', 'nodejs_mysql')
    .addCallback(function() {
	conn.query("SELECT now();")
	    .addCallback(function(n) {
		sys.puts("result: "+sys.inspect(n));
	    })
	    .addErrback(function(type, message) {
		sys.puts("Error: "+type+" "+message);
	    });
    });

/*
  CREATE DATABASE nodejs_mysql;
  GRANT ALL ON nodejs_mysql.* TO nodejs_mysql@localhost IDENTIFIED BY "nodejs_mysql";
*/