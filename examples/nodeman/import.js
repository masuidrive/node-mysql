#!/usr/bin/env node
var sys = require('sys');
var config = require('./config');
var mysql = require('../../lib/mysql');

/*
MySQL preparation
$ mysql -u root
CREATE DATABASE nodeman  DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
GRANT ALL ON nodeman.* TO nodeman@localhost IDENTIFIED BY "nodeman";
*/

var conn = new mysql.Connection(config.mysql.hostname, config.mysql.username, config.mysql.password, config.mysql.database, config.mysql.port);
conn.connect();
conn.query("CREATE TABLE IF NOT EXISTS functions(id INTEGER AUTO_INCREMENT, module_id INTEGER, name VARCHAR(254), description TEXT, description_html TEXT, PRIMARY KEY (id), FULLTEXT(name), FULLTEXT(description)) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci'");
conn.query("TRUNCATE functions");
conn.query("CREATE TABLE IF NOT EXISTS modules(id INTEGER AUTO_INCREMENT, name VARCHAR(254), description TEXT, description_html TEXT, PRIMARY KEY (id), FULLTEXT(name), FULLTEXT(description)) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci'");
conn.query("TRUNCATE modules");

var json = '';
process.stdio.addListener('data', function (data) { json += data; });
process.stdio.addListener('close', function (data) {
    var sections = JSON.parse(json);
    sections.forEach(function(section) {
	conn.query(["INSERT INTO modules(name, description, description_html) VALUES(?,?,?)", section.name, section.description, section.description_html], function(result) {
	    module_id = conn.insert_id;
	    sys.puts(section.name);
	    section.functions.forEach(function(func) {
		sys.puts("  "+func.name);
		conn.query(["INSERT INTO functions(name, module_id, description, description_html) VALUES(?,?,?,?)", func.name, module_id, func.description, func.description_html]);
	    });
	    if(sections[sections.length-1]==section) {
		conn.close();
	    }
	});
    });
});
process.stdio.open();
