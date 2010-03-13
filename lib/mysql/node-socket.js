// 
// Append read() to tcp.Connection
//  
var sys = require('sys');
var events = require("events");
var errors = require('./errors');
var utils = require('./utils');
var Promise = require('./node-promise').Promise;

var Socket = function(connect_callback, close_callback) {
    this.conn = new process.tcp.Connection();
    this.conn.setNoDelay(true);
    this.conn.setTimeout(0);
    this.buffer = '';
    this.read_queue = [];
    
    this.conn.addListener("data", utils.scope(this, function(data) {
	this.buffer += data;
	this.process_tcp_read_queue();
    }));
    this.conn.addListener("connect", utils.scope(this, function(){
	this.conn.setEncoding("binary");
	connect_callback();
    }));
    this.conn.addListener("close", utils.scope(this, function(hasError) {
	var task;
	while(task=this.read_queue.shift()) {
	    task.promise.emitError(new errors.ClientError('connection was closed'));
	}
	close_callback(hasError);
    }));
}
sys.inherits(Socket, events.EventEmitter);
exports.Socket = Socket;

Socket.prototype.timeout = function(timeout) {
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
