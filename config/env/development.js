'use strict';

var defaultEnvConfig = require('./default');

module.exports = {
  mysql: {
    default: {
      connectionLimit: 10,
      host: '127.0.0.1',
      port: '3306',
      user: 'root',
      password: 'root'
    }
  },
  log: {
    // logging with Morgan - https://github.com/expressjs/morgan
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'dev',
    options: {
      // Stream defaults to process.stdout
      // Uncomment/comment to toggle the logging to a log on the file system
      //stream: {
      //  directoryPath: process.cwd(),
      //  fileName: 'access.log',
      //  rotatingLogs: { // for more info on rotating logs - https://github.com/holidayextras/file-stream-rotator#usage
      //    active: false, // activate to use rotating logs 
      //    fileName: 'access-%DATE%.log', // if rotating logs are active, this fileName setting will be used
      //    frequency: 'daily',
      //    verbose: false
      //  }
      //}
    }
  },
  app: {
    title: defaultEnvConfig.app.title + ' - Development Environment'
  },
  mailer: {
    from: 'MAILER_FROM',
    options: {
      service: 'MAILER_SERVICE_PROVIDER',
      auth: {
        user: 'MAILER_EMAIL_ID',
        pass: 'MAILER_PASSWORD'
      }
    }
  }
};
