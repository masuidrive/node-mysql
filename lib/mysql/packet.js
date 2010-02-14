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

// Field packet
var FieldPacket = function(db, table, org_table, name, org_name, charsetnr, length, type, flags, decimals, defaultVal) {
    this.db = db;
    this.table = table;
    this.org_table = org_table;
    this.name = name;
    this.org_name = org_name;
    this.charsetnr = charsetnr;
    this.length = length;
    this.type = type;
    this.flags = flags;
    this.decimals = decimals;
    this.defaultVal = defaultVal;
}
exports.FieldPacket = FieldPacket;

exports.FieldPacket.parse = function(data) {
    var adata = [data];
sys.puts("a> 1");
    var first = lcs2str(adata);
sys.puts("a> 2");
    var db = lcs2str(adata);
    var table = lcs2str(adata);
    var org_table = lcs2str(adata);
    var name = lcs2str(adata);
    var org_name = lcs2str(adata);
sys.puts("a> 3");

    var more = pack.unpack("CvVCvCva*", adata[0]);
sys.puts("a> 4");
    // raise ProtocolError, "invalid packet: f1="+etc[0]+"" unless etc[0] == 0
    var defaultVal = lcs2str([more[7]]);
    return new FieldPacket(db, table, org_table, name, org_name, more[1], more[2], more[3], more[4], more[5], defaultVal);
}

exports.ResultPacket = function(data) {
    var adata = [data];
    this.field_count = lcb2int(adata);
    this.affected_rows = this.insert_id = undefined;
    this.warning_count = this.message = this.server_status = undefined;

    if(this.field_count == 0) {
        this.affected_rows = lcb2int(adata);
        this.insert_id = lcb2int(adata);
	ret = adata[0].unpack("vva*");
        this.server_status = ret[0];
	this.warning_count = ret[1];
	this.message = lcs2str([ret[2]]);
    }
    else if(!this.field_count) {
	this.message = adata[0];
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

var lcs2str = function(lcs) {
    var len = lcb2int(lcs);
    if(len==0) return undefined;
    var data = lcs[0].substring(0, len);
    lcs[0] = lcs[0].slice(len);
    return data;
}
