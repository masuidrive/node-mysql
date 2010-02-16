// 
// Append read() to tcp.Connection
//  
var events = require("events");
patchForPromiseLateChain(events.Promise); // under 0.1.29

exports.mixinRead = function(conn) {
    conn.read = function(len) {
	var promise = new events.Promise();
	read_queue.push({len: len, promise: promise});
	if(buffer) process_tcp_read_queue();
	return promise;
    }
    
    conn.addListener("receive", function(data) {	
	buffer += data;
	process_tcp_read_queue();
    });
    
    var buffer = '';
    var read_queue = [];
    var process_tcp_read_queue = function() {
	if(read_queue.length==0) return;
	var task, data;
	if(typeof(read_queue[0].len)=='undefined') {
	    task = read_queue.shift();
	    data = buffer;
	    buffer = '';
	    task.promise.emitSuccess(data);
	}
	else if(buffer.length>=read_queue[0].len) {
	    task = read_queue.shift();
	    data = buffer.substring(0, task.len);
	    buffer = buffer.slice(task.len);
	    task.promise.emitSuccess(data);
	    process_tcp_read_queue();
	}
    }
    return conn;
}


/*
node-mysql
A node.js interface for MySQL

Author: masuidrive <masui@masuidrive.jp>
License: MIT License
Copyright (c) Yuichiro MASUI
*/
