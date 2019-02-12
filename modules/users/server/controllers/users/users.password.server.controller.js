'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    config = require(path.resolve('./config/config')),
    userModel = require('../../models/users.server.model.js'),
    nodemailer = require('nodemailer'),
    async = require('async'),
    crypto = require('crypto');

var smtpTransport = nodemailer.createTransport(config.mailer.options);

/**
 * Forgot for reset password (forgot POST)
 */
exports.forgot = function (req, res, next) {
    async.waterfall([
        // Generate random token
        function (done) {
            crypto.randomBytes(20, function (err, buffer) {
                var token = buffer.toString('hex');
                done(err, token);
            });
        },
        // Lookup user by username
        function (token, done) {
            if (req.body.username) {
                userModel.userByUserName(req.body.username, function (err, user) {
                    if (!user) {
                        return res.status(400).send({
                            message: '用户不存在'
                        });
                    } else if (user.provider !== 'local') {
                        return res.status(400).send({
                            message: '使用的账号并非在本网站注册,无法重置'
                        });
                    } else {
                        user.resetToken = token;
                        user.tokenCreated = Date.now();

                        userModel.update(user, function (err, user) {
                            done(err, token, user);
                        });
                    }
                });
            } else {
                return res.status(400).send({
                    message: '请输入用户名'
                });
            }
        },
        function (token, user, done) {

            var httpTransport = 'http://';
            if (config.secure && config.secure.ssl === true) {
                httpTransport = 'https://';
            }
            res.render(path.resolve('modules/users/server/templates/reset-password-email'), {
                name: user.displayName,
                appName: config.app.title,
                url: httpTransport + req.headers.host + '/api/auth/reset/' + token
            }, function (err, emailHTML) {
                done(err, emailHTML, user);
            });
        },
        // If valid email, send reset email using service
        function (emailHTML, user, done) {
            var mailOptions = {
                to: user.email,
                from: config.mailer.from,
                subject: 'Password Reset',
                html: emailHTML
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                if (!err) {
                    res.send({
                        message: '重置密码邮件已经发送到您的电子邮箱.'
                    });
                } else {
                    return res.status(400).send({
                        message: '发送电子邮件失败'
                    });
                }

                done(err);
            });
        }
    ], function (err) {
        if (err) {
            return next(err);
        }
    });
};

/**
 * Reset password GET from email token
 */
exports.validateResetToken = function (req, res) {
    userModel.userByResetToken(req.params.token, function (err, user) {
        if (err || !user) {
            return res.redirect('/password/reset/invalid');
        }

        res.redirect('/password/reset/' + req.params.token);
    });
};

/**
 * Reset password POST from email token
 */
exports.reset = function (req, res, next) {
    // Init Variables
    var passwordDetails = req.body;

    async.waterfall([

        function (done) {
            userModel.userByResetToken(req.params.token, function (err, user) {
                if (err || !user) {
                    return res.status(400).send({
                        message: '修改密码页面无效或者已经过期'
                    });
                }

                user.password = passwordDetails.newPassword;
                user.resetToken = undefined;
                user.tokenCreated = undefined;

                userModel.update(user, function (err, user) {
                    if (err) {
                        return res.status(400).send({
                            message: err.message
                        });
                    } else {
                        req.login(user, function (err) {
                            if (err) {
                                res.status(400).send(err);
                            } else {
                                // Remove sensitive data before return authenticated user
                                delete user.password;
                                delete user.salt;

                                res.json(user);

                                done(err, user);
                            }
                        });
                    }
                });


            });
        },
        function (user, done) {
            res.render('modules/users/server/templates/reset-password-confirm-email', {
                name: user.displayName,
                appName: config.app.title
            }, function (err, emailHTML) {
                done(err, emailHTML, user);
            });
        },
        // If valid email, send reset email using service
        function (emailHTML, user, done) {
            var mailOptions = {
                to: user.email,
                from: config.mailer.from,
                subject: '您的登录密码已经被修改',
                html: emailHTML
            };

            smtpTransport.sendMail(mailOptions, function (err) {
                done(err, 'done');
            });
        }
    ], function (err) {
        if (err) {
            return next(err);
        }
    });
};

/**
 * Change Password
 */
exports.changePassword = function (req, res, next) {
    // Init Variables
    var passwordDetails = req.body;

    if (!passwordDetails.newPassword || !passwordDetails.newPassword.trim()) {
        return res.status(400).send({
            message: '请输入新密码'
        });
    }
    userModel.userById(req.user.id, function (err, user) {
        if (err || !user) {
            return res.status(400).send({
                message: '用户不存在'
            });
        }
        if (!userModel.authenticate(user, passwordDetails.currentPassword)) {
            return res.status(400).send({
                message: '登录密码错误'
            });
        }

        user.password = passwordDetails.newPassword;
        userModel.updatePassword(user, function (err, user) {
            if (err) {
                return res.status(400).send({
                    message: '系统暂不可用,请稍候再试'
                });
            } else {
                req.login(user, function (err) {
                    if (err) {
                        res.status(400).send(err);
                    } else {
                        res.send({
                            message: '修改登录密码成功'
                        });
                    }
                });
            }
        });

    });
};
