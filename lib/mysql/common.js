var pack = require('./pack');

var scope = function(target, func) {
    return function(){ return func.apply(target, arguments); }
}
exports.scope = scope;

// convert Numeric to LengthCodedBinary
var lcb = function(num) {
    if(num==undefined) return "\xfb";
    if(num<251) return pack.pack("C", num);
    if(num<65536) return pack.pack("Cv", 252, num);
    if(num<16777216) return pack.pack("CvC", 253, num&0xffff, num>>16);
    return pack.pack("CVV", 254, num&0xffffffff, num>>32);
};
exports.lcb = lcb;

// convert String to LengthCodedString
var lcs = function(str) {
    return lcb(str.length)+str;
};
exports.lcs = lcs;

/* convert LengthCodedBinary to Integer
# === Argument
# lcb :: [String] LengthCodedBinary. This value will be broken.
# === Return
# Integer or nil */
var lcb2int = function(lcbs) {
    if(!lcbs[0]) return undefined;
    
    var ret;
    var lcb = lcbs[0];
    var v = lcb.substring(0,1);
    lcb = lcb.slice(1);
    switch(v) {
    case "\xfb":
	v = undefined;
	break;
	
    case "\xfc":
	lcb = lcb.slice(2);
	v = pack.unpack("v", lcb.substring(0,2))[0];
	break;
	
    case "\xfd":
	lcb = lcb.slice(3);
	v = pack.unpack("Cv", lcb.substring(0,3));
	v = (v[1]<<8+v[0]);
	break;
	
    case "\xfe":
	lcb = lcb.slice(8);
	v = pack.unpack("VV", lcb.substring(0,8));
	v = (v[1]<<32+v[0]);
	break;
	
    default:
	v =  v.charCodeAt(0);
	break;
    }
    lcbs[0] = lcb;
    return(v);
}
exports.lcb2int = lcb2int;

var lcs2str = function(lcs) {
    var len = lcb2int(lcs);
    if(typeof(len)=="undefined") return undefined;
    var data = lcs[0].substring(0, len);
    lcs[0] = lcs[0].slice(len);
    return data;
}
exports.lcs2str = lcs2str;




// "あい" => "\xE3\x81\x82\xE3\x81\x84"  // UTF-8
exports.char_encode = function(str) {
    if(typeof(str)=='undefined') return undefined;
    
    var surrogate_1st = 0;
    var unicode_codes = [];
    for (var i = 0; i < str.length; ++i) {
	var utf16_code = str.charCodeAt(i);
	if (surrogate_1st != 0) {
	    if (utf16_code >= 0xdc00 && utf16_code <= 0xdfff) {
		var surrogate_2nd = utf16_code;
		var unicode_code = (surrogate_1st - 0xd800) * (1 << 10) + (1 << 16) +
                    (surrogate_2nd - 0xdc00);
		unicode_codes.push(unicode_code);
	    }
	    surrogate_1st = 0;
	}
	else if (utf16_code >= 0xd800 && utf16_code <= 0xdbff) {
	    surrogate_1st = utf16_code;
	}
	else {
	    unicode_codes.push(utf16_code);
	}
    }
    
    var utf8_bytes = "";
    var i, unicode_code;
    for(i=0; i<unicode_codes.length; ++i) {
	unicode_code = unicode_codes[i];
	if (unicode_code < 0x80) {  // 1-byte
	    utf8_bytes += String.fromCharCode(unicode_code);
	}
	else if (unicode_code < (1 << 11)) {  // 2-byte
	    utf8_bytes += String.fromCharCode((unicode_code >>> 6) | 0xC0);
	    utf8_bytes += String.fromCharCode((unicode_code & 0x3F) | 0x80);
	}
	else if (unicode_code < (1 << 16)) {  // 3-byte
	    utf8_bytes += String.fromCharCode((unicode_code >>> 12) | 0xE0);
	    utf8_bytes += String.fromCharCode(((unicode_code >> 6) & 0x3f) | 0x80);
	    utf8_bytes += String.fromCharCode((unicode_code & 0x3F) | 0x80);
	}
	else if (unicode_code < (1 << 21)) {  // 4-byte
	    utf8_bytes += String.fromCharCode((unicode_code >>> 18) | 0xF0);
	    utf8_bytes += String.fromCharCode(((unicode_code >> 12) & 0x3F) | 0x80);
	    utf8_bytes += String.fromCharCode(((unicode_code >> 6) & 0x3F) | 0x80);
	    utf8_bytes += String.fromCharCode((unicode_code & 0x3F) | 0x80);
	}
    }
    return utf8_bytes;
}

exports.char_decode = function(str) {
    if(typeof(str)=='undefined') return undefined;

    var unicode_str = "";
    var unicode_code = 0;
    var num_followed = 0;
    var utf8_byte;
    for (var i = 0; i < str.length; ++i) {
	utf8_byte = str.charCodeAt(i)
	if (utf8_byte >= 0x100) {
	    // Malformed utf8 byte ignored.
	}
	else if ((utf8_byte & 0xc0) == 0x80) {
	    if (num_followed > 0) {
		unicode_code = (unicode_code << 6) | (utf8_byte & 0x3f);
		num_followed -= 1;
	    } else {
		// Malformed UTF-8 sequence ignored.
	    }
	}
	else {
	    if (num_followed == 0) {
		unicode_str += String.fromCharCode(unicode_code);
	    }
	    else {
		// Malformed UTF-8 sequence ignored.
	    }
	    if (utf8_byte < 0x80){  // 1-byte
		unicode_code = utf8_byte;
		num_followed = 0;
	    } else if ((utf8_byte & 0xe0) == 0xc0) {  // 2-byte
		unicode_code = utf8_byte & 0x1f;
		num_followed = 1;
	    } else if ((utf8_byte & 0xf0) == 0xe0) {  // 3-byte
		unicode_code = utf8_byte & 0x0f;
		num_followed = 2;
	    } else if ((utf8_byte & 0xf8) == 0xf0) {  // 4-byte
		unicode_code = utf8_byte & 0x07;
		num_followed = 3;
	    } else {
		// Malformed UTF-8 sequence ignored.
	    }
	}
    }
    if (num_followed == 0) {
	unicode_str += String.fromCharCode(unicode_code);
    } else {
	// Malformed UTF-8 sequence ignored.
    }
    
    return unicode_str.substring(1);

}
