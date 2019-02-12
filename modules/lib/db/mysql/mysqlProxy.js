'use strict';

var async = require('async'),
    mysql = require('mysql');

module.exports = function (datasource) {
    if (!datasource) {
        throw new Error('datasouce is null');
    }
    var mysqlProxy = new MysqlProxy(datasource);
    return mysqlProxy;
};

function MysqlProxy(datasource) {
    this.pool = mysql.createPool(datasource);
}

MysqlProxy.prototype = {

    execSql: function (sql, value, callback) {
        getConnection(this.pool, function (err, connection) {
            if (err) {
                closeConnection(connection);
                callback(err);
                return;
            }
            connection.query(sql, value, function (err, result) {
                if (err) {
                    closeConnection(connection);
                    callback(err, result);
                    return;
                }
                closeConnection(connection);
                callback(null, result);
            });
        });
    },

    batchExecSql: function (sqlArray, callback) {
        getConnection(this.pool, function (err, connection) {
            connection.beginTransaction(function (err) {
                if (err) {
                    closeConnection(connection);
                    callback(err);
                }
                async.eachLimit(sqlArray, 10, function (item, callback) {
                    connection.query(item.sql, item.value, function (error) {
                        if (error) {
                            callback(error);
                            return;
                        }
                        callback(null);
                    });
                }, function (error) {
                    if (error) {
                        connection.rollback(function () {
                            closeConnection(connection);
                            callback(error);
                        });
                    } else {
                        connection.commit(function (err) {
                            if (err) {
                                connection.rollback(function () {
                                    closeConnection(connection);
                                    callback(err);
                                });
                            } else {
                                closeConnection(connection);
                                callback(null);
                            }
                        });
                    }
                });
            });
        });
    }

};

function getConnection(pool, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            callback(err);
            return;
        }
        connection.config.queryFormat = function (query, values) {
            if (!values) return query;
            return query.replace(/\:(\w+)/g, function (txt, key) {
                if (values.hasOwnProperty(key)) {
                    return this.escape(values[key]);
                }
                return txt;
            }.bind(this));
        };
        callback(null, connection);
    });
}

function closeConnection(connection) {
    try {
        connection.release();
    } catch (e) {
    }
}
