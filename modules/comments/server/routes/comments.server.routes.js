'use strict';

var path = require('path');
var user = require(path.resolve('./modules/users/server/policies/users.server.policy'));

module.exports = function (app) {

    var comments = require('../controllers/comments.server.controller.js');

    app.route('/api/comment/save').post(user.isLogin, comments.save);
    app.route('/api/comment/list/:targetId').get(comments.commentsByTargetId);

};
