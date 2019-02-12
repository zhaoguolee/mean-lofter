'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    path = require('path'),
    multer = require('multer'),
    async = require('async'),
    mkdirp = require('mkdirp'),
    gm = require('gm').subClass({imageMagick: true}),
    userModel = require('../../models/users.server.model.js'),
    multerConfig = require(path.resolve('./config/lib/multer')),
    userConfig = require('../../config/users.server.config.js');

/**
 * Update user details
 */
exports.update = function (req, res) {
    // Init Variables
    var user = req.user;

    var modifiedUser = {
        displayName: req.body.displayName,
        phone: req.body.phone,
        email: req.body.email,
        description: req.body.description
    };

    user = _.extend(user, modifiedUser);
    user.updated = Date.now();

    if (!user.displayName || !user.displayName.trim()) {
        return res.status(400).send({
            message: '昵称不能为空'
        });
    }

    userModel.update(user, function (err, user) {
        if (err) {
            return res.status(400).send({
                message: '系统暂不可用,请稍候再试'
            });
        } else {
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
 * Update profile picture
 */
exports.changeProfilePicture = function (req, res) {
    var user = req.user;

    var dest = path.join(userConfig.profileUpload.uploads.path, user.username);
    var storage = multer.diskStorage({
        destination: dest,
        filename: multerConfig.getFilename
    });
    var profileUpload = _.extend(userConfig.profileUpload.uploads, {storage: storage});
    var upload = multer(profileUpload).single('newProfilePicture');

    // Filtering to upload only images
    upload.fileFilter = multerConfig.imageUploadFileFilter;

    upload(req, res, function (uploadError) {
        if (uploadError) {
            console.error('users.server.controller.changeProfilePicture error', uploadError);
            return res.status(400).send({
                message: '上传图片失败'
            });
        } else {
            var imageUrl = path.join(userConfig.profileUpload.uploads.prefix, user.username, req.file.filename);
            var thumbUrl = path.join(userConfig.profileUpload.thumb.prefix, user.username, req.file.filename);
            var imagePath = path.join(userConfig.profileUpload.uploads.path, user.username, req.file.filename);
            var thumbPath = path.join(userConfig.profileUpload.thumb.path, user.username, req.file.filename);

            user.imageUrl = imageUrl;

            async.waterfall([
                function (callback) {
                    mkdirp(path.dirname(thumbPath), function (error) {
                        if (error) {
                            console.error('users.server.controller.changeProfilePicture error', error);
                        }
                        callback();
                    });
                },
                function (callback) {
                    gm(imagePath)
                        .size(function (error, size) {
                            var width;
                            if (error) {
                                console.error('users.server.controller.changeProfilePicture error', error);
                            } else {
                                width = size.width;
                            }
                            callback(null, width);
                        });
                },
                function (width, callback) {
                    if (!width || width < 300) {
                        user.thumbUrl = imageUrl;
                        callback();
                        return;
                    }
                    gm(imagePath)
                        .resize(200)
                        .write(thumbPath, function (error) {
                            if (error) {
                                console.error('users.server.controller.changeProfilePicture error', error);
                                user.thumbUrl = imageUrl;
                            } else {
                                user.thumbUrl = thumbUrl;
                            }
                            callback();
                        });
                },
                function (callback) {
                    userModel.update(user, function (error, user) {
                        callback(error, user);
                    });
                }
            ], function (error, user) {
                if (error) {
                    console.error(error);
                    return res.status(400).send({
                        message: '系统暂不可用,请稍候再试'
                    });
                } else {
                    req.login(user, function (err) {
                        if (err) {
                            res.status(400).send(err);
                        } else {
                            res.json(user);
                        }
                    });
                }
            });
        }
    });
};

/**
 * Send User
 */
exports.me = function (req, res) {
    res.json(req.user || null);
};
