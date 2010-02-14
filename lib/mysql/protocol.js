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
    this.raw_conn.addListener('disconnect', scope(this, function() {	
	this.emit('disconnect');
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
    this.check_state('INIT');
    this.authinfo = [user, passwd, db, flag, charset_str];
    this.raw_conn.reset();
    this.raw_conn.read()
	.addCallback(scope(this, function(buff) {
	    var init_packet = new packet.InitialPacket(buff);
	    this.server_info = init_packet.server_version;
	    var i = init_packet.server_version.split(".");
	    this.server_version = parseInt(i[0])*100+parseInt(i[1]);
	    
	    this.thread_id = init_packet.thread_id;
	    var client_flags = cons.CLIENT_LONG_PASSWORD
		| cons.CLIENT_LONG_FLAG
		| cons.CLIENT_TRANSACTIONS
		| cons.CLIENT_PROTOCOL_41
		| cons.CLIENT_SECURE_CONNECTION;
	    if(db) client_flags |= cons.CLIENT_CONNECT_WITH_DB;
	    client_flags |= flag;
	    
	    if(charset_str) {
		this.charset = Charset.by_name(charset_str);
	    }
	    else {
		this.charset = Charset.by_number(init_packet.server_charset);
	    }
	    netpw = auth.encrypt_password(passwd, init_packet.scramble_buff);
	    this.raw_conn.write(packet.AuthenticationPacket(client_flags, 1024*1024*1024, this.charset.number, user, netpw, db));
	    
	    this.raw_conn.read()
		.addCallback(scope(this, function(buff){
		    this.set_state('READY');
		    this.emit("authorized");
		    promise.emitSuccess();
		}))
	    .addErrback(scope(this, function(type, message) {
		this.emit("authorize error");
		promise.emitError();
	    }));
	}))
	.addErrback(scope(this, function(message, detail) {
	    this.emit("authorize error");
	    promise.emitError(message, detail);
	}));
    return promise;
}

// send query command
Protocol.prototype.query_command = function(query) {
    var promise = new events.Promise();
    
    var err = scope(function(type, message) {
	this.set_state('READY');
	promise.emitError(type, message);
    });
    
    this.check_state('READY');
    this.raw_conn.reset();
    this.raw_conn.write(pack.pack("CZ*", cons.COM_QUERY, query))
	.addErrback(err);
    this.get_result()
	.addCallback(function(nfields) {
	    promise.emitSuccess(nfields);
	})
	.addErrback(err);
    return promise;
}

// read result fields count
Protocol.prototype.get_result = function() {
    var promise = new events.Promise();
    this.raw_conn.read()
	.addCallback(scope(this, function(buff) {
            var res_packet = new packet.ResultPacket(buff);
            if(res_packet.field_count) {  // result data exists
		this.set_state('FIELD');
		promise.emitSuccess(res_packet.field_count);
	    }
            if(typeof(res_packet.field_count)=='undefined') {  // LOAD DATA LOCAL INFILE
		// TODO
		/*
		  filename = res_packet.message
		  File.open(filename){|f| write f}
		  raw_conn.write(nil);  # EOF mark
		  raw_conn.read().addCallback(..
		*/
	    }
	    
            this.affected_rows = res_packet.affected_rows;
	    this.insert_id = res_packet.insert_id;
	    this.server_status = res_packet.server_status;
	    this.warning_count = res_packet.warning_count;
	    this.message = res_packet.message;
            this.set_state('READY');
	    promise.emitSuccess();
	}))
	.addErrback(scope(function(type, message) {
	    this.set_state('READY');
	    promise.emitError(type, message);
	}));
    return promise;
}

// 
Protocol.prototype.retr_fields = function(nfields) {
    var promise = new events.Promise();
    this.check_state('FIELD')
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
			}));
			//.addErrback(scope(function(type, message) {
			//    // TODO
			//}));
		}
	    }));
	    //.addErrback(scope(function(type, message) {
	    // this.set_state('READY');
	    // // TODO
	    //}));
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
	    promise.emitSuccess();
	}));
	//.addErrback(scope(function(type, message) {
	//    // TODO
	//}));
    return promise;
};

var is_eof_packet = function(data) {
    return data.substring(0,1)=="\xfe" && data.length==5;
}

Protocol.prototype.retr_all_records = function(fields, init_callback, each_callback, end_callback) {
    var promise = new events.Promise();
    this.check_state('RESULT');
    //begin
    var get_line = scope(this, function() {
	this.raw_conn.read()
	    .addCallback(scope(this, function(data) {
		if(is_eof_packet(data)) {
		    promise.emitSuccess(end_callback());
		}
		else {
		    var rec = init_callback(), adata = [data];
		    for(var i=0; i<fields.length; ++i) {
			rec.push(fields[i].type.convert(lcs2str(adata)));
		    }
		    each_callback(rec);
		    get_line();
		}
	    }));
	    // .addErrback(scope(this, function() {
            //  TODO
            // }))
    });
    get_line();
    //ensure
    //    set_state :READY
    //end
    return promise;
}


// set protocol state
Protocol.prototype.set_state = function(st) {
    this.state = st;
    if(st=='READY') {
	while(st = this.gc_stmt_queue.shift()) {
	    this.reset();
	    this.raw_conn.write(pack.pack("CV", cons.COM_STMT_CLOSE, st));
	}
    }
}

// check protocol state
Protocol.prototype.check_state = function(st) {
    if(this.state!=st) sys.puts("command out of sync"); // TODO
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
