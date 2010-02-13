var sys = require('sys');
var pack = require('./pack');
var Charset = require('./charset').Charset;
process.mixin(require('./common'));

exports.InitialPacket = function(data) {
    res = pack.unpack("Ca*Va8CvCva13a13", data);
    
    this.protocol_version = res[0];     // C
    this.server_version = res[1];       // a*
    this.thread_id = res[2];            // V
    this.scramble_buff = res[3]+res[9]; // a8 + a13
    this.server_capabilities = res[5];  // v
    this.server_charset = res[6];       // C
    this.server_status = res[7];        // v
    /*
    raise ProtocolError, "unsupported version: #{protocol_version}" unless protocol_version == VERSION
    raise ProtocolError, "invalid packet: f0=#{f0}" unless f0 == 0
    raise ProtocolError, "invalid packet: f1=#{f1.inspect}" unless f1 == "\0\0\0\0\0\0\0\0\0\0\0\0\0"
    */
};

exports.AuthenticationPacket = function(client_flags, max_packet_size, charset_number, username, scrambled_password, databasename) {
    //return(pack.pack("VVa*a23Z*A*Z*",
    return(pack.pack("VVca23a*A*a*", 
        client_flags,
        max_packet_size,
        charset_number,
        "",                   // always 0x00 * 23
        username,
        lcs(scrambled_password),
        databasename || ''
    ));
};

exports.ResultPacket = function(data) {
    var ret = lcb2int(data);
    data = ret[0];
    this.field_count = ret[1];
    this.affected_rows = this.insert_id = undefined;
    this.warning_count = this.message = this.server_status = undefined;

    if(this.field_count == 0) {
	ret = lcb2int(data);
	data = ret[0];
        this.affected_rows = ret[1];

	ret = lcb2int(data);
	data = ret[0];
        this.insert_id = ret[1];
	
	ret = data.unpack("vva*");
        this.server_status = ret[0];
	this.warning_count = ret[1];
	this.message = lcs2str(ret[2]);
    }
    else if(!this.field_count) {
	this.message = data;
    }
}


// convert Numeric to LengthCodedBinary
var lcb = function(num) {
    if(num==undefined) return "\xfb";
    if(num<251) return pack.pack("C", num);
    if(num<65536) return pack.pack("Cv", 252, num);
    if(num<16777216) return pack.pack("CvC", 253, num&0xffff, num>>16);
    return pack.pack("CVV", 254, num&0xffffffff, num>>32);
};


// convert String to LengthCodedString
var lcs = function(str) {
    return lcb(str.length)+str;
};


/* convert LengthCodedBinary to Integer
# === Argument
# lcb :: [String] LengthCodedBinary. This value will be broken.
# === Return
# Integer or nil */
var lcb2int = function(lcb) {
    if(!lcb) return undefined;
    
    var ret;
    var v = lcb.substring(0,1);
    lcb = lcb.slice(1);
    switch(v) {
    case "\xfb":
	return([lcb, undefined]);
	
    case "\xfc":
	lcb = lcb.slice(2);
	v = pack.unpack("v", lcb.substring(0,2))[0];
        return([lcb, v]);
	
    case "\xfd":
	lcb = lcb.slice(3);
	v = pack.unpack("Cv", lcb.substring(0,3));
	return([lcb, (v[1]<<8+v[0])]);
	
    case "\xfe":
	lcb = lcb.slice(8);
	v = pack.unpack("VV", lcb.substring(0,8));
	return([lcb, (v[1]<<32+v[0])]);
    }
    return([lcb, v.charCodeAt(0)]);
}

var lcs2str = function(lcs) {
      var data = lcb2int(lcs);
      return data[1] && data[0].substring(0, data[1]);
}