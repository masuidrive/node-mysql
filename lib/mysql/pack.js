// 
// pack/unpack style seralizer and deserializer.
//  
exports.unpack = function(format, data) {
    var result = [];
    var instruction, quantifier, currentData, i;
    
    while(format) {
	instruction = format.substring(0,1);
	format = format.slice(1);
	quantifier = '1';
	var q = format.match(/^(\*|\d+)/);
	if(q!==null) {
	    quantifier = q[0];
	    format = format.slice(quantifier.length);
	}
        switch (instruction) {
        case 'a': // NUL-padded string
        case 'A': // SPACE-padded string
        case 'Z': // 
            if (quantifier === '*') {
		quantifier = data.indexOf( (instruction==='A'?" ":"\0"))+1;
                if(!quantifier) quantifier = data.length;
            } else {
                quantifier = parseInt(quantifier, 10);
            }
            currentData = data.substr(0, quantifier);
            data = data.slice(quantifier);
	    
            if (instruction === 'a') {
                currentResult = currentData.replace(/\0+$/, '');
	    }
            else if (instruction === 'A') {
                currentResult = currentData.replace(/ +$/, '');
            }
	    else { // 'Z'
		currentResult = currentData;
	    }
            result.push(currentResult);
            break;
	    
        case 'c': // signed char
        case 'C': // unsigned c
            if (quantifier === '*') {
                quantifier = data.length;
            } else {
                quantifier = parseInt(quantifier, 10);
            }
            currentData = data.substr(0, quantifier);
            data = data.slice(quantifier);
	    
            for (i=0;i<currentData.length;i++) {
                currentResult = parseInt(currentData.charCodeAt(i));
                if ((instruction === 'c') && (currentResult >= 128)) {
                    currentResult -= 256;
                }
                result.push(currentResult);
            }
            break;
	    
        case 'v': // unsigned short (always 16 bit, little endian byte order)
            if (quantifier === '*') {
                quantifier = (data.length) / 2;
            } else {
                quantifier = parseInt(quantifier, 10);
            }
            currentData = data.substr(0, quantifier*2);
            data = data.slice(quantifier*2);
            for (i=0;i<currentData.length;i+=2) {
                currentResult = parseInt(currentData.charCodeAt(i+1) << 8) +
                    parseInt(currentData.charCodeAt(i));
                result.push(currentResult);
            }
            break;
	    
        case 'V': // unsigned long (always 32 bit, little endian byte order)
            if (quantifier === '*') {
                quantifier = (data.length) / 4;
            } else {
                quantifier = parseInt(quantifier, 10);
            }
	    
            currentData = data.substr(0, quantifier*4);
            data = data.slice(quantifier*4);
            for (i=0;i<currentData.length;i+=4) {
                currentResult =
                    parseInt((currentData.charCodeAt(i+3) & 0xFF) << 24) +
                    parseInt((currentData.charCodeAt(i+2) & 0xFF) << 16) +
                    parseInt((currentData.charCodeAt(i+1) & 0xFF) << 8) +
                    parseInt((currentData.charCodeAt(i) & 0xFF));
                result.push(currentResult);
            }
            break;
	    
        default:
            throw new Error('Warning:  unpack() Type ' + instruction +
			    ': unknown format code');
	}
    }
    return result;
};

exports.pack = function(format) {
    var result = "";
    var instruction, quantifier, currentData;
    var argumentPointer = 1;
    
    while(format) {
	instruction = format.substring(0,1);
	format = format.slice(1);
	quantifier = '1';
	var q = format.match(/^(\*|\d+)/);
	if(q!==null) {
	    quantifier = q[0];
	    format = format.slice(quantifier.length);
	}
	
	switch (instruction) {
        case 'a': //NUL-padded string            
        case 'A': //SPACE-padded string
        case 'Z':
             if (typeof arguments[argumentPointer] === 'undefined') {
                throw new Error('Warning:  pack() Type ' + instruction +
                       ': not enough arguments');
            } else {
                argument = String(arguments[argumentPointer]);
            }
            if (quantifier === '*') {
                quantifier = argument.length + ((instruction === 'a') ? 1 : 0);
            }
            for (i = 0; i < quantifier; i ++) { 
               if (typeof argument[i] === 'undefined') {
                    if (instruction === 'a') {
                        result += String.fromCharCode(0);
                    } else {
                        result += ' ';
                    }
                } else {
                    result += argument[i];
                }
            }
	    argumentPointer++;
            break;
	    
        case 'c': //signed char
        case 'C': //unsigned char
            //c and C is the same in pack
            if (quantifier === '*') {
                quantifier = arguments.length - argumentPointer;
	    }
            if (quantifier > (arguments.length - argumentPointer)) {
                throw new Error('Warning:  pack() Type ' + instruction +
                        ': too few arguments');
            } 
            for (i = 0; i < quantifier; i++) {
                result += String.fromCharCode(arguments[argumentPointer]);
                argumentPointer++;
            }
	    break;

        case 'v':            //s and S is the same in pack
            //but can machine byte order be retrieved in javascript?
            //this is default byte order anywayz...
            if (quantifier === '*') {
                quantifier = arguments.length - argumentPointer;
	    }
            if (quantifier > (arguments.length - argumentPointer)) {
                throw new Error('Warning: pack() Type ' + instruction +
                        ': too few arguments');
            } 
            for (i = 0; i < quantifier; i++) {
                result += String.fromCharCode(arguments[argumentPointer] &
                        0xFF);
                result += String.fromCharCode(arguments[argumentPointer] >>                        8 & 0xFF);
                argumentPointer++;
            }
            break;
	    
        case 'V': // unsigned long (always 32 bit, little endian byte order)
            if (quantifier === '*') {
                quantifier = arguments.length - argumentPointer;
	    }
            if (quantifier > (arguments.length - argumentPointer)) {
                throw new Error('Warning: pack() Type ' + instruction +
                        ': too few arguments');
            } 
            for (i = 0; i < quantifier; i++) {
                result += String.fromCharCode(arguments[argumentPointer] & 0xFF);
                result += String.fromCharCode(arguments[argumentPointer] >> 8 & 0xFF);
                result += String.fromCharCode(arguments[argumentPointer] >> 16 & 0xFF);
                result += String.fromCharCode(arguments[argumentPointer] >> 24 & 0xFF);
                argumentPointer++;
            }
            break;

        default:
            throw new Error('Warning: pack() Type ' + instruction + ': unknown format code');
	}
    }
    return result;
};
/*
node-mysql
A node.js interface for MySQL

Author: masuidrive <masui@masuidrive.jp>
License: MIT License
Copyright (c) Yuichiro MASUI
*/
// Original
// MIT license http://phpjs.org/functions/pack:880
// http://kevin.vanzonneveld.net
// +   original by: Tim de Koning (http://www.kingsquare.nl)
// +      parts by: Jonas Raoni Soares Silva
// +      http://www.jsfromhell.com    // %        note 1: Float encoding by: Jonas Raoni Soares Silva

