'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    crypto = require('crypto'),
    dbService = require(path.resolve('./modules/lib/db/dbService'));

var usersTable = 'planx.t_users';

module.exports.save = function (user, callback) {

    user.username = user.username.trim().toLowerCase();
    user.displayName = user.displayName.trim();
    user.salt = crypto.randomBytes(16).toString('base64');
    user.password = hashPassword(user.password.trim(), user.salt);
    user.created = Date.now();
    user.updated = user.created;
    dbService.insert(usersTable, user, function (error) {
        if (error) {
            console.error('users.server.model.save error.', error);
            if (error.errno === 1062) {
                error.message = '此用户名已经注册';
            } else {
                error.message = '系统暂不可用,请稍候再试';
            }
        }
        callback(error, user);
    });
};

module.exports.update = function (user, callback) {
    user.updated = Date.now();
    user.displayName = user.displayName.trim();
    if (user.description) {
        user.description = user.description.trim();
    }
    dbService.updateById(usersTable, user, function (error, result) {
        if (error) {
            console.error('users.server.model.update error.', error);
        }
        callback(error, user);
    });
};

module.exports.updatePassword = function (user, callback) {
    user.updated = Date.now();
    user.password = hashPassword(user.password.trim(), user.salt);
    dbService.updateById(usersTable, user, function (error, rsult) {
        if (error) {
            console.error('users.server.model.updatePassword error.', error);
        }
        callback(error, user);
    });
};

module.exports.authenticate = function (user, password) {
    return user.password === hashPassword(password.trim(), user.salt);
};

module.exports.userByUserName = function (username, callback) {
    // TODO
    var sql = 'select * from ' + usersTable + ' where username = :username';
    dbService.execMysql(sql, {username: username.trim().toLowerCase()}, function (error, result) {
        if (error) {
            console.error('users.server.model.userByUserName error.', error);
        }
        var user = result && result.length > 0 ? result[0] : null;
        callback(error, user);
    });
};

module.exports.userById = function (id, callback) {
    dbService.selectById(usersTable, {id: id}, function (error, result) {
        if (error) {
            console.error('users.server.model.userById error.', error);
        }
        var user = result && result.length > 0 ? result[0] : null;
        callback(error, user);
    });
};


module.exports.userByResetToken = function (resetToken, callback) {
    var sql = 'select * from ' + usersTable + ' where resetToken = :resetToken ' +
        'and tokenCreated + 60 * 60 * 1000 < :now';
    dbService.execMysql(sql, {resetToken: resetToken, now: Date.now()}, function (error, result) {
        if (error) {
            console.error('users.server.model.userByResetToken error.', error);
        }
        var user = result && result.length > 0 ? result[0] : null;
        callback(error, user);
    });
};

function hashPassword(password, salt) {
    if (salt && password) {
        return crypto.pbkdf2Sync(password, new Buffer(salt, 'base64'), 10000, 64).toString('base64');
    } else {
        return password;
    }
}
