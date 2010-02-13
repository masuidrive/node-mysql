// Connection:
// MySQL connection
var sys = require('sys');
var events = require('events');
var Protocol = require('./mysql/protocol').Protocol;

exports.createConnection = function(hostname, username, password, dbname, port) {
    var conn = new Connection();
    conn.connect.apply(conn, arguments);
    return conn;
};

var Connection = function() {
    events.EventEmitter.call(this);
    this.protocol = undefined;
}
exports.Connection = Connection;

Connection.prototype.connect = function(hostname, username, password, dbname, port) {
    var self = this;
    this.protocol = new Protocol(hostname, port);
    this.protocol.addListener('connect', function() {	
	this.emit('connect');
    });
    this.protocol.addListener('disconnect', function() {	
	this.emit('disconnect');
    });
    this.protocol.addListener('authorize error', function() {	
	this.emit('authorize error');
    });
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
