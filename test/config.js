var merge = function(obj1, obj2) {
    var ret = {};
    for (var property in obj1)
	ret[property] = obj1[property];
    for (var property in obj2)
	ret[property] = obj2[property];
    return ret;
}

var mysql = {
    hostname: '127.0.0.1',
    port: 3306,
    
    username: 'nodejs_mysql',
    password: 'nodejs_mysql',
    database: 'nodejs_mysql'
};

exports.mysql_ignore_account = merge(mysql, {
    username: 'nodejs_foobar'
});

exports.mysql_ignore_password = merge(mysql, {
    password: 'nodejs_foobar'
});

exports.mysql_ignore_port = merge(mysql, {
    port: 1
});

exports.mysql = mysql;
