// Result:
// Result set
var sys = require('sys');
var events = require('events');
process.mixin(require('./common'));

// Result set
var ResultBase = function(fields) {
    // include Enumerable
    this.fields = fields;
    this.field_index = 0; // index of field
    this.records = [];    // all records
    this.index = 0;       // index of record
    this.fieldname_with_table = undefined;
    this.fetched_record = undefined;
}
ResultBase.prototype = Array.prototype;
exports.ResultBase = ResultBase;

// Return current record.
ResultBase.prototype.fetch = function() {
    this.fetched_record = undefined;
    if(this.index >= this.length) return undefined;

    var rec = this[this.index];
    this.index += 1;
    this.fetched_record = rec;
    return rec;
}

/*
    # Return data of current record as Hash.
    # The hash key is field name.
    # === Argument
    # with_table :: if true, hash key is "table_name.field_name".
    # === Return
    # [Array of Hash] record data
    def fetch_hash(with_table=nil)
      row = fetch
      return nil unless row
      if with_table and @fieldname_with_table.nil?
        @fieldname_with_table = @fields.map{|f| [f.table, f.name].join(".")}
      end
      ret = {}
      @fields.each_index do |i|
        fname = with_table ? @fieldname_with_table[i] : @fields[i].name
        ret[fname] = row[i]
      end
      ret
    end

    # Iterate block with record.
    # === Block parameter
    # [Array] record data
    # === Return
    # self. If block is not specified, this returns Enumerator.
    def each(&block)
      return enum_for(:each) unless block
      while rec = fetch
        block.call rec
      end
      self
    end

    # Iterate block with record as Hash.
    # === Argument
    # with_table :: if true, hash key is "table_name.field_name".
    # === Block parameter
    # [Array of Hash] record data
    # === Return
    # self. If block is not specified, this returns Enumerator.
    def each_hash(with_table=nil, &block)
      return enum_for(:each_hash, with_table) unless block
      while rec = fetch_hash(with_table)
        block.call rec
      end
      self
    end
*/

// Set record position
ResultBase.prototype.data_seek = function(n) {
    this.index = n;
    return this;
}

// Return current record position
ResultBase.prototype.row_tell = function() {
    return this.index;
}

// Set current position of record
ResultBase.prototype.row_seek = function(n) {
    var ret = this.index;
    this.index = n;
    return ret;
}

var ResultRow = function(result) {
    this.result = result;
}
ResultRow.prototype = Array.prototype;
exports.ResultRow = ResultRow;

ResultRow.prototype.toHash = function() {
    var result, name, field;
    result = {};
    for(var i = 0; i<this.result.fields.length; ++i) {
	field = this.result.fields[i];
	name = (field.table?field.table+".":"")+field.name;
	result[name] = this[i];
    }
    return result;
}

var Result = function(fields, protocol) {
    ResultBase.apply(this, [fields]);
    this.protocol = protocol;
}
Result.prototype = ResultBase.prototype;
exports.Result = Result;

Result.prototype.fetch_all = function() {
    var promise = this.protocol.retr_all_records(this.fields,
	scope(this, function() {    // init
	    return new ResultRow(this);
	}),
	scope(this, function(rec) { // each
            this.push(rec);
	}),
	scope(this, function() {    // result
	    return this;
	}));
    return promise;
}

/*
  # Result set for simple query
  class Result < ResultBase
    def initialize(fields, protocol=nil)
      super fields
      return unless protocol
      @records = protocol.retr_all_records @fields
      # for Field#max_length
      @records.each do |rec|
        rec.zip(fields) do |v, f|
          f.max_length = [v ? v.length : 0, f.max_length || 0].max
        end
      end
    end

    # Return current field
    # === Return
    # [Mysql::Field] field object
    def fetch_field
      return nil if @field_index >= @fields.length
      ret = @fields[@field_index]
      @field_index += 1
      ret
    end

    # Return current position of field
    # === Return
    # [Integer] field position
    def field_tell
      @field_index
    end

    # Set field position
    # === Argument
    # n :: [Integer] field index
    # === Return
    # [Integer] previous position
    def field_seek(n)
      ret = @field_index
      @field_index = n
      ret
    end

    # Return field
    # === Argument
    # n :: [Integer] field index
    # === Return
    # [Mysql::Field] field
    def fetch_field_direct(n)
      raise ClientError, "invalid argument: #{n}" if n < 0 or n >= @fields.length
      @fields[n]
    end

    # Return all fields
    # === Return
    # [Array of Mysql::Field] all fields
    def fetch_fields
      @fields
    end

    # Return length of each fields
    # === Return
    # [Array of Integer] length of each fields
    def fetch_lengths
      return nil unless @fetched_record
      @fetched_record.map{|c|c.nil? ? 0 : c.length}
    end

    # === Return
    # [Integer] number of fields
    def num_fields
      @fields.size
    end
  end
*/


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
