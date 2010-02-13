var tcp = require('tcp');
var sys = require('sys');
var events = require("events");
var pack = require('./pack');
var tcpEx = require('./tcp_ex');

var RawConnection = function(port, host) {
    events.EventEmitter.call(this);
    
    var MAX_PACKET_LENGTH = 16777215;
    
    var tcp_conn = tcpEx.mixinRead(tcp.createConnection(port, host));
    var seq; // packet sequence number
    
    tcp_conn.addListener("connect", function(){
	tcp_conn.setEncoding("binary");
	//emitter.emit("connect");
    });
    
    tcp_conn.addListener("disconnect", function(hadError) {
	if (hadError)
	    throw "disconnected from server in error";
    });
    
    return({
	reset: function() {
	    seq = 0;
	},
	
	close: function() {
	    tcp_conn.close();
	},
	
	/* Read one packet data
	 * === Return
	 * [String] packet data
	 * === Exception * [ProtocolError] invalid packet sequence number
	 */
	read: function() {
	    var ret = "";
	    var len = undefined;
	    var promise = new events.Promise();
	    //begin
	    //Timeout.timeout @read_timeout do
	    tcp_conn.read(4).addCallback(function(header) {
		var res = pack.unpack("CvC", header);
		len = (res[1] << 8) + res[0];
		if(res[2] != seq) {
		    return promise.emitError('Protocol error', "invalid packet: sequence number mismatch("+res[2]+" != "+seq+"(expected))");
		}
		seq = (res[2] + 1) % 256;
		
		tcp_conn.read(len).addCallback(function(data) {
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
			//if Mysql::ServerError::ERROR_MAP.key? errno
			//  raise Mysql::ServerError::ERROR_MAP[errno].new(message, @sqlstate)
			//end
			//raise Mysql::ServerError.new(message, @sqlstate)
			promise.emitError('ServerError', message, sqlstate);
		    }
		    promise.emitSuccess(ret);
		});
	    });
	    return promise;
	},
	/*
	  # Write one packet data
	  # === Argument
	  # data :: [String / IO] packet data. If data is nil, write empty packet.
	*/
	write: function(data) {
	    var promise = new events.Promise();
	    
	    //begin
	    if(data===undefined) {
		//Timeout.timeout @write_timeout do
		tcp_conn.send(pack.pack("CvC", 0, 0, seq), 'binary');
		//end
		seq = (seq + 1) % 256
		promise.emitSuccess();
	    }
	    else {
		data = data
		while(data) {
		    var d = data.substring(0, MAX_PACKET_LENGTH);
		    data = data.slice(MAX_PACKET_LENGTH);
		    tcp_conn.send(pack.pack("CvC", d.length%256, d.length/256, seq), 'binary');
		    tcp_conn.send(d, 'binary');
		    seq = (seq + 1) % 256;
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
    });
};
sys.inherits(RawConnection, events.EventEmitter);
exports.RawConnection = RawConnection;

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
