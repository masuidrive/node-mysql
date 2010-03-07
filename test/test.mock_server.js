#!/usr/bin/env node
GLOBAL.DEBUG = true;
var events = require("events");
var sys = require("sys");
var test = require("mjsunit");

var helper = require('./helper');
process.mixin(GLOBAL, helper);
var config = require('./config');
var mysql = require('../lib/mysql');
var Promise = require('../lib/mysql/node-promise').Promise;

var all_tests = [];
var test_createConnectionTimeout = function() {
    var promise = new Promise();
    var conn = new mysql.Connection('localhost', 
				    'nodejs_mysql',
				    'nodejs_mysql',
				    'nodejs_mysql',
				    33306);
    helper.exceptClass(mysql.Connection, conn);
    helper.expect_callback();
    conn.timeout(1000);
    conn.connect(
	function() {
	    promise.emitError();
	},
	function(error) {
	    helper.was_called_back();
	    test.assertEquals('connection timeout', error.message);
	    conn.close();
	    promise.emitSuccess();
	});
    return promise
};
all_tests.push(["createConnectionTimeout", test_createConnectionTimeout]);

helper.run(all_tests);

/*
node-mysql
A node.js interface for MySQL

Author: masuidrive <masui@masuidrive.jp>
License: MIT License
Copyright (c) Yuichiro MASUI
*/
