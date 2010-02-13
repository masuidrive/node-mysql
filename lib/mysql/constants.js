exports.COM_SLEEP               = 0;
exports.COM_QUIT                = 1;
exports.COM_INIT_DB             = 2;
exports.COM_QUERY               = 3;
exports.COM_FIELD_LIST          = 4;
exports.COM_CREATE_DB           = 5;
exports.COM_DROP_DB             = 6;
exports.COM_REFRESH             = 7;
exports.COM_SHUTDOWN            = 8;
exports.COM_STATISTICS          = 9;
exports.COM_PROCESS_INFO        = 10;
exports.COM_CONNECT             = 11;
exports.COM_PROCESS_KILL        = 12;
exports.COM_DEBUG               = 13;
exports.COM_PING                = 14;
exports.COM_TIME                = 15;
exports.COM_DELAYED_INSERT      = 16;
exports.COM_CHANGE_USER         = 17;
exports.COM_BINLOG_DUMP         = 18;
exports.COM_TABLE_DUMP          = 19;
exports.COM_CONNECT_OUT         = 20;
exports.COM_REGISTER_SLAVE      = 21;
exports.COM_STMT_PREPARE        = 22;
exports.COM_STMT_EXECUTE        = 23;
exports.COM_STMT_SEND_LONG_DATA = 24;
exports.COM_STMT_CLOSE          = 25;
exports.COM_STMT_RESET          = 26;
exports.COM_SET_OPTION          = 27;
exports.COM_STMT_FETCH          = 28;

// Client flag
exports.CLIENT_LONG_PASSWORD     = 1;         // new more secure passwords
exports.CLIENT_FOUND_ROWS        = 1 << 1;    // Found instead of affected rows
exports.CLIENT_LONG_FLAG         = 1 << 2;    // Get all column flags
exports.CLIENT_CONNECT_WITH_DB   = 1 << 3;    // One can specify db on connect
exports.CLIENT_NO_SCHEMA         = 1 << 4;    // Don't allow database.table.column
exports.CLIENT_COMPRESS          = 1 << 5;    // Can use compression protocol
exports.CLIENT_ODBC              = 1 << 6;    // Odbc client
exports.CLIENT_LOCAL_FILES       = 1 << 7;    // Can use LOAD DATA LOCAL
exports.CLIENT_IGNORE_SPACE      = 1 << 8;    // Ignore spaces before '('
exports.CLIENT_PROTOCOL_41       = 1 << 9;    // New 4.1 protocol
exports.CLIENT_INTERACTIVE       = 1 << 10;   // This is an interactive client
exports.CLIENT_SSL               = 1 << 11;   // Switch to SSL after handshake
exports.CLIENT_IGNORE_SIGPIPE    = 1 << 12;   // IGNORE sigpipes
exports.CLIENT_TRANSACTIONS      = 1 << 13;   // Client knows about transactions
exports.CLIENT_RESERVED          = 1 << 14;   // Old flag for 4.1 protocol
exports.CLIENT_SECURE_CONNECTION = 1 << 15;   // New 4.1 authentication
exports.CLIENT_MULTI_STATEMENTS  = 1 << 16;   // Enable/disable multi-stmt support
exports.CLIENT_MULTI_RESULTS     = 1 << 17;   // Enable/disable multi-results

// Connection Option
exports.OPT_CONNECT_TIMEOUT         = 0;
exports.OPT_COMPRESS                = 1;
exports.OPT_NAMED_PIPE              = 2;
exports.INIT_COMMAND                = 3;
exports.READ_DEFAULT_FILE           = 4;
exports.READ_DEFAULT_GROUP          = 5;
exports.SET_CHARSET_DIR             = 6;
exports.SET_CHARSET_NAME            = 7;
exports.OPT_LOCAL_INFILE            = 8;
exports.OPT_PROTOCOL                = 9;
exports.SHARED_MEMORY_BASE_NAME     = 10;
exports.OPT_READ_TIMEOUT            = 11;
exports.OPT_WRITE_TIMEOUT           = 12;
exports.OPT_USE_RESULT              = 13;
exports.OPT_USE_REMOTE_CONNECTION   = 14;
exports.OPT_USE_EMBEDDED_CONNECTION = 15;
exports.OPT_GUESS_CONNECTION        = 16;
exports.SET_CLIENT_IP               = 17;
exports.SECURE_AUTH                 = 18;
exports.REPORT_DATA_TRUNCATION      = 19;
exports.OPT_RECONNECT               = 20;
exports.OPT_SSL_VERIFY_SERVER_CERT  = 21;

// Server Option;
exports.OPTION_MULTI_STATEMENTS_ON  = 0;
exports.OPTION_MULTI_STATEMENTS_OFF = 1;

// Server Status
exports.SERVER_STATUS_IN_TRANS             = 1;
exports.SERVER_STATUS_AUTOCOMMIT           = 1 << 1;
exports.SERVER_MORE_RESULTS_EXISTS         = 1 << 3;
exports.SERVER_QUERY_NO_GOOD_INDEX_USED    = 1 << 4;
exports.SERVER_QUERY_NO_INDEX_USED         = 1 << 5;
exports.SERVER_STATUS_CURSOR_EXISTS        = 1 << 6;
exports.SERVER_STATUS_LAST_ROW_SENT        = 1 << 7;
exports.SERVER_STATUS_DB_DROPPED           = 1 << 8;
exports.SERVER_STATUS_NO_BACKSLASH_ESCAPES = 1 << 9;

// Refresh parameter
exports.REFRESH_GRANT     = 1;
exports.REFRESH_LOG       = 1 << 1;
exports.REFRESH_TABLES    = 1 << 2;
exports.REFRESH_HOSTS     = 1 << 3;
exports.REFRESH_STATUS    = 1 << 4;
exports.REFRESH_THREADS   = 1 << 5;
exports.REFRESH_SLAVE     = 1 << 6;
exports.REFRESH_MASTER    = 1 << 7;
exports.REFRESH_READ_LOCK = 1 << 14;
exports.REFRESH_FAST      = 1 << 15;

exports.Field = {
  // Field type
  TYPE_DECIMAL     : 0,
  TYPE_TINY        : 1,
  TYPE_SHORT       : 2,
  TYPE_LONG        : 3,
  TYPE_FLOAT       : 4,
  TYPE_DOUBLE      : 5,
  TYPE_NULL        : 6,
  TYPE_TIMESTAMP   : 7,
  TYPE_LONGLONG    : 8,
  TYPE_INT24       : 9,
  TYPE_DATE        : 10,
  TYPE_TIME        : 11,
  TYPE_DATETIME    : 12,
  TYPE_YEAR        : 13,
  TYPE_NEWDATE     : 14,
  TYPE_VARCHAR     : 15,
  TYPE_BIT         : 16,
  TYPE_NEWDECIMAL  : 246,
  TYPE_ENUM        : 247,
  TYPE_SET         : 248,
  TYPE_TINY_BLOB   : 249,
  TYPE_MEDIUM_BLOB : 250,
  TYPE_LONG_BLOB   : 251,
  TYPE_BLOB        : 252,
  TYPE_VAR_STRING  : 253,
  TYPE_STRING      : 254,
  TYPE_GEOMETRY    : 255,
  TYPE_CHAR        : 1, // TYPE_TINY
  TYPE_INTERVAL    : 247, // TYPE_ENUM

  // Flag
  NOT_NULL_FLAG       : 1,
  PRI_KEY_FLAG        : 2,
  UNIQUE_KEY_FLAG     : 4,
  MULTIPLE_KEY_FLAG   : 8,
  BLOB_FLAG           : 16,
  UNSIGNED_FLAG       : 32,
  ZEROFILL_FLAG       : 64,
  BINARY_FLAG         : 128,
  ENUM_FLAG           : 256,
  AUTO_INCREMENT_FLAG : 512,
  TIMESTAMP_FLAG      : 1024,
  SET_FLAG            : 2048,
  NUM_FLAG            : 32768,
  PART_KEY_FLAG       : 16384,
  GROUP_FLAG          : 32768,
  UNIQUE_FLAG         : 65536,
  BINCMP_FLAG         : 131072
};

exports.Stmt = {
  // Cursor type
  CURSOR_TYPE_NO_CURSOR : 0,
  CURSOR_TYPE_READ_ONLY : 1
};


/*
node-mysql
A node.js interface for MySQL

Author: masuidrive <masui@masuidrive.jp>
License: MIT License
Copyright (c) Yuichiro MASUI

# Original:
# http://github.com/tmtm/ruby-mysql
# Copyright (C) 2009-2010 TOMITA Masahiro
# mailto:tommy@tmtm.org
# License: Ruby's
*/
