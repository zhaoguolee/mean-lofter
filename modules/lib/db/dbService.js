/**
 * Created by zhao on 16/4/5.
 */

var _ = require('lodash');
var path = require('path');
var uuid = require('uuid');
var config = require(path.resolve('./config/config'));
var mysqlProxy = require('./mysql/mysqlProxy')(config.mysql.default);

module.exports.execMysql = function (sql, option, callback) {
    mysqlProxy.execSql(sql, option, callback);
};

module.exports.batchExecMysql = function (sqlArray, callback) {
    mysqlProxy.batchExecSql(sqlArray, callback);
};

module.exports.insert = function (tableName, value, callback) {
    if (value.id == null) {
        value.id = uuid.v1();
    }
    var sql = 'insert into ' + tableName + ' set :value';
    mysqlProxy.execSql(sql, {value: value}, callback);

};

module.exports.selectById = function (tableName, value, callback) {
    var sql = 'select * from ' + tableName + ' where id = :id';
    mysqlProxy.execSql(sql, {id: typeof value == 'object' ? value.id : value}, callback);
};

module.exports.updateById = function (tableName, value, callback) {
    var sql = 'update ' + tableName + ' set :value where id = :id';
    mysqlProxy.execSql(sql, {value: value, id: value.id}, callback);
};

module.exports.deleteById = function (tableName, value, callback) {
    var sql = 'delete from ' + tableName + '  where id = :id';
    mysqlProxy.execSql(sql, {id: typeof value == 'object' ? value.id : value}, callback);
};
