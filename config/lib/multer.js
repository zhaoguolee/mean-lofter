'use strict';

var crypto = require('crypto');

module.exports.imageUploadFileFilter = function (req, file, cb) {
    if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/gif') {
        return cb(new Error('请上传正确的图片'), false);
    }
    cb(null, true);
};


module.exports.videoUploadFileFilter = function (req, file, cb) {
    if (file.mimetype !== 'video/mp4') {
        return cb(new Error('请上传正确的视频文件'), false);
    }
    cb(null, true);
};

module.exports.getFilename = function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (error, raw) {
        if (error) {
            cb(error);
            return;
        }
        var fileName = raw.toString('hex');
        var fileType = file.mimetype ? file.mimetype.split('/')[1] : 'unknown';
        cb(null, fileName + '.' + fileType);
    });
};