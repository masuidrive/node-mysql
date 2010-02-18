// Protocol:
// MySQL Protocol 
var sys = require('sys');
var events = require('events');
var pack = require('./pack');
var cons = require('./constants');
var packet = require('./packet');
var auth = require('./auth');
var Charset = require('./charset').Charset;
var Types = require('./types').Types;
var RawConnection = require('./raw_conn').RawConnection;
process.mixin(require('./common'));

var Protocol = function(host, port) {
    events.EventEmitter.call(this);
    this.state = undefined;
    this.ready_state_queue = [];
    this.charset = undefined;
    this.authinfo = undefined;
    this.server_info = undefined;
    this.server_version = undefined;
    this.thread_id = undefined;
    this.message = undefined;
    this.affected_rows = undefined;
    this.insert_id = undefined;
    this.server_status = undefined;
    this.warning_count = undefined;
    
    this.set_state('INIT');
    this.raw_conn = new RawConnection(port || 3306, host || 'localhost');

    this.raw_conn.addListener('connect', scope(this, function() {	
	this.emit('connect');
    }));
    this.raw_conn.addListener('close', scope(this, function() {	
	this.emit('close');
    }));

    this.raw_conn.connect();
}
sys.inherits(Protocol, events.EventEmitter);
exports.Protocol = Protocol;

// close TCP session
Protocol.prototype.close = function() {
    this.raw_conn.close();
}

// authenticate process
Protocol.prototype.authenticate = function(user, passwd, db, flag, charset_str) {
    var promise = new events.Promise();
    this.gc_stmt_queue = [];
    if(!this.check_state('INIT', promise)) return promise;
    this.authinfo = [user, passwd, db, flag, charset_str];
    this.raw_conn.reset();
    this.raw_conn.read()
	.addCallback(scope(this, function(buff) {
	    var init_packet = new packet.InitialPacket(buff);
	    if(init_packet.protocol_version!=10) {
		promise.emitError("ClientError", "Don't support protocol version "+init_packet.protocol_version);
		return;
	    }
	    this.server_info = init_packet.server_version;
	    var i = init_packet.server_version.split(".");
	    this.server_version = parseInt(i[0])*100+parseInt(i[1]);
	    
	    this.thread_id = init_packet.thread_id;
	    var client_flags = cons.client.LONG_PASSWORD
		| cons.client.LONG_FLAG
		| cons.client.TRANSACTIONS
		| cons.client.PROTOCOL_41
		| cons.client.SECURE_CONNECTION;
	    if(db) client_flags |= cons.client.CONNECT_WITH_DB;
	    client_flags |= flag;
	    
	    if(charset_str) {
		this.charset = Charset.by_name(charset_str);
	    }
	    else {
		this.charset = Charset.by_number(init_packet.server_charset);
	    }
	    netpw = auth.encrypt_password(passwd, init_packet.scramble_buff);
	    try {
		this.raw_conn.write(packet.AuthenticationPacket(client_flags, 1024*1024*1024, this.charset.number, user, netpw, db));
		
		this.raw_conn.read()
		    .addCallback(scope(this, function(buff){
			this.set_state('READY');
			this.emit("authorized");
			promise.emitSuccess();
		    }))
		    .addErrback(scope(this, function(type, message) {
			this.emit("authorize error");
			promise.emitError(type, message);
		    }));
	    }
	    catch(e) {
		promise.emitError("ClientError", e.message);
	    }
	}))
	.addErrback(scope(this, function(type, message) {
	    this.emit("authorize error");
	    promise.emitError(type, message);
	}));
    return promise;
}

// send query command
Protocol.prototype.query_command = function(query) {
    var promise = new events.Promise();
    
    var err = scope(this, function(type, message) {
	this.set_state('READY');
	promise.emitError(type, message);
    });

    this.wait_ready_state(scope(this, function() {
	this.set_state('PROCESS');
	this.raw_conn.reset();
	this.raw_conn.write(pack.pack("CZ*", cons.com.QUERY, query))
	    .addErrback(err);
	this.get_result()
	    .addCallback(function(nfields) {
	        promise.emitSuccess(nfields);
	    })
	    .addErrback(err);
    }));
    return promise;
}

// read result fields count
Protocol.prototype.get_result = function() {
    var promise = new events.Promise();
    this.raw_conn.read()
	.addCallback(scope(this, function(buff) {
            var res_packet = new packet.ResultPacket(buff);
            this.affected_rows = res_packet.affected_rows;
	    this.insert_id = res_packet.insert_id;
	    this.server_status = res_packet.server_status;
	    this.warning_count = res_packet.warning_count;
	    this.message = res_packet.message;

            if(res_packet.field_count) {  // result data exists
		this.set_state('FIELD');
		promise.emitSuccess(res_packet.field_count);
	    }
            else if(typeof(res_packet.field_count)=='undefined') {  // LOAD DATA LOCAL INFILE
		// TODO
		/*
		  filename = res_packet.message
		  File.open(filename){|f| write f}
		  raw_conn.write(nil);  # EOF mark
		  raw_conn.read().addCallback(..
		*/
	    }
	    else { // field_count == 0
		this.set_state('READY');
		promise.emitSuccess(undefined);
	    }
	}))
       .addErrback(scope(this, function(type, message) {
	    this.set_state('READY');
	    promise.emitError(type, message);
	}));
    return promise;
}

// get field info
Protocol.prototype.retr_fields = function(nfields) {
    var promise = new events.Promise();
    if(!this.check_state('FIELD', promise)) return promise;
    //begin
    var fields = [];
    for(var i=0; i<nfields; ++i) {
	this.raw_conn.read()
	    .addCallback(scope(this, function(buff) {
		fields.push(packet.FieldPacket.parse(buff));
		if(fields.length>=nfields) {
		    this.read_eof_packet()
			.addCallback(scope(this, function(buff) {
			    this.set_state('RESULT');
			    promise.emitSuccess(fields);
			}))
			.addErrback(scope(function(type, message) {
			    promise.emitError(type, message);
			}));
		}
	    }))
	    .addErrback(scope(function(type, message) {
		this.set_state('READY');
		promise.emitError(type, message);
	    }));
    }
    
    // rescue
    //    set_state :READY
    //    raise
    //  end
    return promise;
}

// 
Protocol.prototype.read_eof_packet = function(nfields) {
    var promise = new events.Promise();
    this.raw_conn.read()
	.addCallback(scope(this, function(buff) {
	    if(is_eof_packet(buff)) {
		promise.emitSuccess();
	    }
	    else {
		promise.emitError("ProtocolError", "packet is not EOF");
	    }
	}))
	.addErrback(scope(function(type, message) {
	    promise.emitError(type, message);
	}));
    return promise;
};

var is_eof_packet = function(data) {
    return data.substring(0,1)=="\xfe" && data.length==5;
}

Protocol.prototype.retr_all_records = function(fields, each_callback, end_callback) {
    var promise = new events.Promise();
    if(!this.check_state('RESULT', promise)) return promise;
    //begin
    var get_line = scope(this, function() {
	this.raw_conn.read()
	    .addCallback(scope(this, function(data) {
		if(is_eof_packet(data)) {
		    this.set_state('READY');
		    promise.emitSuccess(end_callback());
		}
		else {
		    var rec = [], adata = [data];
		    for(var i=0; i<fields.length; ++i) {
			var val = lcs2str(adata);
			rec.push(fields[i].type.convert(val));
		    }
		    each_callback(rec);
		    get_line();
		}
	    }))
	    .addErrback(scope(this, function(type, message) {
		    this.set_state('READY');
		promise.emitError(type, message);
            }));
    });
    get_line();
    return promise;
}


// set protocol state
Protocol.prototype.set_state = function(st) {
    this.state = st;
    if(st=='READY') {
	while(st = this.gc_stmt_queue.shift()) {
	    this.reset();
	    this.raw_conn.write(pack.pack("CV", cons.com.STMT_CLOSE, st));
	}
	if(this.ready_state_queue.length>0) {
	    var callback = this.ready_state_queue.shift();
	    callback();
	}
    }
}

// check protocol state
Protocol.prototype.check_state = function(st, promise) {
    if(this.state==st) {
	return true;
    }
    else {
	if(promise) promise.emitError("Protocol Error", "unmatch protocol state");
	return false;
    }
}

// wait changing to state
Protocol.prototype.wait_ready_state = function(callback) {
    this.ready_state_queue.push(callback);
    if(this.state=='READY') {
	process.nextTick(this.ready_state_queue.shift());
    }
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
