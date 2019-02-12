'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    path = require('path'),
    userModel = require('../../models/users.server.model.js');

/**
 * User middleware
 */
exports.userByUserName = function (req, res, next, username) {

    userModel.userByUserName(username, function (err, user) {
        if (err) {
            return next(err);
        }
        if (user && user.status !== -1) {
            delete user.password;
            delete user.salt;
            delete user.resetToken;
            delete user.tokenCreated;
            req.selectedUser = user;
        } else {
            req.selectedUser = null;
        }

        next();
    });
};
