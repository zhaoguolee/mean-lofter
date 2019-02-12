'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    path = require('path'),
    dbService = require(path.resolve('./modules/lib/db/dbService'));

var commentsTable = 'planx.t_comments';
var usersTable = 'planx.t_users';

module.exports.save = function (comment, callback) {
    comment.created = Date.now();
    comment.updated = comment.created;
    dbService.insert(commentsTable, comment, function (error) {
        if (error) {
            console.error('comments.server.model.save error.', error);
        }
        callback(error, comment);
    });
};

module.exports.commentsByTargetId = function (posterId, callback) {
    var sql = 'select c.*, u.username, u.displayName from ' + commentsTable + ' c left join ' + usersTable + ' u ' +
        'on c.userId = u.id where c.targetId = :targetId and c.status != -1 order by created asc';
    dbService.execMysql(sql, {targetId: posterId}, function (error, result) {
        if (error) {
            console.error('comments.server.model.commentsByTargetId error.', error);
        }
        callback(error, result);
    });
};

