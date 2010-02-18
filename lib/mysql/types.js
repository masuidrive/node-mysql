var cons = require('./constants');

var Types = {};
Types[cons.field.TYPE_DECIMAL] = {
    name: 'DECIMAL',
    convert: function(val) {
        return typeof(val)=='undefined' ? null : parseFloat(val);
    }
};
    
Types[cons.field.TYPE_TINY] = {
    name: 'TINY',
    convert: function(val) {
        return typeof(val)=='undefined' ? null : parseInt(val);
    }
};

Types[cons.field.TYPE_SHORT] = {
    name: 'SHORT',
    convert: function(val) {
        return typeof(val)=='undefined' ? null : parseInt(val);
    }
};

Types[cons.field.TYPE_LONG] = {
    name: 'LONG',
    convert: function(val) {
        return typeof(val)=='undefined' ? null : parseInt(val);
    }
};

Types[cons.field.TYPE_FLOAT] = {
    name: 'FLOAT',
    convert: function(val) {
        return typeof(val)=='undefined' ? null : parseFloat(val);
    }
};

Types[cons.field.TYPE_DOUBLE] = {
    name: 'DOUBLE',
    convert: function(val) {
        return typeof(val)=='undefined' ? null : parseFloat(val);
    }
};

Types[cons.field.TYPE_NULL] = {
    name: 'NULL',
    convert: function(val) {
        return null;
    }
};

Types[cons.field.TYPE_TIMESTAMP] = {
    name: 'TIMESTAMP',
    convert: function(val) {
        return typeof(val)=='undefined' ? null : val; // TODO
    }
};

Types[cons.field.TYPE_LONGLONG] = {
    name: 'LONGLONG',
    convert: function(val) {
        return typeof(val)=='undefined' ? null : parseInt(val);
    }
};

Types[cons.field.TYPE_INT24] = {
    name: 'INT24',
    convert: function(val) {
        return typeof(val)=='undefined' ? null : parseInt(val);
    }
};

Types[cons.field.TYPE_DATE] = {
    name: 'DATE',
    convert: function(val) {
        return typeof(val)=='undefined' ? null : val; // TODO
    }
};

Types[cons.field.TYPE_TIME] = {
    name: 'TIME',
    convert: function(val) {
        return typeof(val)=='undefined' ? null : val; // TODO
    }
};

Types[cons.field.TYPE_DATETIME] = {
    name: 'DATETIME',
    convert: function(val) {
        return typeof(val)=='undefined' ? null : val; // TODO
    }
};

Types[cons.field.TYPE_YEAR] = {
    name: 'YEAR',
    convert: function(val) {
        return typeof(val)=='undefined' ? null : parseInt(val);
    }
};

Types[cons.field.TYPE_NEWDATE] = {
    name: 'NEWDATE',
    convert: function(val) {
        return typeof(val)=='undefined' ? null : val; // TODO
    }
};

Types[cons.field.TYPE_VARCHAR] = {
    name: 'VARCHAR',
    convert: function(val) {
        return typeof(val)=='undefined' ? null : val;
    }
};

Types[cons.field.TYPE_BIT] = {
    name: 'BIT',
    convert: function(val) {
        return typeof(val)=='undefined' ? null : val;
    }
};

Types[cons.field.TYPE_NEWDECIMAL] = {
    name: 'NEWDECIMAL',
    convert: function(val) {
        return typeof(val)=='undefined' ? null : parseFloat(val);
    }
};

Types[cons.field.TYPE_ENUM] = {
    name: 'ENUM',
    convert: function(val) {
        return typeof(val)=='undefined' ? null : val;
    }
};

Types[cons.field.TYPE_SET] = {
    name: 'SET',
    convert: function(val) {
        if(typeof(val)=='undefined') return undefined;
        return val=='' ? val.split(',') : [];
    }
};

Types[cons.field.TYPE_TINY_BLOB] = {
    name: 'TINY_BLOB',
    convert: function(val) {
        return typeof(val)=='undefined' ? null : val;
    }
};

Types[cons.field.TYPE_MEDIUM_BLOB] = {
    name: 'MEDIUM_BLOB',
    convert: function(val) {
        return typeof(val)=='undefined' ? null : val;
    }
};

Types[cons.field.TYPE_LONG_BLOB] = {
    name: 'LONG_BLOB',
    convert: function(val) {
        return typeof(val)=='undefined' ? null : val;
    }
};

Types[cons.field.TYPE_BLOB] = {
    name: 'BLOB',
    convert: function(val) {
        return typeof(val)=='undefined' ? null : val;
    }
};

Types[cons.field.TYPE_VAR_STRING] = {
    name: 'VAR_STRING',
    convert: function(val) {
        return typeof(val)=='undefined' ? null : val;
    }
};

Types[cons.field.TYPE_STRING] = {
    name: 'STRING',
    convert: function(val) {
        return typeof(val)=='undefined' ? null : val;
    }
};

Types[cons.field.TYPE_GEOMETRY] = {
    name: 'GEOMETRY',
    convert: function(val) {
        return typeof(val)=='undefined' ? null : val;
    }
};

exports.Types = Types;