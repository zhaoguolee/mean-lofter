'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
    path = require('path'),
    userModel = require('../../models/users.server.model.js'),
    userConfig = require('../../config/users.server.config.js');

/**
 * Signup
 */
exports.signup = function (req, res) {

    // Init Variables
    var user = {
        displayName: req.body.displayName,
        phone: req.body.phone,
        email: req.body.email,
        password: req.body.password,
        username: req.body.username
    };

    // Add missing user fields
    user.provider = 'local';
    user.roles = 'user';
    var imageUrl = '/modules/users/client/img/profile/default.png';
    user.imageUrl = imageUrl;
    user.thumbUrl = imageUrl;

    if (!user.username || !user.username.trim()) {
        return res.status(400).send({
            message: '用户名不能为空'
        });
    }
    if (!user.password || !user.password.trim()) {
        return res.status(400).send({
            message: '密码不能为空'
        });
    }
    if (!user.displayName || !user.displayName.trim()) {
        return res.status(400).send({
            message: '昵称不能为空'
        });
    }

    // Then save the user
    userModel.save(user, function (err, user) {
        if (err) {
            return res.status(400).send({
                message: err.message
            });
        } else {
            // Remove sensitive data before login
            delete user.password;
            delete user.salt;

            req.login(user, function (err) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    res.json(user);
                }
            });
        }
    });
};

/**
 * Signin after passport authentication
 */
exports.signin = function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err || !user) {
            res.status(400).send(info);
        } else {
            req.login(user, function (err) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    res.json(user);
                }
            });
        }
    })(req, res, next);
};

/**
 * Signout
 */
exports.signout = function (req, res) {
    req.logout();
    res.redirect('/');
};

