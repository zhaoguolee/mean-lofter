'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    path = require('path'),
    dbService = require(path.resolve('./modules/lib/db/dbService'));

var postersTable = 'planx.t_posters';

module.exports.save = function (poster, callback) {
    poster.created = Date.now();
    poster.updated = poster.created;
    dbService.insert(postersTable, poster, function (error) {
        if (error) {
            console.error('posters.server.model.save error.', error);
        }
        callback(error, poster);
    });
};

module.exports.update = function (poster, callback) {
    poster.updated = Date.now();
    dbService.updateById(postersTable, poster, function (error, result) {
        if (error) {
            console.error('posters.server.model.update error.', error);
        }
        callback(error, poster);
    });
};

module.exports.delete = function (poster, callback) {
    poster.status = -1;
    poster.updated = Date.now();
    dbService.updateById(postersTable, poster, function (error, result) {
        if (error) {
            console.error('posters.server.model.delete error.', error);
        }
        callback(error, poster);
    });
};

module.exports.posterById = function (posterId, callback) {
    dbService.selectById(postersTable, {id: posterId}, function (error, result) {
        if (error) {
            console.error('posters.server.model.posterById error.', error);
        }
        var poster = result && result.length > 0 ? result[0] : null;
        callback(error, poster);
    });
};

module.exports.postersByUser = function (userId, lastCreatedDate, rows, callback) {
    var sql = 'select * from ' + postersTable + ' where userId = :userId ';
    if (lastCreatedDate) {
        sql += 'and created < :lastCreatedDate';
    }
    sql += ' and status != -1 order by created desc';
    if (rows) {
        sql += ' limit :rows';
    }
    dbService.execMysql(sql, {userId: userId, lastCreatedDate: lastCreatedDate, rows: rows}, function (error, result) {
        if (error) {
            console.error('posters.server.model.postersByUser error.', error);
        }
        callback(error, result);
    });
};

module.exports.postersCountByUser = function (userId, callback) {
    var sql = 'select count(id) from ' + postersTable + ' where userId = :userId and status != -1';
    dbService.execMysql(sql, {userId: userId}, function (error, result) {
        if (error) {
            console.error('posters.server.model.postersCountByUser error.', error);
        }
        callback(error, result);
    });
};

