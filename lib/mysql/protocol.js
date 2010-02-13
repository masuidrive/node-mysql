var sys = require('sys');
var events = require('events');
var pack = require('./pack');
var cons = require('./constants');
var packet = require('./packet');
var auth = require('./auth');
var Charset = require('./charset').Charset;
var RawConnection = require('./raw_conn').RawConnection;
 
var sqlstate;
var affected_rows;
var insert_id;
var server_status;
var warning_count;

// var emitter = new process.EventEmitter();

exports.Protocol = function(host, port) {
    var state;
    var charset;
    var authinfo;
    var server_info;
    var server_version;
    var thread_id;
    var message;

    var set_state = function(st) {
	state = st;
	if(st=='READY') {
	    while(st = gc_stmt_queue.shift()) {
		reset();
		write(pack.pack("CV", cons.COM_STMT_CLOSE, st));
	    }
	}
    }
    
    var check_state = function(st) {
	if(state!=st) sys.puts("command out of sync"); //TODO
    }
    
    var get_result = function() {
	var promise = new events.Promise();
	
	raw_conn.read().addCallback(function(buff) {
            var res_packet = new packet.ResultPacket(buff);
            if(res_packet.field_count) {  // result data exists
		set_state('FIELD');
		promise.emitSuccess(res_packet.field_count);
	    }
            if(typeof(res_packet.field_count)=='undefined') {  // LOAD DATA LOCAL INFILE
		/*
		filename = res_packet.message
		File.open(filename){|f| write f}
		raw_conn.write(nil);  # EOF mark
		raw_conn.read().addCallback(..
		*/
	    }
	    
            affected_rows = res_packet.affected_rows;
	    insert_id = res_packet.insert_id;
	    server_status = res_packet.server_status;
	    warning_count = res_packet.warning_count;
	    message = res_packet.message;
            set_state('READY');
	    promise.emitSuccess();
	})
	.addErrback(function(type, message) {
	    set_state('READY');
	    promise.emitError(type, message);
	});

	return promise;
    }
    
    set_state('INIT');
    var raw_conn = new RawConnection(port || 3306, host || 'localhost');
    
    return({
	close: function() {
	    raw_conn.close();
	},
	
	authenticate: function(user, passwd, db, flag, charset_str) {
	    gc_stmt_queue = [];
	    check_state('INIT');
	    authinfo = [user, passwd, db, flag, charset_str];
	    raw_conn.reset();
	    raw_conn.read().addCallback(function(buff) {
		var init_packet = new packet.InitialPacket(buff);
		server_info = init_packet.server_version;
		var i = init_packet.server_version.split(".");
		server_version = parseInt(i[0])*100+parseInt(i[1]);
		
		thread_id = init_packet.thread_id;
		client_flags = cons.CLIENT_LONG_PASSWORD | cons.CLIENT_LONG_FLAG | cons.CLIENT_TRANSACTIONS | cons.CLIENT_PROTOCOL_41 | cons.CLIENT_SECURE_CONNECTION;
		if(db) client_flags |= cons.CLIENT_CONNECT_WITH_DB;
		client_flags |= flag;
		
		if(charset_str) {
		    charset = Charset.by_name(charset_str);
		}
		else {
		    charset = Charset.by_number(init_packet.server_charset);
		}
		netpw = auth.encrypt_password(passwd, init_packet.scramble_buff);
		raw_conn.write(packet.AuthenticationPacket(client_flags, 1024*1024*1024, charset.number, user, netpw, db));
		
		raw_conn.read().addCallback(function(buff){
		    sys.puts("res>"+sys.inspect(buff)); // TODO
		}); // skip
		set_state('READY');
	    })
	    .addErrback(function(message, detail) {
		sys.puts(message+": "+detail);
	    });
	}, // end of authenticate
	
	query_command: function(query) {
	    var promise = new events.Promise();

	    var err = function(type, message) {
		set_state('READY');
		promise.emitError(type, message);
	    }
	    
	    check_state('READY');
            raw_conn.reset();
            raw_conn.write(pack.pack("CZ*", cons.COM_QUERY, query))
		.addErrback(err);
	    get_result().addCallback(function(nfields) {
		promise.emitSuccess(nfields);
	    }).addErrback(err);
	    
	    return promise;
	}

    });
};

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
