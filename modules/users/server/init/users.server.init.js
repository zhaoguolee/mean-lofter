'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
    path = require('path'),
    userModel = require(path.resolve('./modules/users/server/models/users.server.model')),
    config = require(path.resolve('./config/config')),
    userConfig = require('../config/users.server.config.js'),
    express = require('express');

/**
 * Module init function.
 */
module.exports = function (app) {

    initPassport(app);

    initStaticFolder(app);

};

function initPassport(app) {
    // Serialize sessions
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // Deserialize sessions
    passport.deserializeUser(function (id, done) {
        // TODO 从缓存中读取用户信息
        userModel.userById(id, function (err, user) {
            if (user) {
                delete user.password;
                delete user.salt;
                delete user.resetToken;
                delete user.tokenCreated;
            }
            done(err, user);
        });
    });

    // Initialize strategies
    config.utils.getGlobbedPaths(path.join(__dirname, './strategies/**/*.js')).forEach(function (strategy) {
        require(path.resolve(strategy))(config);
    });

    // Add passport's middleware
    app.use(passport.initialize());
    app.use(passport.session());
}

function initStaticFolder(app) {
    app.use(userConfig.profileUpload.uploads.prefix, express.static(userConfig.profileUpload.uploads.path));
    app.use(userConfig.profileUpload.thumb.prefix, express.static(userConfig.profileUpload.thumb.path));
}