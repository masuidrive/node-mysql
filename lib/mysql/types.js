var constants = require('./constants');

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
Types[constants.field.TYPE_DECIMAL] = {
    id: constants.field.TYPE_DECIMAL,
    name: 'DECIMAL',
    convert: function(val, charset, field) {
        return typeof(val)=='undefined' ? null : parseFloat(val);
    }
};
    
Types[constants.field.TYPE_TINY] = {
    id: constants.field.TYPE_TINY,
    name: 'TINY',
    convert: function(val, charset, field) {
        return typeof(val)=='undefined' ? null : parseInt(val);
    }
};

Types[constants.field.TYPE_SHORT] = {
    id: constants.field.TYPE_SHORT,
    name: 'SHORT',
    convert: function(val, charset, field) {
        return typeof(val)=='undefined' ? null : parseInt(val);
    }
};

Types[constants.field.TYPE_LONG] = {
    id: constants.field.TYPE_LONG,
    name: 'LONG',
    convert: function(val, charset, field) {
        return typeof(val)=='undefined' ? null : parseInt(val);
    }
};

Types[constants.field.TYPE_FLOAT] = {
    id: constants.field.TYPE_FLOAT,
    name: 'FLOAT',
    convert: function(val, charset, field) {
        return typeof(val)=='undefined' ? null : parseFloat(val);
    }
};

Types[constants.field.TYPE_DOUBLE] = {
    id: constants.field.TYPE_DOUBLE,
    name: 'DOUBLE',
    convert: function(val, charset, field) {
        return typeof(val)=='undefined' ? null : parseFloat(val);
    }
};

Types[constants.field.TYPE_NULL] = {
    id: constants.field.TYPE_NULL,
    name: 'NULL',
    convert: function(val, charset, field) {
        return null;
    }
};

Types[constants.field.TYPE_TIMESTAMP] = {
    id: constants.field.TYPE_TIMESTAMP,
    name: 'TIMESTAMP',
    convert: function(val, charset, field) {
        return typeof(val)=='undefined' ? null : val; // TODO
    }
};

Types[constants.field.TYPE_LONGLONG] = {
    id: constants.field.TYPE_LONGLONG,
    name: 'LONGLONG',
    convert: function(val, charset, field) {
        return typeof(val)=='undefined' ? null : parseInt(val);
    }
};

Types[constants.field.TYPE_INT24] = {
    id: constants.field.TYPE_INT24,
    name: 'INT24',
    convert: function(val, charset, field) {
        return typeof(val)=='undefined' ? null : parseInt(val);
    }
};

Types[constants.field.TYPE_DATE] = {
    id: constants.field.TYPE_DATE,
    name: 'DATE',
    convert: function(val, charset, field) {
        return typeof(val)=='undefined' ? null : val; // TODO
    }
};

Types[constants.field.TYPE_TIME] = {
    id: constants.field.TYPE_TIME,
    name: 'TIME',
    convert: function(val, charset, field) {
        return typeof(val)=='undefined' ? null : val; // TODO
    }
};

Types[constants.field.TYPE_DATETIME] = {
    id: constants.field.TYPE_DATETIME,
    name: 'DATETIME',
    convert: function(val, charset, field) {
        return typeof(val)=='undefined' ? null : val; // TODO
    }
};

Types[constants.field.TYPE_YEAR] = {
    id: constants.field.TYPE_YEAR,
    name: 'YEAR',
    convert: function(val, charset, field) {
        return typeof(val)=='undefined' ? null : parseInt(val);
    }
};

Types[constants.field.TYPE_NEWDATE] = {
    id: constants.field.TYPE_NEWDATE,
    name: 'NEWDATE',
    convert: function(val, charset, field) {
        return typeof(val)=='undefined' ? null : val; // TODO
    }
};

Types[constants.field.TYPE_VARCHAR] = {
    id: constants.field.TYPE_VARCHAR,
    name: 'VARCHAR',
    convert: function(val, charset, field) {
        return typeof(val)=='undefined' ? null : charset.convertFromBytes(val);
    }
};

Types[constants.field.TYPE_BIT] = {
    id: constants.field.TYPE_BIT,
    name: 'BIT',
    convert: function(val, charset, field) {
        return typeof(val)=='undefined' ? null : val;
    }
};

Types[constants.field.TYPE_NEWDECIMAL] = {
    id: constants.field.TYPE_NEWDECIMAL,
    name: 'NEWDECIMAL',
    convert: function(val, charset, field) {
        return typeof(val)=='undefined' ? null : parseFloat(val);
    }
};

Types[constants.field.TYPE_ENUM] = {
    id: constants.field.TYPE_ENUM,
    name: 'ENUM',
    convert: function(val, charset, field) {
        return typeof(val)=='undefined' ? null : charset.convertFromBytes(val);
    }
};

Types[constants.field.TYPE_SET] = {
    id: constants.field.TYPE_SET,
    name: 'SET',
    convert: function(val, charset, field) {
        if(typeof(val)=='undefined') return undefined;
        return val=='' ? [] : charset.convertFromBytes(val.split(','));
    }
};

Types[constants.field.TYPE_TINY_BLOB] = {
    id: constants.field.TYPE_TINY_BLOB,
    name: 'TINY_BLOB',
    convert: function(val, charset, field) {
	if(field.flags & constants.field.BINARY_FLAG) return val;
        return typeof(val)=='undefined' ? null : charset.convertFromBytes(val);
    }
};

Types[constants.field.TYPE_MEDIUM_BLOB] = {
    id: constants.field.TYPE_MEDIUM_BLOB,
    name: 'MEDIUM_BLOB',
    convert: function(val, charset, field) {
	if(field.flags & constants.field.BINARY_FLAG) return val;
        return typeof(val)=='undefined' ? null : charset.convertFromBytes(val);
    }
};

Types[constants.field.TYPE_LONG_BLOB] = {
    id: constants.field.TYPE_LONG_BLOB,
    name: 'LONG_BLOB',
    convert: function(val, charset, field) {
	if(field.flags & constants.field.BINARY_FLAG) return val;
        return typeof(val)=='undefined' ? null : charset.convertFromBytes(val);
    }
};

Types[constants.field.TYPE_BLOB] = {
    id: constants.field.TYPE_BLOB,
    name: 'BLOB',
    convert: function(val, charset, field) {
	if(field.flags & constants.field.BINARY_FLAG) return val;
        return typeof(val)=='undefined' ? null : charset.convertFromBytes(val);
    }
};

Types[constants.field.TYPE_VAR_STRING] = {
    id: constants.field.TYPE_VAR_STRING,
    name: 'VAR_STRING',
    convert: function(val, charset, field) {
        return typeof(val)=='undefined' ? null : charset.convertFromBytes(val);
    }
};

Types[constants.field.TYPE_STRING] = {
    id: constants.field.TYPE_STRING,
    name: 'STRING',
    convert: function(val, charset, field) {
        return typeof(val)=='undefined' ? null : charset.convertFromBytes(val);
    }
};

Types[constants.field.TYPE_GEOMETRY] = {
    id: constants.field.TYPE_GEOMETRY,
    name: 'GEOMETRY',
    convert: function(val, charset, field) {
        return typeof(val)=='undefined' ? null : val;
    }
};

exports.Types = Types;