'use strict';

/**
 * Module dependencies.
 */
var postersConfig = require('../config/posters.server.config.js'),
    express = require('express');

/**
 * Module init function.
 */
module.exports = function (app) {

    initStaticFolder(app);

};

function initStaticFolder(app) {
    app.use(postersConfig.photosUpload.uploads.prefix, express.static(postersConfig.photosUpload.uploads.path));
    app.use(postersConfig.videoUpload.uploads.prefix, express.static(postersConfig.videoUpload.uploads.path));
    app.use(postersConfig.photosUpload.thumb.prefix, express.static(postersConfig.photosUpload.thumb.path));
    app.use(postersConfig.videoUpload.thumb.prefix, express.static(postersConfig.videoUpload.thumb.path));
}