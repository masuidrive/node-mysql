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
    testfunc()
	.addCallback(function() {
	    test.assertEquals(0, pending_callbacks);
	    sys.puts("success");
	    run(testfuncs);
	})
	.addErrback(function() {
	    sys.puts("test failed");
	    run(testfuncs);
	});
}
exports.run = run;

var exceptClass = function(klass,obj) {
    test.assertEquals(klass.contructor, obj.constractor);
}
exports.exceptClass = exceptClass;

var expect_true_reply = function(promise) {
  // Redis' protocol returns +OK for some operations.
  // The client converts this into a ECMAScript boolean type with value true.
  
  expect_callback();
  promise.addCallback(function (reply) {
    test.assertEquals(typeof(reply), 'boolean');
    test.assertTrue(reply);
    was_called_back();
  });
  promise.addErrback(function (error) {
    test.assertFalse(error);
  });
}
exports.expect_true_reply = expect_true_reply;

var expectFalse = function(promise) {
  expect_callback();
  promise.addCallback(function (reply) {
    test.assertEquals(typeof(reply), 'boolean');
    test.assertFalse(reply);
    was_called_back();
  });
  promise.addErrback(function (error) {
    test.assertFalse(error);
  });
}
exports.expectFalse = expectFalse;

var expect_numeric_reply = function(expected_value, promise) {
  expect_callback();
  promise.addCallback(function (reply) {
    test.assertEquals(typeof(reply), 'number');
    test.assertEquals(expected_value, reply);
    was_called_back();
  });
  promise.addErrback(function (error) {
    test.assertFalse(error);
  });
}
exports.expect_numeric_reply = expect_numeric_reply;
 
var expect_zero_as_reply = function expect_zero_as_reply(promise) {
  return expect_numeric_reply(0, promise);
}
exports.expect_zero_as_reply = expect_zero_as_reply;
 
var expect_one_as_reply = function(promise) {
  return expect_numeric_reply(1, promise);
}
exports.expect_one_as_reply = expect_one_as_reply;


/*
helper functions from below file.
http://github.com/fictorial/redis-node-client/blob/master/test.js

// Redis client for Node.js -- tests.
// Author: Brian Hammond <brian at fictorial dot com>
// Copyright (C) 2009 Fictorial LLC
// License: MIT
*/

/*
node-mysql
A node.js interface for MySQL

Author: masuidrive <masui@masuidrive.jp>
License: MIT License
Copyright (c) Yuichiro MASUI
*/
