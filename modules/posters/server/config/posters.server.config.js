'use strict';

var path = require('path');

module.exports = {

    photosUpload: {
        uploads: {
            prefix: '/uploads/images/', // url prefix
            path: path.resolve('./uploads/images/'), // upload destination path
            limits: {
                fileSize: 10*1024*1024 // Max file size in bytes
            }
        },
        thumb: {
            prefix: '/thumb/images/', // url prefix
            path: path.resolve('./thumb/images/') // thumb destination path
        }
    },
    videoUpload: {
        uploads: {
            prefix: '/uploads/videos/', // url prefix
            path: path.resolve('./uploads/videos/'), // upload destination path
            limits: {
                fileSize: 20*1024*1024 // Max file size in bytes
            }
        },
        thumb: {
            prefix: '/thumb/videos/', // url prefix
            path: path.resolve('./thumb/videos/') // thumb destination path
        }
    }
};
