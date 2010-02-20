var sys = require('sys');
var pack = require('./pack');
var constants = require('./constants');
var Types = require('./types').Types;
var Charset = require('./charset').Charset;
process.mixin(require('./common'));

// TODO
var net2value = function(adata, type, unsigned) {
    switch(type.id) {
    case constants.field.TYPE_STRING:
    case constants.field.TYPE_VAR_STRING:
    case constants.field.TYPE_NEWDECIMAL:
    case constants.field.TYPE_BLOB:
        return lcs2str(adata);
    
    case constants.field.TYPE_TINY:
        //v = data.slice!(0).ord
        //return unsigned ? v : v < 128 ? v : v-256
	
    case constants.field.TYPE_SHORT:
        //v = data.slice!(0,2).unpack("v").first
        //return unsigned ? v : v < 32768 ? v : v-65536
    
    case constants.field.TYPE_INT24:
    case constants.field.TYPE_LONG:
        //v = data.slice!(0,4).unpack("V").first
        //return unsigned ? v : v < 2**32/2 ? v : v-2**32
	var data = adata[0].substring(0, 4);
	adata[0] = adata[0].substring(4);
        var n = pack.unpack("V", data);
        var v = n[0];
        return unsigned ? v : v < (4294967296)/2 ? v : v-(4294967296);
    
    case constants.field.TYPE_LONGLONG:
	var data = adata[0].substring(0, 8);
	adata[0] = adata[0].substring(8);
        var n = pack.unpack("VV", data)
        var v = (n[1] << 32) | n[0];
        return unsigned ? v : v < (18446744073709551616)/2 ? v : v-(18446744073709551616);
    
    case constants.field.TYPE_FLOAT:
        //return data.slice!(0,4).unpack("e").first
    
    case constants.field.TYPE_DOUBLE:
        //return data.slice!(0,8).unpack("E").first
    
    case constants.field.TYPE_DATE:
    case constants.field.TYPE_DATETIME:
    case constants.field.TYPE_TIMESTAMP:
        //len = data.slice!(0).ord
        //y, m, d, h, mi, s, bs = data.slice!(0,len).unpack("vCCCCCV")
        //return Mysql::Time.new(y, m, d, h, mi, s, bs)
    
    case constants.field.TYPE_TIME:
        //len = data.slice!(0).ord
        //sign, d, h, mi, s, sp = data.slice!(0,len).unpack("CVCCCV")
        //h = d.to_i * 24 + h.to_i
        //return Mysql::Time.new(0, 0, 0, h, mi, s, sign!=0, sp)
	
    case constants.field.TYPE_YEAR:
        //return data.slice!(0,2).unpack("v").first
    
    case constants.field.TYPE_BIT:
        //return lcs2str!(data)

    default:
        //raise "not implemented: type=#{type}"
    }

}

var value2net = function(v) {
    var val = '', type=0;
    switch(typeof(v)) {
    case 'undefined':
        type = constants.field.TYPE_NULL;
        val = "";
	break;

    case 'number':
	if(parseInt(v)==v) { // is integer
            if(v >= 0) {
		if(v < 256) {
		    type = constants.field.TYPE_TINY | 0x8000;
		    val = pack.pack("C",v);
		}
		else if(v < 256*256) {
		    type = constants.field.TYPE_SHORT | 0x8000;
		    val = pack.pack("v",v);
		}
		else if(v < 256*256*256*256) {
		    type = constants.field.TYPE_LONG | 0x8000;
		    val = pack.pack("V",v);
		}
		else if(v < 256*256*256*256*256*256*256*256) {
		    type = constants.field.TYPE_LONGLONG | 0x8000
		    val = pack.pack("VV",v&0xffffffff, v>>32);
		}
		else {
		    // TODO
		    //raise ProtocolError, "value too large: #{v}"
		}
	    }
            else {
		if(-1*v <= 256/2) {
		    type = constants.field.TYPE_TINY;
		    val = [v].pack("C");
		}
		else if(-1*v <= (256*256)/2) {
		    type = constants.field.TYPE_SHORT;
		    val = [v].pack("v");
		}
		else if(-1*v <= (256*256*256*256)/2) {
		    type = constants.field.TYPE_LONG;
		    val = [v].pack("V");
		}
		else if(-1*v <= (256*256*256*256*256*256*256*256)/2) {
		    type = constants.field.TYPE_LONGLONG;
		    val = [v&0xffffffff, v>>32].pack("VV");
		}
		else {
		    // TODO
		    //raise ProtocolError, "value too large: #{v}"
		}
	    }
        }
	else { // is double
            type = constants.field.TYPE_DOUBLE;
            val = [v].pack("E");
	}
        break;
	
    case 'string':
        type = constants.field.TYPE_STRING;
        val = lcs(v);
	break;
	
    // TODO
    /*
    case Mysql::Time, ::Time
        type = constants.field.TYPE_DATETIME
        val = [7, v.year, v.month, v.day, v.hour, v.min, v.sec].pack("CvCCCCC")
      else
    */
    default:
	// TODO
        //raise ProtocolError, "class #{v.class} is not supported"
    }
    return [type, val];
}



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


var ResultPacket = function(field_count, affected_rows, insert_id, server_status, warning_count, message) {
    this.field_count = field_count;
    this.affected_rows = affected_rows;
    this.insert_id = insert_id;
    this.server_status = server_status;
    this.warning_count = warning_count;
    this.message = message;
}
exports.ResultPacket = ResultPacket;

ResultPacket.parse = function(data) {
    var adata = [data];
    var field_count = lcb2int(adata);
    
    if(field_count == 0) {
        var affected_rows = lcb2int(adata);
        var insert_id = lcb2int(adata);
	var ret = pack.unpack("vva*", adata[0]);
        var server_status = ret[0];
	var warning_count = ret[1];
	var message = lcs2str([ret[2]]);
	return(new ResultPacket(field_count, affected_rows, insert_id, server_status, warning_count, message));
    }
    else if(typeof(field_count)=='undefined') {
	return(new ResultPacket(undefined, undefined, undefined, undefined, undefined, adata[0]));
    }
    return(new ResultPacket(field_count))
}


var PrepareResultPacket = function(statement_id, field_count, param_count, warning_count) {
    this.statement_id = statement_id;
    this.field_count = field_count;
    this.param_count = param_count;
    this.warning_count = warning_count;
}
exports.PrepareResultPacket = PrepareResultPacket;

PrepareResultPacket.parse = function(data) {
    var res = pack.unpack("cVvvCv", data);
    // raise ProtocolError, "invalid packet" unless res[0] == ?\0 // TODO
    // raise ProtocolError, "invalid packet" unless res[4] == 0x00
    return new PrepareResultPacket(res[1], res[2], res[3], res[5]);
}

var ExecutePacket = {}
exports.ExecutePacket = ExecutePacket;

ExecutePacket.serialize = function(statement_id, cursor_type, values) {
    var nbm = null_bitmap(values);
    var netvalues = "";
    var types = values.map(function(v) {
        var ret = value2net(v);
        if(typeof(v)!='undefined') {
	    netvalues = netvalues.concat(ret[1]);
	}
        return ret[0];
    });
    
    return pack.pack("CVCVZ*CZ*Z*", constants.com.STMT_EXECUTE, statement_id, cursor_type, 1, nbm, 1, pack.pack("v*", types), netvalues);
}

// make null bitmap
// If values is [1, nil, 2, 3, nil] then returns "\x12"(0b10010).
var null_bitmap = function(values) {  
    var val=0, len=0, bitmap=[];
    values.map(function(v) {
	val += (typeof(v)=="undefined" ? 1<<len : 0);
	len += 1;
	if(len==8) {
	    bitmap.push(val);
	    len = val = 0;
	}
	return val;
    });
    if(len>0) {
	bitmap.push(val);
    }
    return pack.pack("C*", bitmap);
}

// StatementRecord packet
var StatementRecordPacket = function(){
}
exports.StatementRecordPacket = StatementRecordPacket;

StatementRecordPacket.parse = function(data, fields, charset) {
    // data.slice!(0)  // skip first byte
    var null_bit_map_len = (fields.length+7+2)/8;
    var null_bit_map = pack.unpack("b*", data.substring(1, null_bit_map_len+1+1))[0];
    var i = -1, v;
    var adata = [data.substring(1+null_bit_map_len)];
    return fields.map(function(f) {
	i += 1;
        if(null_bit_map.substring(i+2,i+3) == '1') {
            return undefined;
        }
	else {
            var unsigned = !!(f.flags & constants.field.UNSIGNED_FLAG);
            var v = net2value(adata, f.type, unsigned);
            if(typeof(v)=='number') { // v.is_a? Mysql::Time) {
		return v;
	    }
	    else if(f.type == constants.field.TYPE_BIT || !!(f.flags & constants.field.BINARY_FLAG)) {
		return v; // Charset.to_binary(v)
	    }
            else {
		return v; // charset.force_encoding(v)
	    }
	}
    });
}

