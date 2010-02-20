// Connection:
// MySQL connection
var sys = require('sys');
var events = require('events');
var result = require('./mysql/result');
var Protocol = require('./mysql/protocol').Protocol;
process.mixin(require('./mysql/common'));
var constants = require('./mysql/constants')
exports.constants = constants;

var quote = function(str) {
    return str.replace(/[\0\n\r\\\'\"\x1a]/g, function(s) {
	switch(s) {
        case "\0":
	    return "\\0";
        case "\n":
	    return "\\n";
        case "\r":
	    return "\\r";
        case "\x1a":
	    return "\\Z";
        default:
	    return "\\"+s;
	}
    });
}
exports.quote = quote;


var Connection = function(hostname, username, password, dbname, port) {
    events.EventEmitter.call(this);
    this.protocol = undefined;
    this.active = false;
    this.connect_parameter = Array.prototype.slice.call(arguments);
}
sys.inherits(Connection, events.EventEmitter);
exports.Connection = Connection;

Connection.prototype.connect = function() {
    this.protocol = new Protocol(this.connect_parameter[0], this.connect_parameter[4]);
    this.protocol.addListener('connect', scope(this, function() {	
	this.active = false;
	this.emit('connect');
    }));
    this.protocol.addListener('close', scope(this, function() {	
	this.active = false;
	this.emit('close');
    }));
    this.protocol.addListener('authorized', scope(this, function() {	
	this.active = true;
	this.emit('authorized');
    }));
    this.protocol.addListener('authorize error', scope(this, function() {	
	this.active = false;
	this.emit('authorize error');
    }));
    return this.protocol.authenticate(this.connect_parameter[1], this.connect_parameter[2], this.connect_parameter[3]);
}

Connection.prototype.close = function() {
    this.protocol.close();
}

Connection.prototype.option = function(option) {
    this.protocol.close();
}

Connection.prototype.query = function(sql) {
    var promise = new events.Promise();
    this.protocol.query_command(sql)
	.addCallback(scope(this, function(nfields) {
	    if(nfields) {
		this.protocol.retr_fields(nfields)
		    .addCallback(scope(this, function(fields) {
			this.fields = fields;
			this.get_result()
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

Connection.prototype.set_server_option = function(opt) {
    return this.protocol.set_option_command(opt);
}

Connection.prototype.get_result = function(fields) {
    var res = new result.Result(this.fields.map(function(field) {
	return(new Field(field));
    }), this.protocol);
    return res.fetch_all();
}

Connection.prototype.has_more_results = function() {
    return !!(this.protocol.server_status & constants.server.MORE_RESULTS_EXISTS);
}

Connection.prototype.next_result = function(fields) {
    var promise = new events.Promise();
    if(!this.has_more_results()) {
	promise.emitError("ClientError", "Don't have more results");
	return promise;
    }
    this.protocol.get_result()
	.addCallback(scope(this, function(nfields) {
	    this.protocol.retr_fields(nfields)
		.addCallback(scope(this, function(fields) {
		    this.fields = fields;
		    this.result_exist = true;
		    this.get_result()
			.addCallback(scope(this, function(results) {
			    promise.emitSuccess(results);
			}))
			.addErrback(scope(this, function(type, message) {
			    promise.emitError(type, message);
			}));
		}))
		.addErrback(scope(this, function(type, message) {
		    promise.emitError(type, message);
		}));
	}))
	.addErrback(scope(this, function(type, message) {
	    promise.emitError(type, message);
	}));

    return promise;
}


var Field = function(packet) {
    this.db = packet.db;
    this.table = packet.table;
    this.org_table = packet.org_table;
    this.name = packet.name;
    this.org_name = packet.org_name;
    this.charsetnr = packet.charsetnr;
    this.length = packet.length;
    this.type = packet.type;
    this.flags = packet.flags;
    this.decimals = packet.decimals;
    this.defaultVal = packet.defaultVal;
}
exports.Field = Field;

Field.prototype.is_num = function() {
    return [constants.field.TYPE_DECIMAL, constants.field.TYPE_TINY, constants.field.TYPE_SHORT, constants.field.TYPE_LONG, constants.field.TYPE_FLOAT, constants.field.TYPE_DOUBLE, constants.field.TYPE_LONGLONG, constants.field.TYPE_INT24].indexOf(this.type.id) >= 0;
}

Field.prototype.is_not_null = function() {
    return !!(this.flags & constants.field.NOT_NULL_FLAG);
}

Field.prototype.is_pri_key = function() {
    return !!(this.flags & constants.field.PRI_KEY_FLAG);
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
