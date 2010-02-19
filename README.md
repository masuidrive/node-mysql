# node-mysql

node-mysql is pure Javascript MySQL network driver for [node.js](http://nodejs.org/)


# Current status
It could not for development and production.

Now It can execute query and get results. It don't have error handling.

I'll work for error/timeout handling, prepared statements, more and more tests.


# Example

    var sys = require('sys');
    var mysql = require('./lib/mysql');
    
    /*
    > mysql -u root
    CREATE DATABASE nodejs_mysql;
    GRANT ALL ON nodejs_mysql.* TO nodejs_mysql@localhost IDENTIFIED BY "nodejs_mysql";
    */
    var conn = new mysql.Connection();
    conn.connect('localhost','nodejs_mysql', 'nodejs_mysql', 'nodejs_mysql');
    conn.query("CREATE TEMPORARY TABLE test1(intval INTEGER, strval TEXT, timestampval TIMESTAMP, boolval BOOLEAN);");
    conn.query("INSERT INTO test1 VALUES(1,'a',now(),true);");
    conn.query("SELECT * FROM test1;")
        .addCallback(function(result) {
            for(var i=0; i<result.records.length; ++i) {
                sys.puts("Result: "+sys.inspect(result.toHash(result.records[i])));
            };
        })
        .addErrback(function(type, message) {
            sys.puts("Error: "+type+" "+message);
        });

# Requirements

* [node.js](http://nodejs.org/) >= 0.1.29


Optional:

* [node-crypt](http://github.com/waveto/node-crypto) for faster authenticate.


# License

MIT License. See LICENSE file.


# Who?

Code by Yuichiro MASUI a.k.a. masuidrive

* <masui@masuidrive.jp>
* [http://blog.masuidrive.jp/](http://blog.masuidrive.jp/)


# Included files

MySQL protocol encode/decode from tmtm's ruby-mysql.

* [http://github.com/tmtm/ruby-mysql](http://github.com/tmtm/ruby-mysql)
* Copyright: Copyright (c) 2009-2010 TOMITA Masahiro 
* License: Ruby's

SHA1 library from Takanori Ishikawa.

* [http://www.metareal.org/](http://www.metareal.org/)
* Copyright (c) 2008  Takanori Ishikawa  <takanori.ishikawa@gmail.com>
* License: MIT

pack/unpack from php.js

* [http://phpjs.org/functions/pack:880](http://phpjs.org/functions/pack:880)
* Author: Tim de Koning (http://www.kingsquare.nl)
* License: BSD

