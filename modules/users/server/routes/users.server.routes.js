'use strict';

var policy = require('../policies/users.server.policy');

module.exports = function (app) {
  // User Routes
  var users = require('../controllers/users.server.controller');

  // Setting up the users profile api
  app.route('/api/users/me').get(users.me);
  app.route('/api/users').put(policy.isLogin, users.update);
  app.route('/api/users/password').post(policy.isLogin, users.changePassword);
  app.route('/api/users/picture').post(policy.isLogin, users.changeProfilePicture);

  // Finish by binding the user middleware
  app.param('username', users.userByUserName);

};
