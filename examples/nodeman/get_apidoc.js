#!/usr/bin/env node
var fs = require("fs");
var sys = require('sys');
var http = require('http');
try { 
    var libxml = require('libxmljs');
}
catch(e) {
    sys.puts("This script required libxmljs");
    sys.puts("Please install http://libxmljs.squishtech.com/");
    process.exit();
}
var config = require('./config');

var makeAnchor = function(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/gi, '_');
}

var modules = [];
var nodejsorg = http.createClient(80, "nodejs.org");
var request = nodejsorg.request("GET", "/api.html", {"host": "nodejs.org"});
request.addListener('response', function (response) {
    if(response.statusCode!=200) {
	sys.puts("Can't load api.txt");
	process.exit();
    }
    
    var body = '';
    response.setBodyEncoding("utf8");
    response.addListener("data", function (chunk) {
	body += chunk;
    });
    response.addListener("end", function () {
	body = body.replace(/\r\n/g, "\n");
	// Create json
	var doc = libxml.parseHtmlString(body);
	doc.find("//h2").forEach(function(sectionTitleEl){ // section
	    var sectionTitle = sectionTitleEl.text().trim();
	    var sectionId = makeAnchor(String(sectionTitleEl.attr('id') || sectionTitle).trim());
	    var sectionBodyEl = sectionTitleEl.nextElement();
	    var functions = [];
	    doc.find(sectionBodyEl.path()+"//dt[@class='hdlist1']").forEach(function(funcNameEl){
		var funcName = funcNameEl.text().trim();
		var funcBodyEl = funcNameEl.nextElement(); // dd
		var anchor = "_"+makeAnchor(sectionId+" "+funcName);
		functions.push({'module': sectionTitle, 'name': funcName, 'anchor': anchor, 'description': funcBodyEl.text().trim().replace(/[ \t\r\n]+/g,' '), 'description_html': String(funcBodyEl).replace(/&#13;/g,'')});
	    });
	    var sectionDescriptionEl = doc.get(sectionBodyEl.path());
	    if(sectionTitle!="NAME") {
		modules.push({'name': sectionTitle, 'anchor': sectionId, 'description': sectionDescriptionEl.text().trim().replace(/[ \t\r\n]+/g,' '), 'description_html': String(sectionDescriptionEl).replace(/&#13;/g,''), 'functions': functions});
	    }
	});
	fs.writeFile('api.json', JSON.stringify(modules));
	
	// Create api.html
	var doc = libxml.parseHtmlString(body);
	doc.find("//h2").forEach(function(sectionTitleEl){ // section
	    var sectionTitle = sectionTitleEl.text().trim();
	    var sectionId = makeAnchor(String(sectionTitleEl.attr('id') || sectionTitle).trim());
	    sectionTitleEl.attr({"id": sectionId});
	    sectionTitleEl.addChild(new libxml.Element(doc, "a", {'name': sectionId}, ' '));
	    var sectionBodyEl = sectionTitleEl.nextElement();
	    doc.find(sectionBodyEl.path()+"//dt[@class='hdlist1']").forEach(function(funcNameEl){
		var funcName = funcNameEl.text().trim();
		var anchor = "_"+makeAnchor(sectionId+" "+funcName);
		funcNameEl.attr({"id": anchor});
		funcNameEl.addChild(new libxml.Element(doc, "a", {'name': anchor}, ' '));
	    });
	});
	doc.get("//head").childNodes().forEach(function(el) {
	    el.remove();
	});
	doc.get("//head").addChild(new libxml.Element(doc, "title", {}, "nodejs manual"));
	doc.get("//head").addChild(new libxml.Element(doc, "link", {'href': "/style.css", 'rel': "stylesheet", 'type': "text/css", 'charset': "utf-8"}));

	fs.writeFile('api.html', String(doc));
    });
});
request.close();


