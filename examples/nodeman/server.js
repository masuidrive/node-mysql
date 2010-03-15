#!/usr/bin/env node
var fs = require("fs");
var sys = require('sys');
var http = require('http');
var url = require('url');
var querystring = require('querystring');
var config = require('./config');
var mysql = require('../../lib/mysql');

var conn = new mysql.Connection(config.mysql.hostname, config.mysql.username, config.mysql.password, config.mysql.database, config.mysql.port);
conn.connect();
conn.addListener('close',function(){sys.puts('close')});

var moduleListJson = function(query, callback) {
    var result = {};
    conn.query("SELECT name, id FROM modules ORDER BY id", function(res) {
	result['modules'] = res.records;
	callback(result);
    },
    function(error) { callback({'error': error}); });
}

var truncate = function(str, len) {
    if(str.length<=len+3) return str;
    return str.substring(0, len-3)+"...";
}


var moduleJson = function(query, callback) {
    var result = {};
    conn.query(["SELECT name, description_html FROM modules WHERE id=?", query.id], function(res) {
	if(res.records.length>0) {
	    result['name'] = res.records[0][0];
	    result['description'] = res.records[0][1];
	}
	conn.query(["SELECT id, name, description FROM functions WHERE module_id=?", query.id], function(res) {
	    result.functions = res.records.map(function(row) {
		return({'id': row[0], 'name': row[1], 'description': truncate(row[2], 100) });
	    });
	    callback(result);
	},
	function(error) { callback({'error': error}); });
    },
    function(error) { callback({'error': error}); });
}

var functionJson = function(query, callback) {
    var result = {};
    conn.query(["SELECT functions.name as name, functions.description_html as description, functions.module_id as module_id, modules.name as module_name FROM functions INNER JOIN modules ON functions.module_id=modules.id WHERE functions.id=? LIMIT 1", query.id], function(res) {
	if(res.records.length>0) {
	    result = res.toHash(res.records[0]);
	}
	callback(result);
    },
    function(error) { callback({'error': error}); });
}

var searchJson = function(query, callback) {
    var result = {'modules':[], 'functions': [], 'search':[]};
    if(!query.query) return callback(result);
    var q = query.query.trim();
    var like_q = '%'+q.replace(/%/g,'%%')+'%';
    conn.query(["SELECT name, id FROM modules WHERE name LIKE ?", like_q], function(res) {
	result.modules = res.records.map(function(r){ return res.toHash(r); });
    },
    function(error) { callback({'error': error}); });
    
    conn.query(["SELECT functions.id as id, functions.name as name, modules.name as module_name FROM functions INNER JOIN modules ON functions.module_id=modules.id WHERE functions.name LIKE ?", like_q], function(res) {
	result.functions = res.records.map(function(r){ return res.toHash(r); });
    },
    function(error) { callback({'error': error}); });
    
    conn.query(["SELECT functions.id as id, functions.name as name, modules.name as module_name FROM functions INNER JOIN modules ON functions.module_id=modules.id WHERE MATCH(functions.description) AGAINST(? IN BOOLEAN MODE) LIMIT 10", q+"*"], function(res) {
	result.search = res.records.map(function(r){ return res.toHash(r); }).filter(function(item) {
	    for(var i=0; i<result.functions.length; ++i) {
		if(item.id==result.functions[i].id) return false;
	    };
	    return true;
	});
	callback(result);
    },
    function(error) { callback({'error': error}); });
}

var topPage = (function(query, callback) {
    var html = fs.readFileSync(__dirname+"/index.html");
    return function(query, callback) {
	callback(html);
    };
})();


var routes = {
    '/': topPage,
    '/json/modules.json': moduleListJson,
    '/json/module.json': moduleJson,
    '/json/function.json': functionJson,
    '/json/search.json': searchJson
};

http.createServer(function (req, res) {
    setTimeout(function () {
	var loc = url.parse(req.url);
	if(routes[loc.pathname]) {
	    routes[loc.pathname](querystring.parse(loc.query), function(result) {
		if(typeof(result)=="string") {
		    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
		    res.write(result);
		}
		else {
		    res.writeHead(200, {'Content-Type': 'text/plain'});
		    res.write(JSON.stringify(result));
		}
		res.close();
	    });
	}
	else {
	    res.writeHead(200, {'Content-Type': 'text/plain'});
	    res.write('Hello World');
	    res.close();
	}
    }, 2000);
}).listen(8000);

sys.puts('Server running at http://127.0.0.1:8000/');