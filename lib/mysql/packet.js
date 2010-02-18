var sys = require('sys');
var pack = require('./pack');
var Types = require('./types').Types;
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
};

exports.AuthenticationPacket = function(client_flags, max_packet_size, charset_number, username, scrambled_password, databasename) {
    //turn(pack.pack("VVa*a23Z*A*Z*",
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
    this.type = Types[type];
    this.flags = flags;
    this.decimals = decimals;
    this.defaultVal = defaultVal;
}
exports.FieldPacket = FieldPacket;

FieldPacket.parse = function(data) {
    var adata = [data];
    var first = lcs2str(adata);
    var db = lcs2str(adata);
    var table = lcs2str(adata);
    var org_table = lcs2str(adata);
    var name = lcs2str(adata);
    var org_name = lcs2str(adata);

    var more = pack.unpack("CvVCvCva*", adata[0]);
    if(more[6]!=0) return undefined;
    // raise ProtocolError, "invalid packet: f1="+etc[0]+"" unless etc[0] == 0
    var defaultVal = lcs2str([more[7]]);
    return new FieldPacket(db, table, org_table, name, org_name, more[1], more[2], more[3], more[4], more[5], defaultVal);
}


var ResultPacket = function(data) {
    var adata = [data];
    this.field_count = lcb2int(adata);
    this.affected_rows = this.insert_id = undefined;
    this.warning_count = this.message = this.server_status = undefined;

    if(this.field_count == 0) {
        this.affected_rows = lcb2int(adata);
        this.insert_id = lcb2int(adata);
	var ret = pack.unpack("vva*", adata[0]);
        this.server_status = ret[0];
	this.warning_count = ret[1];
	this.message = lcs2str([ret[2]]);
    }
    else if(!this.field_count) {
	this.message = adata[0];
    }
}
exports.ResultPacket = ResultPacket;