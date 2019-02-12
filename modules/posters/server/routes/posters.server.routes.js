'use strict';

var path = require('path');
var user = require(path.resolve('./modules/users/server/policies/users.server.policy'));
var policy = require('../policies/poster.server.policy');

module.exports = function (app) {

    var medias = require('../controllers/medias.server.controller.js');
    var posters = require('../controllers/posters.server.controller.js');

    app.route('/api/media/image').post(user.isLogin, medias.image);
    app.route('/api/media/video').post(user.isLogin, medias.video);
    app.route('/api/poster/list/:username').get(posters.postersByUser);
    app.route('/api/poster/text').post(user.isLogin, posters.textPoster);
    app.route('/api/poster/media').post(user.isLogin, posters.mediaPoster);
    app.route('/api/poster/view/:posterId').get(posters.view);
    app.route('/api/poster/update/:posterId').post(policy.isMyPoster, posters.update);
    app.route('/api/poster/delete/:posterId').post(policy.isMyPoster, posters.delete);
    app.route('/api/poster/recommend').get(user.isLogin, posters.recommend);

    app.param('posterId', posters.posterById);

};
