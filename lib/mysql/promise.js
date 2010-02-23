// Promise library
// compatible with < 0.1.30

// Original:
// nodejs v0.1.29
// Copyright 2009, 2010 Ryan Lienhart Dahl. All rights reserved.
// MIT License

var events = require('events');

exports.Promise = function () {
    events.EventEmitter.call(this);
    this._blocking = false;
    this.hasFired = false;
    this._values = undefined;
};
process.inherits(exports.Promise, events.EventEmitter);

exports.Promise.prototype.timeout = function(timeout) {
    if (!timeout) {
	return this._timeoutDuration;
    }
    
    this._timeoutDuration = timeout;
    
    if (this.hasFired) return;
    this._clearTimeout();
    
    var self = this;
    this._timer = setTimeout(function() {
	self._timer = null;
	if (self.hasFired) {
            return;
	}
	
	self.emitError(new Error('timeout'));
    }, timeout);
    
    return this;
};

exports.Promise.prototype._clearTimeout = function() {
    if (!this._timer) return;
    
    clearTimeout(this._timer);
    this._timer = null;
}

exports.Promise.prototype.emitSuccess = function() {
    if (this.hasFired) return;
    this.hasFired = 'success';
    this._clearTimeout();
    
    this._values = Array.prototype.slice.call(arguments);
    this.emit.apply(this, ['success'].concat(this._values));
};

exports.Promise.prototype.emitError = function() {
    if (this.hasFired) return;
    this.hasFired = 'error';
    this._clearTimeout();
    
    this._values = Array.prototype.slice.call(arguments);
    this.emit.apply(this, ['error'].concat(this._values));
    
    if (this.listeners('error').length == 0) {
	var self = this;
	process.nextTick(function() {
            if (self.listeners('error').length == 0) {
		throw (self._values[0] instanceof Error)
		    ? self._values[0]
		    : new Error('Unhandled emitError: '+JSON.stringify(self._values));
            }
	});
    }
};

exports.Promise.prototype.addCallback = function (listener) {
    if (this.hasFired === 'success') {
	listener.apply(this, this._values);
    }
    
    return this.addListener("success", listener);
};

exports.Promise.prototype.addErrback = function (listener) {
    if (this.hasFired === 'error') {
	listener.apply(this, this._values);
    }
    
    return this.addListener("error", listener);
};

/* Poor Man's coroutines */
var coroutineStack = [];

exports.Promise.prototype._destack = function () {
    this._blocking = false;
    
    while (coroutineStack.length > 0 &&
           !coroutineStack[coroutineStack.length-1]._blocking)
    {
	coroutineStack.pop();
	process.unloop("one");
    }
};

exports.Promise.prototype.wait = function () {
    var self = this;
    var ret;
    var hadError = false;
    
    if (this.hasFired) {
	ret = (this._values.length == 1)
            ? this._values[0]
            : this.values;
	
	if (this.hasFired == 'success') {
            return ret;
	} else if (this.hasFired == 'error') {
            throw ret;
	}
    }
    
    self.addCallback(function () {
	if (arguments.length == 1) {
            ret = arguments[0];
	} else if (arguments.length > 1) {
            ret = Array.prototype.slice.call(arguments);
	}
	self._destack();
    });
    
    self.addErrback(function (arg) {
	hadError = true;
	ret = arg;
	self._destack();
    });
    
    coroutineStack.push(self);
    if (coroutineStack.length > 10) {
	process.stdio.writeError("WARNING: promise.wait() is being called too often.\n");
    }
    self._blocking = true;
    
    process.loop();
    
    process.assert(self._blocking == false);
    
    if (hadError) {
	if (ret) {
            throw ret;
	} else {
            throw new Error("Promise completed with error (No arguments given.)");
	}
    }
    return ret;
};
