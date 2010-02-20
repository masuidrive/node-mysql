var sys = require("sys");
var test = require("mjsunit");

var pending_callbacks = 0;
exports.pending_callbacks = pending_callbacks;

var expect_callback = function() {
  pending_callbacks++;
}
exports.expect_callback = expect_callback;

var was_called_back = function() {
  pending_callbacks--;
}
exports.was_called_back = was_called_back;

var run = function(testfuncs){
    pending_callbacks = 0;
    var testfunc = testfuncs.shift();
    if(!testfunc) return true;
    var promise = testfunc[1]();
    if(promise) {
	promise
	    .addCallback(function() {
		test.assertEquals(0, pending_callbacks);
		sys.puts("Success: "+testfunc[0]);
		run(testfuncs);
	    })
	    .addErrback(function() {
		sys.puts("Failed: "+testfunc[0]);
		run(testfuncs);
	    });
    }
    else {
	sys.puts("Tested: "+testfunc[0])
    }
}
exports.run = run;

var exceptClass = function(klass,obj) {
    test.assertEquals(klass.contructor, obj.constractor);
}
exports.exceptClass = exceptClass;

/*
node-mysql
A node.js interface for MySQL

Author: masuidrive <masui@masuidrive.jp>
License: MIT License
Copyright (c) Yuichiro MASUI
*/
