'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    path = require('path'),
    dbService = require(path.resolve('./modules/lib/db/dbService'));

var mediasTable = 'planx.t_medias';

module.exports.save = function (media, callback) {
    media.created = Date.now();
    media.updated = media.created;
    dbService.insert(mediasTable, media, function (error) {
        if (error) {
            console.error('medias.server.model.save error.', error);
        }
        callback(error, media);
    });
};

module.exports.update = function (media, callback) {
    media.updated = Date.now();
    dbService.updateById(mediasTable, media, function (error, result) {
        if (error) {
            console.error('medias.server.model.update error.', error);
        }
        callback(error, media);
    });
};

module.exports.delete = function (media, callback) {
    media.status = -1;
    media.updated = Date.now();
    dbService.updateById(mediasTable, media, function (error, result) {
        if (error) {
            console.error('medias.server.model.delete error.', error);
        }
        callback(error, media);
    });
};

module.exports.mediaById = function (id, callback) {
    dbService.selectById(mediasTable, {id: id}, function (error, result) {
        if (error) {
            console.error('medias.server.model.mediaById error.', error);
        }
        var media = result && result.length > 0 ? result[0] : null;
        callback(error, media);
    });
};

module.exports.mediasByPosters = function (posters, callback) {
    var posterIds;
    if (_.isArray(posters)) {
        if (posters.length > 0) {
            posterIds = _.pluck(posters, 'id');
        } else {
            callback(null, []);
            return;
        }
    } else if (_.isObject(posters)) {
        posterIds = posters.id;
    }
    var sql = 'select * from ' + mediasTable + ' where posterId in (:posterIds) and status != -1 order by created asc';
    dbService.execMysql(sql, {posterIds: posterIds}, function (error, result) {
        if (error) {
            console.error('medias.server.model.mediasByPosters error.', error);
        }
        callback(error, result);
    });
};