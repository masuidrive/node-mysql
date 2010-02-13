var sys = require('sys');
var events = require('events');
var Protocol = require('./mysql/protocol').Protocol;

var Connection = function(hostname, username, password, dbname, port) {
    this.protocol = new Protocol(hostname, port);
    if(username) {
	this.protocol.authenticate(username, password, dbname);
    }
};

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
