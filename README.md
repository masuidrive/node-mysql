# node-mysql

node-mysql is pure Javascript MySQL network driver for [node.js](http://nodejs.org/)


# Want to help
It's for testing stage.
Now It can use for this driver developer only.

I have a lot of tasks for to make stable driver.
I want your help.

## Tests
I want to you using for protoype or test project.
It's testing stage, It's not for real project
When you find bugs, strange thing and unknown thing, please send to [@masuidrive_en](http://twitter.com/masuidrive_en) or [github issues](http://github.com/masuidrive/node-mysql/issues)
If you write test code (test folder), It's awesome!!

## Documents

Sorry, This driver's document is less.
My English skill is horrible. :-(

This drivers is came from Ruby's mysql driver.
Almost API is same as [mysql.rb](http://github.com/tmtm/ruby-mysql/blob/2.9/lib/mysql.rb). maybe [this document](http://tmtm.org/en/mysql/ruby/) is useful reference.


## Pool mananager
 Currently, this driver supported single connection only.
We need multi mysql driver pool manager for multi connections.
And connection pool require transaction support.


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
    conn.query("SELECT * FROM test1;",
        function(result) {
            for(var i=0; i<result.records.length; ++i) {
                sys.puts("Result: "+sys.inspect(result.toHash(result.records[i])));
            };
        },
        function(error) {
            sys.puts("Error: "+sys.inspect(error));
        });

And see exmaples folder.


# Requirements

* [node.js](http://nodejs.org/) >= 0.1.33


Optional:

* [node-crypt](http://github.com/waveto/node-crypto) for faster authenticate.


# License

MIT License. See LICENSE file.


# Who?

Code by Yuichiro MASUI(masuidrive) and awesome contributers.
please see [AUTHORS](http://github.com/masuidrive/node-mysql/blob/master/AUTHORS)

* <masui@masuidrive.jp>
* [http://blog.masuidrive.jp/](http://masuidrive.com/) (English)
* [http://twitter.com/masuidrive_en](http://twitter.com/masuidrive_en/) (English)
* [http://blog.masuidrive.jp/](http://blog.masuidrive.jp/) (Japanese)
* [http://twitter.com/masuidrive](http://twitter.com/masuidrive/) (Japanese)


# Related licenses

MySQL protocol encode/decode from tmtm's ruby-mysql.

* [http://github.com/tmtm/ruby-mysql](http://github.com/tmtm/ruby-mysql)
* Copyright: Copyright (c) 2009-2010 TOMITA Masahiro 
* License: Ruby's

Promise library

* [http://nodejs.org/](http://nodejs.org/)
* Copyright 2009, 2010 Ryan Lienhart Dahl. All rights reserved.
* License: MIT

SHA1 library from Takanori Ishikawa.

* [http://www.metareal.org/](http://www.metareal.org/)
* Copyright (c) 2008  Takanori Ishikawa  <takanori.ishikawa@gmail.com>
* License: MIT

pack/unpack from php.js

* [http://phpjs.org/functions/pack:880](http://phpjs.org/functions/pack:880)
* Author: Tim de Koning (http://www.kingsquare.nl)
* License: BSD

