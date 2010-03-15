#!/usr/bin/env node
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

// Load api.html from nodejs.org
var modules = [];
var github = http.createClient(80, "nodejs.org");
var request = github.request("GET", "/api.html", {"host": "nodejs.org"});
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
	var doc = libxml.parseHtmlString(body);
	doc.find("//h2").forEach(function(sectionTitleEl){ // section
	    var sectionTitle = sectionTitleEl.text().trim();
	    var sectionBodyEl = sectionTitleEl.nextElement();
	    
	    var functions = [];
	    doc.find(sectionBodyEl.path()+"//dt[@class='hdlist1']").forEach(function(funcNameEl){
		var funcName = funcNameEl.text().trim();
		var funcBodyEl = funcNameEl.nextElement(); // dd
		functions.push({'module': sectionTitle, 'name': funcName, 'description': funcBodyEl.text().trim().replace(/[ \t\r\n]+/g,' '), 'description_html': String(funcBodyEl).replace(/&#13;/g,'')});
	    });
	    doc.find(sectionBodyEl.path()+"//dl").forEach(function(el){el.remove();});
	    var sectionDescriptionEl = doc.get(sectionBodyEl.path());
	    if(sectionTitle!="NAME") {
		modules.push({'name': sectionTitle, 'description': sectionDescriptionEl.text().trim().replace(/[ \t\r\n]+/g,' '), 'description_html': String(sectionDescriptionEl).replace(/&#13;/g,''), 'functions': functions});
	    }
	});
	
	sys.puts(JSON.stringify(modules));
    });
});
request.close();


