'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    userModel = require('../../models/users.server.model.js');

module.exports = function () {
    // Use local strategy
    passport.use(new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password'
        },
        function (username, password, done) {
            userModel.userByUserName(username, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user || !userModel.authenticate(user, password)) {
                    return done(null, false, {
                        message: '用户名或密码错误'
                    });
                }
                if (user.status !== 0) {
                    return done(null, false, {
                        message: '账户不可用'
                    });
                }
                // Remove sensitive data
                delete user.password;
                delete user.salt;
                delete user.resetToken;
                delete user.tokenCreated;

                return done(null, user);
            });
        })
    );
};
