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
var test_createConnection = function() {
    var promise = new Promise();
    var conn = new mysql.Connection(config.mysql.hostname,
				    config.mysql.username,
				    config.mysql.password,
				    config.mysql.database);
    helper.exceptClass(mysql.Connection, conn);
    helper.expect_callback();
    conn.connect(function() {
	helper.was_called_back();
	conn.close();
	promise.emitSuccess();
    });
    return promise
};
all_tests.push(["createConnection", test_createConnection]);

var test_result1 = function() {
    var promise = new Promise();
    var conn = new mysql.Connection(config.mysql.hostname, 
					  config.mysql.username,
					  config.mysql.password,
					  config.mysql.database);
    helper.exceptClass(mysql.Connection, conn);
    conn.connect();
    conn.query("CREATE TEMPORARY TABLE t (id INTEGER, str VARCHAR(254), PRIMARY KEY (id)) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci'");
    conn.query("INSERT INTO t VALUES (1,'abc'),(2,'0'),(3,''),(4,null)");
    
    // execute SELECT query
    helper.expect_callback();
    conn.query('SELECT * FROM t ORDER BY id', function(result) { // Success
	helper.was_called_back();
	
	// field information
	assert.equal(2, result.fields.length);
	assert.equal('LONG', result.fields[0].type.name);
	assert.equal('nodejs_mysql', result.fields[0].db);
	assert.equal('id', result.fields[0].name);
	assert.equal('id', result.fields[0].org_name);
	assert.equal('t', result.fields[0].table);
	assert.equal('t', result.fields[0].org_table);
	assert.equal(11, result.fields[0].length);
	assert.equal(0, result.fields[0].decimals);
	assert.equal(undefined, result.fields[0].defaultValue);
	assert.equal(mysql.constants.field.PRI_KEY_FLAG
			  | mysql.constants.field.PART_KEY_FLAG
			  | mysql.constants.field.NOT_NULL_FLAG,
			  result.fields[0].flags);
	assert.equal(true, result.fields[0].is_num());
	assert.equal(true, result.fields[0].is_not_null());
	assert.equal(true, result.fields[0].is_pri_key());
	
	assert.equal('VAR_STRING', result.fields[1].type.name);
	assert.equal('nodejs_mysql', result.fields[1].db);
	assert.equal('str', result.fields[1].name);
	assert.equal('str', result.fields[1].org_name);
	assert.equal('t', result.fields[1].table);
	assert.equal('t', result.fields[1].org_table);
	assert.equal(0, result.fields[1].decimals);
	assert.equal(undefined, result.fields[0].defaultValue);
	assert.equal(0, result.fields[1].flags);
	assert.equal(false, result.fields[1].is_num());
	assert.equal(false, result.fields[1].is_not_null());
	assert.equal(false, result.fields[1].is_pri_key());
	
	// result data
	assert.equal(4, result.records.length);
	assert.equal(1, result.records[0][0]);
	assert.equal('abc', result.records[0][1]); // string
	assert.equal(2, result.records[1][0]);
	assert.equal('0', result.records[1][1]); // string
	assert.equal(3, result.records[2][0]);
	assert.equal('', result.records[2][1]); // blank string
	assert.equal(4, result.records[3][0]);
	assert.equal(null, result.records[3][1]); // null string
	
	// result hash fieldname
	var res = result.toHash(result.records[0]);
	assert.equal(res['id'], 1);
	assert.equal(res['str'], 'abc');
	var res = result.toHash(result.records[1]);
	assert.equal(res['id'], 2);
	assert.equal(res['str'], '0');
	var res = result.toHash(result.records[2]);
	assert.equal(res['id'], 3);
	assert.equal(res['str'], '');
	var res = result.toHash(result.records[3]);
	assert.equal(res['id'], 4);
	assert.equal(res['str'], undefined);
	
	// result hash with table name
	result.fieldname_with_table = true
	var res = result.toHash(result.records[0]);
	assert.equal(res['t.id'], 1);
	assert.equal(res['t.str'], 'abc');
	var res = result.toHash(result.records[1]);
	assert.equal(res['t.id'], 2);
	assert.equal(res['t.str'], '0');
	var res = result.toHash(result.records[2]);
	assert.equal(res['t.id'], 3);
	assert.equal(res['t.str'], '');
	var res = result.toHash(result.records[3]);
	assert.equal(res['t.id'], 4);
	assert.equal(res['t.str'], undefined);

	// result hash fieldname
	result.fieldname_with_table = false
	var res = result.toHash(result.records[0]);
	assert.equal(res['id'], 1);
	assert.equal(res['str'], 'abc');
	var res = result.toHash(result.records[1]);
	assert.equal(res['id'], 2);
	assert.equal(res['str'], '0');
	var res = result.toHash(result.records[2]);
	assert.equal(res['id'], 3);
	assert.equal(res['str'], '');
	var res = result.toHash(result.records[3]);
	assert.equal(res['id'], 4);
	assert.equal(res['str'], undefined);
	
    });

    // table & column alias
    helper.expect_callback();
    conn.query('SELECT id as pkey FROM t as ttt ORDER BY pkey', function(result) {
	helper.was_called_back();
	
	// field information
	assert.equal(1, result.fields.length);
	assert.equal('LONG', result.fields[0].type.name);
	assert.equal('nodejs_mysql', result.fields[0].db);
	assert.equal('pkey', result.fields[0].name);
	assert.equal('id', result.fields[0].org_name);
	assert.equal('ttt', result.fields[0].table);
	assert.equal('t', result.fields[0].org_table);
	assert.equal(undefined, result.fields[0].defaultValue);
	
	// result data
	assert.equal(4, result.records.length);
	assert.equal(1, result.records[0][0]);
	assert.equal(2, result.records[1][0]);
	assert.equal(3, result.records[2][0]);
	assert.equal(4, result.records[3][0]);
	
	// result hash
	result.fieldname_with_table = true
	var res = result.toHash(result.records[0]);
	assert.equal(res['ttt.pkey'], 1);
	var res = result.toHash(result.records[1]);
	assert.equal(res['ttt.pkey'], 2);
	var res = result.toHash(result.records[2]);
	assert.equal(res['ttt.pkey'], 3);
	var res = result.toHash(result.records[3]);
	assert.equal(res['ttt.pkey'], 4);

	// result hash fieldname without table
	result.fieldname_with_table = false
	var res = result.toHash(result.records[0]);
	assert.equal(res['pkey'], 1);
	var res = result.toHash(result.records[1]);
	assert.equal(res['pkey'], 2);
	var res = result.toHash(result.records[2]);
	assert.equal(res['pkey'], 3);
	var res = result.toHash(result.records[3]);
	assert.equal(res['pkey'], 4);
	
	conn.close();
	promise.emitSuccess();
    },
    function(error) { 
         assert.ok(true, false);
    });

    return promise
};
all_tests.push(["test_result1", test_result1]);


var test_query_without_table = function() {
    var promise = new Promise();
    var conn = new mysql.Connection(config.mysql.hostname, 
					  config.mysql.username,
					  config.mysql.password,
					  config.mysql.database);
    helper.exceptClass(mysql.Connection, conn);
    conn.connect();

    helper.expect_callback();
    conn.query('SELECT 1.23',
	       function(result) {
		   helper.was_called_back();
		   
		   // field information
		   assert.equal(1, result.fields.length);
		   assert.equal('NEWDECIMAL', result.fields[0].type.name);
		   assert.equal('', result.fields[0].db);
		   assert.equal('1.23', result.fields[0].name);
		   assert.equal('', result.fields[0].org_name);
		   assert.equal('', result.fields[0].table);
		   assert.equal('', result.fields[0].org_table);
		   assert.equal(false, conn.has_more_results());
		   
		   // result data
		   assert.equal(1, result.records.length);
		   assert.equal(1.23, result.records[0][0]);
		   
		   // result hash
		   var res = result.toHash(result.records[0]);
		   assert.equal(res['1.23'], 1.23);
		   
		   // result hash fieldname without table
		   result.fieldname_with_table = false
		   var res = result.toHash(result.records[0]);
		   assert.equal(res['1.23'], 1.23);
		   conn.close();
		   promise.emitSuccess();
	       }, 
	       function(error) { 
		   assert.ok(true, false);
	       });
    return promise;
}
all_tests.push(["test_query_without_table", test_query_without_table]);


var test_placeholder = function() {
    var promise = new Promise();
    var conn = new mysql.Connection(config.mysql.hostname, 
					  config.mysql.username,
					  config.mysql.password,
					  config.mysql.database);
    helper.exceptClass(mysql.Connection, conn);
    conn.connect();
    
    var sql = conn.extract_placeholder(['SELECT ?,?,?,?,?,?,?,?', 123, 1.23, 'abc', true, false, new mysql.Time(1976,2,8), new mysql.Time(0,0,0,12,34,56), new mysql.Time(1976,2,8,12,34,56)]);
    assert.equal("SELECT 123,1.23,'abc',true,false,'1976-2-8 0:0:0','12:34:56','1976-2-8 12:34:56'", sql);
    
    helper.expect_callback();
    conn.query(['SELECT ?,?', 123],
	       function(result) {
		   assert.ok(true, false);
	       }, 
	       function(error) {
		   helper.was_called_back();
		   assert.equal('parameter count mismatch', error.message);
	       });

    helper.expect_callback();
    conn.query(['SELECT ?', 123, 456],
	       function(result) {
		   assert.ok(true, false);
	       }, 
	       function(error) {
		   helper.was_called_back();
		   assert.equal('parameter count mismatch', error.message);
	       });

    helper.expect_callback();
    conn.query(['SELECT ?,?,?,?,?', 123, 1.23, 'abc', true, false],
	       function(result) {
		   helper.was_called_back();
		   
		   // field information
		   assert.equal(5, result.fields.length);
		   
		   // result data
		   assert.equal(1, result.records.length);
		   assert.equal(123, result.records[0][0]);
		   assert.equal(1.23, result.records[0][1]);
		   assert.equal('abc', result.records[0][2]);
		   assert.equal(1, result.records[0][3]);
		   assert.equal(0, result.records[0][4]);
		   conn.close();
		   promise.emitSuccess();
	       }, 
	       function(error) {
		   sys.puts(sys.inspect(error));
		   assert.ok(true, false);
	       });
    return promise
}
all_tests.push(["test_placeholder", test_placeholder]);


var test_multi_statements = function() {
    var promise = new Promise();
    var conn = new mysql.Connection(config.mysql.hostname, 
					  config.mysql.username,
					  config.mysql.password,
					  config.mysql.database);
    helper.exceptClass(mysql.Connection, conn);
    conn.connect();

    // multi statement without MULTI_STATEMENTS_ON
    helper.expect_callback();
    conn.query('SELECT 1,2; SELECT 3,4,5',
	       function(result) { // success
		   assert.ok(true, false);
	       },
	       function(error) { // fail
		   helper.was_called_back();
	       });

    // multi statement
    conn.set_server_option(mysql.constants.option.MULTI_STATEMENTS_ON);
    helper.expect_callback();
    conn.query('SELECT 1,2; SELECT 3,4,5',
               function(result) {
		   helper.was_called_back();
		   
		   // result 1st query data
		   assert.equal(1, result.records.length);
		   assert.equal(1, result.records[0][0]);
		   assert.equal(2, result.records[0][1]);
		   
		   assert.equal(true, conn.has_more_results());
		   helper.expect_callback();
		   conn.next_result(
		       function(result) {
			   helper.was_called_back();
			   // result 2nd query data
			   assert.equal(1, result.records.length);
			   assert.equal(3, result.records[0][0]);
			   assert.equal(4, result.records[0][1]);
			   assert.equal(5, result.records[0][2]);
			   
			   // no more data
			   assert.equal(false, conn.has_more_results());
			   conn.close();
			   promise.emitSuccess();
		       },
		       function(error){
			   assert.ok(true, false);
		       });
	       },
	       function(error) {
		   assert.ok(true, false);
	       });
    return promise
}
all_tests.push(["test_multi_statements", test_multi_statements]);


var test_quote = function(complete) {
    assert.equal("abc\\'def\\\"ghi\\0jkl%mno\u8868", mysql.quote("abc'def\"ghi\0jkl%mno\u8868"));
};
all_tests.push(["test_quote", test_quote]);


var test_prepared_statements = function() {
    var promise = new Promise();
    var conn = new mysql.Connection(config.mysql.hostname, 
	                            config.mysql.username,
				    config.mysql.password,
			            config.mysql.database);
    helper.exceptClass(mysql.Connection, conn);
    conn.connect();
    conn.query("CREATE TEMPORARY TABLE t (id INTEGER, str VARCHAR(10), PRIMARY KEY (id)) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci'");
    
    helper.expect_callback();
    conn.prepare('INSERT INTO t VALUE (?,?)', function(stmt) {
	helper.was_called_back();
	stmt.execute([1, 'abc'], helper.scope(this, function(result) {
	    // verify inserted data
	    helper.expect_callback();
	    conn.query('SELECT * FROM t ORDER BY id', function(result) {
		helper.was_called_back();
		
		// result data
		assert.equal(1, result.records.length);
		assert.equal(1, result.records[0][0]);
		assert.equal('abc', result.records[0][1]);
		
		helper.expect_callback();
		stmt.execute([2,'def'], helper.scope(this, function(result) {
		    helper.was_called_back();
		    // verify inserted data
		    helper.expect_callback();
		    conn.query('SELECT * FROM t ORDER BY id', function(result) {
			helper.was_called_back();
			
			// result data
			assert.equal(2, result.records.length);
			assert.equal(1, result.records[0][0]);
			assert.equal('abc', result.records[0][1]);
			assert.equal(2, result.records[1][0]);
			assert.equal('def', result.records[1][1]);
			
			helper.expect_callback();
			stmt.execute([3,'def'], helper.scope(this, function(result) {
			    helper.was_called_back();
			    
			    helper.expect_callback();
			    conn.prepare('SELECT * FROM t WHERE str=? ORDER BY id', function(stmt2) {
				helper.was_called_back();
				helper.expect_callback();
				stmt2.execute(['def'],  helper.scope(this, function(result) {
				    helper.was_called_back();
				    // result data
				    assert.equal(2, result.records.length);
				    assert.equal(2, result.records[0][0]);
				    assert.equal('def', result.records[0][1]);
				    assert.equal(3, result.records[1][0]);
				    assert.equal('def', result.records[1][1]);
				    
				    conn.close();
				    promise.emitSuccess();
				}),
			        function(error){ assert.ok(true, false); });
			    },
			    function(error){ assert.ok(true, false); });
			}),
                        function(error){ assert.ok(true, false); });
		    },
                    function(error){ assert.ok(true, false); });
		}),
                function(error){ assert.ok(true, false); });
	    },
            function(error){ assert.ok(true, false); });
	}),
        function(error){ assert.ok(true, false); });
    },
    function(error){ assert.ok(true, false); });
    return promise
}
all_tests.push(["test_prepared_statements", test_prepared_statements]);


var test_transaction1 = function() {
    var promise = new Promise();
    var conn = new mysql.Connection(config.mysql.hostname, 
					  config.mysql.username,
					  config.mysql.password,
					  config.mysql.database);
    helper.exceptClass(mysql.Connection, conn);
    conn.connect();
    conn.autocommit(false);
    conn.query("CREATE TEMPORARY TABLE t (id INTEGER, str VARCHAR(254), PRIMARY KEY (id)) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' Type=InnoDB");
    conn.query("BEGIN");
    conn.query("INSERT INTO t VALUES (1,'abc')");
    conn.query("COMMIT");
    // execute SELECT query
    helper.expect_callback();
    conn.query('SELECT * FROM t ORDER BY id', function(result) { // Success
	helper.was_called_back();
	
	assert.equal(1, result.records.length);
	assert.equal(1, result.records[0][0]);
	assert.equal('abc', result.records[0][1]);

	conn.close();
	promise.emitSuccess();
    });
    return promise;
}
all_tests.push(["test_transaction1", test_transaction1]);


var test_transaction2 = function() {
    var promise = new Promise();
    var conn = new mysql.Connection(config.mysql.hostname, 
					  config.mysql.username,
					  config.mysql.password,
					  config.mysql.database);
    helper.exceptClass(mysql.Connection, conn);
    conn.connect();
    conn.autocommit(false);
    conn.query("CREATE TEMPORARY TABLE t (id INTEGER, str VARCHAR(254), PRIMARY KEY (id)) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' Type=InnoDB");
    conn.query("BEGIN");
    conn.query("INSERT INTO t VALUES (1,'abc')");
    conn.query("ROLLBACK");
    // execute SELECT query
    helper.expect_callback();
    conn.query('SELECT * FROM t ORDER BY id', function(result) { // Success
	helper.was_called_back();
	assert.equal(0, result.records.length);
	conn.close();
	promise.emitSuccess();
    });
    return promise;
}
all_tests.push(["test_transaction2", test_transaction2]);


var test_error = function() {
    var promise = new Promise();
    var conn = new mysql.Connection(config.mysql.hostname, 
					  config.mysql.username,
					  config.mysql.password,
					  config.mysql.database);
    helper.exceptClass(mysql.Connection, conn);
    conn.connect();
    helper.expect_callback();
    conn.query('ERROR STATEMENT',
	       function(result) {
		   promise.emitError();
	       },
	       function(error) {
		   helper.was_called_back();
		   sys.puts(error);
		   conn.close();
		   promise.emitSuccess();
	       });
    return promise;
}
all_tests.push(["test_error", test_error]);


var test_defaultError = function() {
    var promise = new Promise();
    var conn = new mysql.Connection(config.mysql.hostname, 
					  config.mysql.username,
					  config.mysql.password,
					  config.mysql.database);
    helper.exceptClass(mysql.Connection, conn);
    conn.connect();
    conn.defaultErrback = function(error) {
	helper.was_called_back();
	sys.puts(error);
	conn.close();
	promise.emitSuccess();
    };
    
    helper.expect_callback();
    conn.query('ERROR STATEMENT',
	       function(result) {
		   promise.emitError();
	       });
    return promise;
}
all_tests.push(["test_defaultError", test_defaultError]);


var test_statements_type = function(sql_type, value, assert_value_or_callback) {
    return function() {
	var promise = new Promise();
	var conn = new mysql.Connection(config.mysql.hostname, 
					config.mysql.username,
					config.mysql.password,
					config.mysql.database);
	helper.exceptClass(mysql.Connection, conn);
	conn.connect();
	conn.query("CREATE TEMPORARY TABLE t (id INTEGER, val "+sql_type+", PRIMARY KEY (id)) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' ENGINE=InnoDB");
	
	// regular query
	helper.expect_callback();
	conn.query("INSERT INTO t VALUE (1,'"+mysql.quote(value)+"')", function(result) {
	    helper.was_called_back();
	    // verify inserted data
	    helper.expect_callback();
	    conn.query('SELECT * FROM t ORDER BY id', function(result) {
		helper.was_called_back();
		
		// result data
		assert.equal(1, result.records.length);
		assert.equal(1, result.records[0][0]);
		if(typeof(assert_value_or_callback)=='undefined') {
		    assert.equal(value, result.records[0][1]);
		}
		else if(typeof(assert_value_or_callback)=='function') {
		    assert_value_or_callback(result.records[0][1]);
		}
		else {
		    assert.equal(assert_value_or_callback, result.records[0][1]);
		}
		conn.close();
		promise.emitSuccess();
	    },
            function(error){ assert.ok(true, false); });
	},
        function(error){ assert.ok(true, false); });
	return promise
    };
}

var test_prepared_statements_type = function(sql_type, value, assert_value_or_callback) {
    return function() {
	var promise = new Promise();
	var conn = new mysql.Connection(config.mysql.hostname, 
					config.mysql.username,
					config.mysql.password,
					config.mysql.database);
	helper.exceptClass(mysql.Connection, conn);
	conn.connect();
	conn.query("CREATE TEMPORARY TABLE t (id INTEGER, val "+sql_type+", PRIMARY KEY (id)) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci'");
	
	// prepared statement
	helper.expect_callback();
	conn.prepare('INSERT INTO t VALUE (?,?)', function(stmt) {
	    helper.was_called_back();
	    stmt.execute([1, value], helper.scope(this,function(result) {
		// verify inserted data
		
		helper.expect_callback();
		conn.query('SELECT * FROM t ORDER BY id', function(result) {
		    helper.was_called_back();
		    
		    // result data
		    assert.equal(1, result.records.length);
		    assert.equal(1, result.records[0][0]);
		    if(typeof(assert_value_or_callback)=='undefined') {
			assert.equal(value, result.records[0][1]);
		    }
		    else if(typeof(assert_value_or_callback)=='function') {
			assert.equal(true, assert_value_or_callback(result.records[0][1]));
		    }
		    else {
			assert.equal(assert_value_or_callback, result.records[0][1]);
		    }
		    
		    helper.expect_callback();
		    conn.prepare('SELECT * FROM t WHERE id=?', function(stmt) {
			helper.was_called_back();
			helper.expect_callback();
			stmt.execute([1], function(result) {
			    helper.was_called_back();
			    assert.equal(1, result.records.length);
			    assert.equal(1, result.records[0][0]);
			    if(typeof(assert_value_or_callback)=='undefined') {
				assert.equal(value, result.records[0][1]);
			    }
			    else if(typeof(assert_value_or_callback)=='function') {
				assert.equal(true, assert_value_or_callback(result.records[0][1]));
			    }
			    else {
				assert.equal(assert_value_or_callback, result.records[0][1]);
			    }
			    conn.close();
			    promise.emitSuccess();
			},
		        function(error){ assert.ok(true, false); });
		    },
		    function(error){ assert.ok(true, false); });
		},
	        function(error){ assert.ok(true, false); });
	    }),
	    function(error){ assert.ok(true, false); });
	},
	function(error){ assert.ok(true, false); });
	return promise
    };
}

var test_type = function(test_suite, sql_type, value, text_value, assert_value_or_callback) {
    test_suite.push(["Type "+sql_type+": "+sys.inspect(text_value), function() {
	var promise = new Promise();
	test_statements_type(sql_type, text_value, assert_value_or_callback)()
	    .addCallback(function() {
		test_prepared_statements_type(sql_type, value, assert_value_or_callback)()
		    .addCallback(function() {
			promise.emitSuccess()
		    });
	    });
	return promise
    }]);
}

// String types
test_type(all_tests, 'TEXT', 'abcdef', 'abcdef');
test_type(all_tests, 'TEXT', "\u3042\u3044\u3046\u3048\u304A", "\u3042\u3044\u3046\u3048\u304A");

test_type(all_tests, 'VARCHAR(10)', 'abcdef', 'abcdef');
test_type(all_tests, 'VARCHAR(10)', "\u3042\u3044\u3046\u3048\u304A", "\u3042\u3044\u3046\u3048\u304A");
test_type(all_tests, 'VARCHAR(5)', 'abcdef', 'abcdef', 'abcde');
test_type(all_tests, 'CHAR(10)', 'abcdef', 'abcdef');
test_type(all_tests, 'CHAR(10)', "\u3042\u3044\u3046\u3048\u304A", "\u3042\u3044\u3046\u3048\u304A");

test_type(all_tests, 'BLOB', 'abcdef', 'abcdef');
test_type(all_tests, 'ENUM("a","b","c")', 'a', 'a');
test_type(all_tests, 'ENUM("a","b","c")', 'z', 'z', '');
test_type(all_tests, 'ENUM("a","b","c","\u3042")', "\u3042", "\u3042");
test_type(all_tests, 'SET("a","b","c")', 'a,b', 'a,b');
test_type(all_tests, 'SET("a","b","c")', 'a,b,z', 'a,b,z', 'a,b');
test_type(all_tests, 'SET("a","b","c","\u3042")', 'a,b,\u3042', 'a,b,\u3042', 'a,b,\u3042');

// Number types
test_type(all_tests, 'INTEGER', 12345, "12345");
test_type(all_tests, 'INTEGER', -12345, "-12345");
test_type(all_tests, 'INTEGER UNSIGNED', -12345, "-12345", 0);
test_type(all_tests, 'INTEGER', 12345, "12345");
test_type(all_tests, 'BIGINT', 12345, "12345");
test_type(all_tests, 'MEDIUMINT', 12345, "12345");
test_type(all_tests, 'SMALLINT', 12345, "12345");
test_type(all_tests, 'TINYINT', 123, "123");
test_type(all_tests, 'TINYINT', 12345, "12345", 127);
test_type(all_tests, 'DECIMAL', 1234, "1234");
test_type(all_tests, 'DECIMAL', -1234, "-1234");
test_type(all_tests, 'FLOAT', 1.5, "1.5");
test_type(all_tests, 'FLOAT', 1234.0, "1234.0");
test_type(all_tests, 'FLOAT', 1234.5, "1234.5");
test_type(all_tests, 'FLOAT', -1234.5, "-1234.5");
test_type(all_tests, 'REAL', 1234.5, "1234.5");
test_type(all_tests, 'REAL', -1234.5, "-1234.5");
test_type(all_tests, 'DOUBLE', 1234.567, "1234.567");
test_type(all_tests, 'DOUBLE', 1234567.89, "1234567.89");
test_type(all_tests, 'DOUBLE', -1234567.89, "-1234567.89");

// Date types
test_type(all_tests, 'DATE', new mysql.Time(1976,2,8), "1976-2-8", function(v){return v.year==1976 && v.month==2 && v.day==8});
test_type(all_tests, 'DATE', new mysql.Time(0,0,0), "0-0-0", function(v){return v.year==0 && v.month==0 && v.day==0});
test_type(all_tests, 'DATE', new mysql.Time(1976,2,8,12,34,56), "1976-2-8 12:34:56", function(v){return v.year==1976 && v.month==2 && v.day==8 && v.hour==0 && v.minute==0 && v.second==0;});
test_type(all_tests, 'TIMESTAMP', new mysql.Time(1976,2,8,12,34,56), "1976-2-8 12:34:56", function(v){return v.year==1976 && v.month==2 && v.day==8 && v.hour==12 && v.minute==34 && v.second==56;});
test_type(all_tests, 'DATETIME', new mysql.Time(1976,2,8,12,34,56), "1976-2-8 12:34:56", function(v){return v.year==1976 && v.month==2 && v.day==8 && v.hour==12 && v.minute==34 && v.second==56});
test_type(all_tests, 'TIME', new mysql.Time(0,0,0,12,34,56), "12:34:56", function(v){return v.year==0 && v.month==0 && v.day==0 && v.hour==12 && v.minute==34 && v.second==56});
test_type(all_tests, 'TIME', new mysql.Time(0,0,8,12,34,56), "8 12:34:56", function(v){return v.year==0 && v.month==0 && v.day==0 && v.hour==204 && v.minute==34 && v.second==56});


var test_load_localfile = function() {
    var promise = new Promise();
    var conn = new mysql.Connection(config.mysql.hostname, 
					  config.mysql.username,
					  config.mysql.password,
					  config.mysql.database);
    helper.exceptClass(mysql.Connection, conn);
    conn.local_infile = true;
    conn.connect();
    conn.query("CREATE TEMPORARY TABLE t (id INTEGER, str VARCHAR(254), PRIMARY KEY (id)) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci'");
    var filename = __dirname + "/fixtures/data1.csv";
    conn.query("LOAD DATA LOCAL INFILE '"+mysql.quote(filename)+"' INTO TABLE t",undefined, function(e){sys.puts(sys.inspect(e));});
    
    // execute SELECT query
    helper.expect_callback();
    conn.query('SELECT * FROM t ORDER BY id',
	       function(result) { // Success
		   helper.was_called_back();

		   // field information
		   assert.equal(2, result.fields.length);
		   
		   // result data
		   assert.equal(2, result.records.length);
		   assert.equal(1, result.records[0][0]);
		   assert.equal('abc', result.records[0][1]);
		   assert.equal(2, result.records[1][0]);
		   assert.equal('def', result.records[1][1]);
		   conn.close();
		   promise.emitSuccess();
	       },
	       function(error){ assert.ok(true, false); });
    return promise;
}
all_tests.push(["test_load_localfile", test_load_localfile]);

helper.run(all_tests);

/*
node-mysql
A node.js interface for MySQL

Author: masuidrive <masui@masuidrive.jp>
License: MIT License
Copyright (c) Yuichiro MASUI
*/
