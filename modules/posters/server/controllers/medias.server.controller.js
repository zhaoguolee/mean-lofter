'use strict';

var _ = require('lodash'),
    async = require('async'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    multer = require('multer'),
    gm = require('gm').subClass({imageMagick: true}),
    ffmpeg = require('fluent-ffmpeg'),
    multerConfig = require(path.resolve('./config/lib/multer')),
    postersConfig = require('../config/posters.server.config.js'),
    mediasModel = require('../models/medias.server.model.js');

/**
 * upload photo
 *
 * @param req
 * @param res
 */
exports.image = function (req, res) {

    var user = req.user;

    var dest = path.join(postersConfig.photosUpload.uploads.path, user.username);
    var storage = multer.diskStorage({
        destination: dest,
        filename: multerConfig.getFilename
    });
    var photosUpload = _.extend(postersConfig.photosUpload.uploads,
        {
            storage: storage,
            fileFilter: multerConfig.imageUploadFileFilter
        });
    var upload = multer(photosUpload).single('image');

    upload(req, res, function (uploadError) {
        if (uploadError) {
            console.error('medias.server.controller.photo error', uploadError);
            return res.status(400).send({
                message: '上传失败'
            });
        } else {
            var mediaUrl = path.join(postersConfig.photosUpload.uploads.prefix, user.username, req.file.filename);
            var thumbUrl = path.join(postersConfig.photosUpload.thumb.prefix, user.username, req.file.filename);
            var mediaPath = path.join(postersConfig.photosUpload.uploads.path, user.username, req.file.filename);
            var thumbPath = path.join(postersConfig.photosUpload.thumb.path, user.username, req.file.filename);
            var photo = {
                userId: user.id,
                posterId: req.body.posterId,
                mediaUrl: mediaUrl,
                type: 1
            };
            async.series({
                mkdir: function (callback) {
                    mkdirp(path.dirname(thumbPath), function (error) {
                        if (error) {
                            console.error('medias.server.controller.photo error', error);
                        }
                        callback();
                    });
                },
                imageSize: function (callback) {
                    gm(mediaPath)
                        .size(function (error, size) {
                            if (error) {
                                console.error('medias.server.controller.photo error', error);
                            } else {
                                photo.width = size.width;
                                photo.height = size.height;
                            }
                            callback();
                        });
                },
                thumb: function (callback) {
                    if (!photo.width){
                        callback();
                        return;
                    }
                    if (photo.width < 300) {
                        photo.thumbUrl = mediaUrl;
                        callback();
                        return;
                    }
                    gm(mediaPath)
                        .resize(200)
                        .write(thumbPath, function (error) {
                            if (error) {
                                console.error('medias.server.controller.photo error', error);
                            } else {
                                photo.thumbUrl = thumbUrl;
                            }
                            callback();
                        });
                },
                photo: function (callback) {
                    mediasModel.save(photo, function (error, photo) {
                        callback(error, photo);
                    });
                }
            }, function (error, result) {
                if (error) {
                    return res.status(400).send({
                        message: '系统暂不可用,请稍候再试'
                    });
                }
                res.json(result.photo);
            });
        }
    });
};

/**
 * upload video
 *
 * @param req
 * @param res
 */
exports.video = function (req, res) {

    var user = req.user;

    var dest = path.join(postersConfig.videoUpload.uploads.path, user.username);
    var storage = multer.diskStorage({
        destination: dest,
        filename: multerConfig.getFilename
    });
    var videosUpload = _.extend(postersConfig.videoUpload.uploads, {
        storage: storage, fileFilter: multerConfig.videoUploadFileFilter
    });
    var upload = multer(videosUpload).single('video');

    upload(req, res, function (uploadError) {
        if (uploadError) {
            console.error('medias.server.controller.video error', uploadError);
            return res.status(400).send({
                message: '上传失败'
            });
        } else {
            var mediaUrl = path.join(postersConfig.videoUpload.uploads.prefix, user.username, req.file.filename);
            var mediaPath = path.join(postersConfig.videoUpload.uploads.path, user.username, req.file.filename);
            var thumbFolder = path.join(postersConfig.videoUpload.thumb.path, user.username);
            var thumbFileName = req.file.filename.split('.')[0];
            var thumbPath, thumbUrl, width, height;
            var video = {
                userId: user.id,
                posterId: req.body.posterId,
                mediaUrl: mediaUrl,
                type: 2
            };
            async.series({
                mkdir: function (callback) {
                    mkdirp(path.dirname(thumbFolder), function (error) {
                        if (error) {
                            console.error('medias.server.controller.video error', error);
                        }
                        callback();
                    });
                },
                thumb: function (callback) {
                    ffmpeg(mediaPath)
                        .on('filenames', function(filenames) {
                            var fileName = filenames[0];
                            // png文件的保存路径
                            thumbPath = path.join(postersConfig.videoUpload.thumb.path, user.username, fileName);
                            thumbUrl = path.join(postersConfig.videoUpload.thumb.prefix, user.username, fileName);
                            var strings = fileName.split('_');
                            width = strings[1];
                            height = strings[2];
                        })
                        .on('end', function() {
                            video.width = width;
                            video.height = height;
                            callback();
                        })
                        .on('error', function(err) {
                            console.error('medias.server.controller.video error', err);
                            callback();
                        })
                        .screenshots({
                            timestamps: ['1%'],
                            filename: thumbFileName + '_%w_%h_.png',
                            folder: thumbFolder
                        });
                },
                thumb2Jpg: function (callback) {
                    var jpgPath = thumbPath.substring(0, thumbPath.length - 4) + '.jpg';
                    gm(thumbPath).write(jpgPath, function (error) {
                        if (error) {
                            console.error('medias.server.controller.video error', error);
                        } else {
                            video.thumbUrl = thumbUrl.substring(0, thumbUrl.length - 4) + '.jpg';
                        }
                        callback();
                    });
                },
                video: function (callback) {
                    mediasModel.save(video, function (error, video) {
                        callback(error, video);
                    });
                }
            }, function (error, result) {
                if (error) {
                    return res.status(400).send({
                        message: '系统暂不可用,请稍候再试'
                    });
                }
                res.json(result.video);
            });
        }
    });
};
