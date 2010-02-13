var sys = require('sys');
var events = require('events');
var Protocol = require('./mysql/protocol').Protocol;

exports.createConnection = function(hostname, username, password, dbname, port) {
    var conn = new Connection();
    conn.connect.apply(conn, arguments);
    return conn;
};

var Connection = function() {
    this.protocol = undefined;
}

Connection.prototype.connect = function(hostname, username, password, dbname, port) {
    this.protocol = new Protocol(hostname, port);
    this.protocol.authenticate(username, password, dbname);
}

Connection.prototype.query = function(sql) {
    var promise = new events.Promise();
    var nfields = this.protocol.query_command(sql).addCallback(function(nfields) {
	sys.puts("nfields:"+sys.inspect(nfields));
    }).addErrback(function(type, message) {
	// TODO
    });
    return promise;
}
exports.Connection = Connection;

/*
node-mysql
A node.js interface for MySQL

Author: masuidrive <masui@masuidrive.jp>
License: MIT License
Copyright (c) Yuichiro MASUI

# Original:
# http://github.com/tmtm/ruby-mysql
# Copyright (C) 2009-2010 TOMITA Masahiro
# mailto:tommy@tmtm.org
# License: Ruby's
*/
