var pack = require('./pack');

var scope = function(target, func) {
    return function(){ return func.apply(target, arguments); }
}
exports.scope = scope;

// patch for promise late chain
var patchForPromiseLateChain;
var current_ver = process.version.match(/v([.0-9]+)/)[1].split(".");
if(parseInt(current_ver[0])*1000*1000+parseInt(current_ver[1])*1000+parseInt(current_ver[2])<10029) {
    patchForPromiseLateChain = function(promise) {
	var addCallback = promise.prototype.addCallback;
	promise.prototype.addCallback = function() {
	    addCallback.apply(this, arguments);
	    return this;
	}
    };
}
else {
    patchForPromiseLateChain = function(promise) {
    };
}
exports.patchForPromiseLateChain = patchForPromiseLateChain;


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
    if(len==0) return undefined;
    var data = lcs[0].substring(0, len);
    lcs[0] = lcs[0].slice(len);
    return data;
}
exports.lcs2str = lcs2str;

