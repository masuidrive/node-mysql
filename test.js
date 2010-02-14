var sys = require('sys');
var mysql = require('./lib/mysql');

var conn = new mysql.Connection();
conn.connect('localhost','nodejs_mysql', 'nodejs_mysql', 'nodejs_mysql')
    .addCallback(function() {
	 //conn.query("SELECT now();")
	//conn.query("SELECT * FROM test1;")
	conn.query("SELECT 1,2.3,'abc',true,null,'val' as value;")
	    .addCallback(function(res) {
		for(var i=0; i<res.length; ++i) {
		    sys.puts("Result: "+sys.inspect(res[i].toHash()));
		};
	    })
	    .addErrback(function(type, message) {
		sys.puts("Error: "+type+" "+message);
	    });
    });

/*
  CREATE DATABASE nodejs_mysql;
  GRANT ALL ON nodejs_mysql.* TO nodejs_mysql@localhost IDENTIFIED BY "nodejs_mysql";
*/