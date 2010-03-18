#!/usr/bin/env node
GLOBAL.DEBUG = true;
var events = require("events");
var sys = require("sys");
var assert = require("assert");

var helper = require('./helper');
var config = require('./config');
var mysql = require('../lib/mysql');
var Promise = require('../lib/mysql/node-promise').Promise;

var all_tests = [];

var test_protocolVersion11 = function() {
    var promise = new Promise();
    var conn = helper.createMockConnection(mysql, "protocol version 11");
    helper.expect_callback();
    conn.connect(
	function() {
	    assert.ok(true, false);
	    conn.close();
	    promise.emitError();
	},
	function(error) {
	    helper.was_called_back();
	    assert.equal("Don't support protocol version 11", error.message);
	    conn.close();
	    promise.emitSuccess();
	}
    );
    return promise
};
all_tests.push(["protocol version 11", test_protocolVersion11]);


var test_queryTimeout = function() {
    var promise = new Promise();
    var conn = helper.createMockConnection(mysql, "query timeout");
    conn.timeout(1000);
    helper.expect_callback();
    conn.connect(
	function() {
	    helper.was_called_back();
	    helper.expect_callback();
	    conn.query('SELECT 1.23',
		       function() {
			   assert.ok(true, false);
			   conn.close();
			   promise.emitError();
		       },
		       function(error) {
			   helper.was_called_back();
			   assert.equal('connection timeout', error.message);
			   conn.close();
			   promise.emitSuccess();
		       });
	},
	function(error) {
	    assert.ok(true, false);
	    conn.close();
	    promise.emitError();
	});
    return promise
};
all_tests.push(["query timeout", test_queryTimeout]);


var test_authenticationTimeout = function() {
    var promise = new Promise();
    var conn = helper.createMockConnection(mysql, "authentication timeout");
    conn.timeout(1000);
    helper.expect_callback();
    conn.connect(
	function() {
	    assert.ok(true, false);
	    conn.close();
	    promise.emitError();
	},
	function(error) {
	    helper.was_called_back();
  	    assert.equal('connection timeout', error.message);
	    conn.close();
	    promise.emitSuccess();
	}
    );
    return promise
};
all_tests.push(["authentication timeout", test_authenticationTimeout]);


var test_shutdownOnAuthentication = function() {
    var promise = new Promise();
    var conn = helper.createMockConnection(mysql, "shutdown on authentication");
    conn.timeout(1000);
    helper.expect_callback();
    conn.connect(
	function() {
	    assert.ok(true, false);
	    conn.close();
	    promise.emitError();
	},
	function(error) {
	    helper.was_called_back();
	    assert.ok('connection was closed', error.message);
	    conn.close();
	    promise.emitSuccess();
	}
    );
    return promise
};
all_tests.push(["shutdown on authentication", test_shutdownOnAuthentication]);


helper.run(all_tests);

/*
node-mysql
A node.js interface for MySQL

Author: masuidrive <masui@masuidrive.jp>
License: MIT License
Copyright (c) Yuichiro MASUI
*/
