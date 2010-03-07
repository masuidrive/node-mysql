// 
// Append read() to tcp.Connection
//  
var events = require("events");
var errors = require('./errors');
var Promise = require('./node-promise').Promise;
process.mixin(require('./common'));

var Socket = function(connect_callback, close_callback) {
    this.conn = new process.tcp.Connection();
    this.buffer = '';
    this.read_queue = [];
    
    this.conn.addListener("data", scope(this, function(data) {
	this.buffer += data;
	this.process_tcp_read_queue();
    }));
    this.conn.addListener("connect", scope(this, function(){
	this.conn.setEncoding("binary");
	connect_callback();
    }));
    this.conn.addListener("end", scope(this, function(hasError) {
	var task;
	while(task=this.read_queue.shift()) {
	    task.promise.emitError(new errors.ClientError('connection was closed'));
	}
	close_callback(hasError);
    }));
}
exports.Socket = Socket;

Socket.prototype.timeout = function(timeout) {
    this.conn.setTimeout(timeout);
    this._timeout = timeout;
}

Socket.prototype.connect = function(port, host) {
    this.conn.connect(port, host);
}

Socket.prototype.readyState = function() {
    return this.conn.readyState;
}

Socket.prototype.close = function() {
    this.conn.close();
}

Socket.prototype.read = function(len) {
    var promise = new Promise();
    if(this._timeout) promise.timeout(this._timeout, function(){ return new errors.ClientError('connection timeout'); });
    this.read_queue.push({len: len, promise: promise});
    if(this.buffer) this.process_tcp_read_queue();
    return promise;
}

Socket.prototype.process_tcp_read_queue = function() {
    if(this.read_queue.length==0) return;
    var task, data;
    if(typeof(this.read_queue[0].len)=='undefined') {
	task = this.read_queue.shift();
	data = this.buffer;
	this.buffer = '';
	task.promise.emitSuccess(data);
    }
    else if(this.buffer.length>=this.read_queue[0].len) {
	task = this.read_queue.shift();
	data = this.buffer.substring(0, task.len);
	this.buffer = this.buffer.slice(task.len);
	task.promise.emitSuccess(data);
	this.process_tcp_read_queue();
    }
}

Socket.prototype.write = function(data) {
    this.conn.write(data, 'binary');
}


/*
node-mysql
A node.js interface for MySQL

Author: masuidrive <masui@masuidrive.jp>
License: MIT License
Copyright (c) Yuichiro MASUI
*/
