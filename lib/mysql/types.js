var cons = require('./constants');

var Time = function(year, month, day, hour, minute, second, neg, second_part) {
    this.year = year;
    this.month = month;
    this.day = day;
    this.hour = hour;
    this.minute = minute;
    this.second = second;
    this.neg = !!neg;
    this.second_part = second_part;
}
exports.Time = Time;


var Types = {};
Types[cons.field.TYPE_DECIMAL] = {
    id: cons.field.TYPE_DECIMAL,
    name: 'DECIMAL',
    convert: function(val, protocol) {
        return typeof(val)=='undefined' ? null : parseFloat(val);
    }
};
    
Types[cons.field.TYPE_TINY] = {
    id: cons.field.TYPE_TINY,
    name: 'TINY',
    convert: function(val, protocol) {
        return typeof(val)=='undefined' ? null : parseInt(val);
    }
};

Types[cons.field.TYPE_SHORT] = {
    id: cons.field.TYPE_SHORT,
    name: 'SHORT',
    convert: function(val, protocol) {
        return typeof(val)=='undefined' ? null : parseInt(val);
    }
};

Types[cons.field.TYPE_LONG] = {
    id: cons.field.TYPE_LONG,
    name: 'LONG',
    convert: function(val, protocol) {
        return typeof(val)=='undefined' ? null : parseInt(val);
    }
};

Types[cons.field.TYPE_FLOAT] = {
    id: cons.field.TYPE_FLOAT,
    name: 'FLOAT',
    convert: function(val, protocol) {
        return typeof(val)=='undefined' ? null : parseFloat(val);
    }
};

Types[cons.field.TYPE_DOUBLE] = {
    id: cons.field.TYPE_DOUBLE,
    name: 'DOUBLE',
    convert: function(val, protocol) {
        return typeof(val)=='undefined' ? null : parseFloat(val);
    }
};

Types[cons.field.TYPE_NULL] = {
    id: cons.field.TYPE_NULL,
    name: 'NULL',
    convert: function(val, protocol) {
        return null;
    }
};

Types[cons.field.TYPE_TIMESTAMP] = {
    id: cons.field.TYPE_TIMESTAMP,
    name: 'TIMESTAMP',
    convert: function(val, protocol) {
        return typeof(val)=='undefined' ? null : val; // TODO
    }
};

Types[cons.field.TYPE_LONGLONG] = {
    id: cons.field.TYPE_LONGLONG,
    name: 'LONGLONG',
    convert: function(val, protocol) {
        return typeof(val)=='undefined' ? null : parseInt(val);
    }
};

Types[cons.field.TYPE_INT24] = {
    id: cons.field.TYPE_INT24,
    name: 'INT24',
    convert: function(val, protocol) {
        return typeof(val)=='undefined' ? null : parseInt(val);
    }
};

Types[cons.field.TYPE_DATE] = {
    id: cons.field.TYPE_DATE,
    name: 'DATE',
    convert: function(val, protocol) {
        return typeof(val)=='undefined' ? null : val; // TODO
    }
};

Types[cons.field.TYPE_TIME] = {
    id: cons.field.TYPE_TIME,
    name: 'TIME',
    convert: function(val, protocol) {
        return typeof(val)=='undefined' ? null : val; // TODO
    }
};

Types[cons.field.TYPE_DATETIME] = {
    id: cons.field.TYPE_DATETIME,
    name: 'DATETIME',
    convert: function(val, protocol) {
        return typeof(val)=='undefined' ? null : val; // TODO
    }
};

Types[cons.field.TYPE_YEAR] = {
    id: cons.field.TYPE_YEAR,
    name: 'YEAR',
    convert: function(val, protocol) {
        return typeof(val)=='undefined' ? null : parseInt(val);
    }
};

Types[cons.field.TYPE_NEWDATE] = {
    id: cons.field.TYPE_NEWDATE,
    name: 'NEWDATE',
    convert: function(val, protocol) {
        return typeof(val)=='undefined' ? null : val; // TODO
    }
};

Types[cons.field.TYPE_VARCHAR] = {
    id: cons.field.TYPE_VARCHAR,
    name: 'VARCHAR',
    convert: function(val, protocol) {
        return typeof(val)=='undefined' ? null : protocol.charset.convertFromBytes(val);
    }
};

Types[cons.field.TYPE_BIT] = {
    id: cons.field.TYPE_BIT,
    name: 'BIT',
    convert: function(val, protocol) {
        return typeof(val)=='undefined' ? null : val;
    }
};

Types[cons.field.TYPE_NEWDECIMAL] = {
    id: cons.field.TYPE_NEWDECIMAL,
    name: 'NEWDECIMAL',
    convert: function(val, protocol) {
        return typeof(val)=='undefined' ? null : parseFloat(val);
    }
};

Types[cons.field.TYPE_ENUM] = {
    id: cons.field.TYPE_ENUM,
    name: 'ENUM',
    convert: function(val, protocol) {
        return typeof(val)=='undefined' ? null : protocol.charset.convertFromBytes(val);
    }
};

Types[cons.field.TYPE_SET] = {
    id: cons.field.TYPE_SET,
    name: 'SET',
    convert: function(val, protocol) {
        if(typeof(val)=='undefined') return undefined;
        return val=='' ? [] : protocol.charset.convertFromBytes(val.split(','));
    }
};

Types[cons.field.TYPE_TINY_BLOB] = {
    id: cons.field.TYPE_TINY_BLOB,
    name: 'TINY_BLOB',
    convert: function(val, protocol) {
        return typeof(val)=='undefined' ? null : val;
    }
};

Types[cons.field.TYPE_MEDIUM_BLOB] = {
    id: cons.field.TYPE_MEDIUM_BLOB,
    name: 'MEDIUM_BLOB',
    convert: function(val, protocol) {
        return typeof(val)=='undefined' ? null : val;
    }
};

Types[cons.field.TYPE_LONG_BLOB] = {
    id: cons.field.TYPE_LONG_BLOB,
    name: 'LONG_BLOB',
    convert: function(val, protocol) {
        return typeof(val)=='undefined' ? null : val;
    }
};

Types[cons.field.TYPE_BLOB] = {
    id: cons.field.TYPE_BLOB,
    name: 'BLOB',
    convert: function(val, protocol) {
        return typeof(val)=='undefined' ? null : val;
    }
};

Types[cons.field.TYPE_VAR_STRING] = {
    id: cons.field.TYPE_VAR_STRING,
    name: 'VAR_STRING',
    convert: function(val, protocol) {
        return typeof(val)=='undefined' ? null : protocol.charset.convertFromBytes(val);
    }
};

Types[cons.field.TYPE_STRING] = {
    id: cons.field.TYPE_STRING,
    name: 'STRING',
    convert: function(val, protocol) {
        return typeof(val)=='undefined' ? null : protocol.charset.convertFromBytes(val);
    }
};

Types[cons.field.TYPE_GEOMETRY] = {
    id: cons.field.TYPE_GEOMETRY,
    name: 'GEOMETRY',
    convert: function(val, protocol) {
        return typeof(val)=='undefined' ? null : val;
    }
};

exports.Types = Types;