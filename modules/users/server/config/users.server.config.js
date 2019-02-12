'use strict';

var path = require('path');

module.exports = {

    profileUpload: {
        uploads: {
            prefix: '/uploads/profile/', // url prefix
            path: path.resolve('./uploads/profile/'), // Profile upload destination path
            limits: {
                fileSize: 5*1024*1024 // Max file size in bytes (5 MB)
            }
        },
        thumb: {
            prefix: '/thumb/profile/', // url prefix
            path: path.resolve('./thumb/profile/') // thumb upload destination path
        }
    }
};
