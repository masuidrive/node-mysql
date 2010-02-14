// RawConnection: 
// MySQL packet I/O
// http://forge.mysql.com/wiki/MySQL_Internals_ClientServer_Protocol#The_Packet_Header
var sys = require('sys');
var events = require("events");
var pack = require('./pack');
var tcpEx = require('./tcp_ex');

var MAX_PACKET_LENGTH = 16777215;
 
var scope = function(target, func) {
    return function(){ func.apply(target, arguments); }
}

var RawConnection = function(port, hostname) {
    events.EventEmitter.call(this);
    
    this.hostname = hostname;
    this.port = port;
    this.seq = 0; // packet sequence number
    this.tcp_conn = tcpEx.mixinRead(new process.tcp.Connection());
    
    this.tcp_conn.addListener("connect", scope(this, function(){
	this.tcp_conn.setEncoding("binary");
	this.emit("connect");
    }));
    this.tcp_conn.addListener("disconnect", scope(this, function(hadError) {
	this.emit("disconnect");
	//if (hadError)
	//    throw "disconnected from server in error";
	// TODO
    }));
}
sys.inherits(RawConnection, events.EventEmitter);
exports.RawConnection = RawConnection;

// open TCP socket
RawConnection.prototype.connect = function() {
    this.tcp_conn.connect(this.port, this.hostnamet);
}

// reset packet sequence
RawConnection.prototype.reset = function() {
    this.seq = 0;
}

// close TCP socket
RawConnection.prototype.close = function() {
    this.tcp_conn.close();
}
	
// Read one packet data
RawConnection.prototype.read = function() {
    var promise = new events.Promise();
    var ret = "";
    var len = undefined;
    //begin
    //Timeout.timeout @read_timeout do
    this.tcp_conn.read(4)
	.addCallback(scope(this, function(header) {
	    var res = pack.unpack("CvC", header);
	    len = (res[1] << 8) + res[0];
	    if(res[2] != this.seq) {
		return promise.emitError('Protocol error', "invalid packet: sequence number mismatch("+res[2]+" != "+this.seq+"(expected))");
	    }
	    this.seq = (res[2] + 1) % 256;
	    
	    this.tcp_conn.read(len)
		.addErrback(scope(this, function(type, message) {
		    // TODO
		}))
		.addCallback(scope(this, function(data) {
		    ret = ret.concat(data);
		    
		    var sqlstate = "00000";
		    // Error packet
		    if(ret[0]=="\xff") {
			var res = pack.unpack("Cvaa5a*", ret);
			f = res[0], errno = res[1], marker = res[2], sqlstate = res[3], message = res[4]; 
			if(marker!="#") {
			    res = pack.unpack("Cva*", ret);    // Version 4.0 Error
			    f = res[0], errno = res[1], message = res[2]; 
			    sqlstate = "";
			}
			// TODO
			//if Mysql::ServerError::ERROR_MAP.key? errno
			//  raise Mysql::ServerError::ERROR_MAP[errno].new(message, @sqlstate)
			//end
			//raise Mysql::ServerError.new(message, @sqlstate)
			promise.emitError('ServerError', message + "(" + sqlstate + ")");
		    }
		    promise.emitSuccess(ret);
		}));
	}));
	//.addErrback(scope(this, function(type, message) {
	//    // TODO
	//}));
    return promise;
}

// Write one packet data
RawConnection.prototype.write = function(data) {
    var promise = new events.Promise();
    
    //begin
    if(typeof(data)=='undefined') {
	//Timeout.timeout @write_timeout do
	this.tcp_conn.send(pack.pack("CvC", 0, 0, seq), 'binary');
	//end
	this.seq = (this.seq + 1) % 256
	promise.emitSuccess();
    }
    else {
	var buf;
	while(data) {
	    buf = data.substring(0, MAX_PACKET_LENGTH);
	    data = data.slice(MAX_PACKET_LENGTH);
	    this.tcp_conn.send(pack.pack("CvC", buf.length%256, buf.length/256, this.seq), 'binary');
	    this.tcp_conn.send(buf, 'binary');
	    this.seq = (this.seq + 1) % 256;
	}
	//Timeout.timeout @write_timeout do
	//  @sock.flush
	//end
	promise.emitSuccess();
    }
    //rescue Timeout::Error
    //    raise ClientError, "write timeout"
    //  end
    
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
