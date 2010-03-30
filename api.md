# mysql-node API reference
## Common
### callback
### errback

## Connection

### Events

* connect 
* close
* authorized
* authorize error


### Connection(hostname, username, password, dbname, port)
 It return Connectino object. It not connect to mysqld. 

### Connection.quote(string)
 quote string for SQL.

### Connection.prototype.connect(callback, errback)
 connect to mysqld.

### Connection.prototype.close()
 close connection.

### Connection.prototype.timeout(msec)
 set timeout.

### Connection.prototype.autocommit(flag, callback, errback)
 set/reset autocommit flag.

### Connection.prototype.query(sql, callback, errback)
 do query and return Result object.

### Connection.prototype.extract_placeholder(sql)


### Connection.prototype.set_server_option(opt)


### Connection.prototype.get_result(fields)


### Connection.prototype.has_more_results()
 returns true if more results exist from the currently executed query.

### Connection.prototype.next_result(callback, errback)
 


### Connection.prototype.prepare(str, callback, errback)
 execute prepared statement and return Stmt object.



## Result
Result set.

### Result.prototype.fetch_all()


### Result.prototype.toHash(row)


### Result.prototype.fields


### Result.prototype.fieldname_with_table





## Stmt
Prepared statement.

### Stmt(rotocol, charset)


### Stmt.prototype.close()


### Stmt.prototype.prepare(query, callback, errback)


### Stmt.prototype.execute(args, callback, errback)




## Field
Field information.

### Field.prototype.is_num()


### Field.prototype.is_not_null()


### Field.prototype.is_pri_key()


