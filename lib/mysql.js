// Connection:
// MySQL connection
var sys = require('sys');
var events = require('events');
var result = require('./mysql/result');
var Protocol = require('./mysql/protocol').Protocol;
process.mixin(require('./mysql/common'));
patchForPromiseLateChain(events.Promise); // under 0.1.29
 
exports.createConnection = function(hostname, username, password, dbname, port) {
    var conn = new Connection();
    conn.connect.apply(conn, arguments);
    return conn;
};

var Connection = function() {
    events.EventEmitter.call(this);
    this.protocol = undefined;
    this.active = false;
    this.connect_parameter = [];
}
sys.inherits(Connection, events.EventEmitter);
exports.Connection = Connection;

Connection.prototype.connect = function(hostname, username, password, dbname, port) {
    this.connect_parameter = Array.prototype.slice.call(arguments);
    this.protocol = new Protocol(hostname, port);
    this.protocol.addListener('connect', scope(this, function() {	
	this.active = false;
	this.emit('connect');
    }));
    this.protocol.addListener('disconnect', scope(this, function() {	
	this.active = false;
	this.emit('disconnect');
    }));
    this.protocol.addListener('authorized', scope(this, function() {	
	this.active = true;
	this.emit('authorized');
    }));
    this.protocol.addListener('authorize error', scope(this, function() {	
	this.active = false;
	this.emit('authorize error');
    }));
    return this.protocol.authenticate(username, password, dbname)
}

Connection.prototype.query = function(sql) {
    var promise = new events.Promise();
    var nfields = this.protocol.query_command(sql)
	.addCallback(scope(this, function(nfields) {
	    if(nfields) {
		this.protocol.retr_fields(nfields)
		    .addCallback(scope(this, function(fields) {
			var res = new result.Result(fields, this.protocol);
			res.fetch_all()
			    .addCallback(scope(this, function(rows) {
				this.server_status = this.protocol.server_status;
				promise.emitSuccess(rows);
			    }))
			    .addErrback(scope(this, function(type, message) {
				promise.emitError(type, message);
			    }));
		    }))
		    .addErrback(scope(this, function(type, message) {
			promise.emitError(type, message);
		    }));
	    }
	    else {
		this.affected_rows = this.protocol.affected_rows;
		this.insert_id = this.protocol.insert_id;
		this.server_status = this.protocol.server_status;
		this.warning_count = this.protocol.warning_count;
		this.info = this.protocol.message;
		promise.emitSuccess();
		// TODO
	    }
	}))
	.addErrback(scope(this, function(type, message) {
	    promise.emitError(type, message);
	}));
    return promise;
}

// Private:
Connection.prototype.store_result = function(fields) {
    var result = new result.Result(fields, this.protocol);
    return res.fetch_all();
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
