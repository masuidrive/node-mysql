// Result:
// Result set
var sys = require('sys');
var events = require('events');
process.mixin(require('./common'));

// Result one row
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
	name = (this.result.fieldname_with_table && field.table?field.table+".":"")+field.name;
	result[name] = this[i];
    }
    return result;
}


// Result set
var ResultBase = function(fields) {
    // include Enumerable
    this.fields = fields;
    this.fieldname_with_table = true;
}
ResultBase.prototype = Array.prototype;
exports.ResultBase = ResultBase;


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
