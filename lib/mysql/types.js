var cons = require('./constants');

var Types = {
    0: {
	name: 'DECIMAL',
	convert: function(val) {
	    return typeof(val)=='undefined' ? null : parseFloat(val);
	}
    },
    
    1: {
	name: 'TINY',
	convert: function(val) {
	    return typeof(val)=='undefined' ? null : parseInt(val);
	}
    },

    2: {
	name: 'SHORT',
	convert: function(val) {
	    return typeof(val)=='undefined' ? null : parseInt(val);
	}
    },

    3: {
	name: 'LONG',
	convert: function(val) {
	    return typeof(val)=='undefined' ? null : parseInt(val);
	}
    },

    4: {
	name: 'FLOAT',
	convert: function(val) {
	    return typeof(val)=='undefined' ? null : parseFloat(val);
	}
    },

    5: {
	name: 'DOUBLE',
	convert: function(val) {
	    return typeof(val)=='undefined' ? null : parseFloat(val);
	}
    },

    6: {
	name: 'NULL',
	convert: function(val) {
	    return null;
	}
    },

    7: {
	name: 'TIMESTAMP',
	convert: function(val) {
	    return typeof(val)=='undefined' ? null : val; // TODO
	}
    },

    8: {
	name: 'LONGLONG',
	convert: function(val) {
	    return typeof(val)=='undefined' ? null : parseInt(val);
	}
    },

    9: {
	name: 'INT24',
	convert: function(val) {
	    return typeof(val)=='undefined' ? null : parseInt(val);
	}
    },

    10: {
	name: 'DATE',
	convert: function(val) {
	    return typeof(val)=='undefined' ? null : val; // TODO
	}
    },

    11: {
	name: 'TIME',
	convert: function(val) {
	    return typeof(val)=='undefined' ? null : val; // TODO
	}
    },

    12: {
	name: 'DATETIME',
	convert: function(val) {
	    return typeof(val)=='undefined' ? null : val; // TODO
	}
    },

    13: {
	name: 'YEAR',
	convert: function(val) {
	    return typeof(val)=='undefined' ? null : parseInt(val);
	}
    },

    14: {
	name: 'NEWDATE',
	convert: function(val) {
	    return typeof(val)=='undefined' ? null : val; // TODO
	}
    },

    15: {
	name: 'VARCHAR',
	convert: function(val) {
	    return typeof(val)=='undefined' ? null : val;
	}
    },

    16: {
	name: 'BIT',
	convert: function(val) {
	    return typeof(val)=='undefined' ? null : val;
	}
    },

    246: {
	name: 'NEWDECIMAL',
	convert: function(val) {
	    return typeof(val)=='undefined' ? null : parseFloat(val);
	}
    },

    247: {
	name: 'ENUM',
	convert: function(val) {
	    return typeof(val)=='undefined' ? null : val;
	}
    },

    248: {
	name: 'SET',
	convert: function(val) {
	    if(typeof(val)=='undefined') return undefined;
	    return val=='' ? val.split(',') : [];
	}
    },

    249: {
	name: 'TINY_BLOB',
	convert: function(val) {
	    return typeof(val)=='undefined' ? null : val;
	}
    },

    250: {
	name: 'MEDIUM_BLOB',
	convert: function(val) {
	    return typeof(val)=='undefined' ? null : val;
	}
    },

    251: {
	name: 'LONG_BLOB',
	convert: function(val) {
	    return typeof(val)=='undefined' ? null : val;
	}
    },

    252: {
	name: 'BLOB',
	convert: function(val) {
	    return typeof(val)=='undefined' ? null : val;
	}
    },

    253: {
	name: 'VAR_STRING',
	convert: function(val) {
	    return typeof(val)=='undefined' ? null : val;
	}
    },

    254: {
	name: 'STRING',
	convert: function(val) {
	    return typeof(val)=='undefined' ? null : val;
	}
    },

    255: {
	name: 'GEOMETRY',
	convert: function(val) {
	    return typeof(val)=='undefined' ? null : val;
	}
    }
};
exports.Types = Types;