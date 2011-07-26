var node = require('nodester-api').nodester,
    config = require('./config'),
    sys = require('sys'),
    path = require('path'),
    log = require('log'),
    fs = require('fs'),
    iniparser = require('iniparser');


module.exports = {
  usage: function() {
    log.usage('password_reset token <user> - Request a password reset token');
    log.usage('password_reset setpass <token> <password> - Set a new password for the user with token');
  },
  token: function(args) {
    config.check();
    var user = args[0];
    if (!args[0]) {
      log.usage('password_reset token <user> - Request a password reset token');
      log.error('A user is required');
    }
    var nodeapi = new node(config.username, config.password, config.apihost, config.apisecure);
    nodeapi.password_reset_token(user, function (err, data) {
      if (err && !data) {
        log.error(err.message);
      } else {
        log.info(data.status);
      }
    });
  },
  setpass: function(args) {
    config.check();
    var token = args[0];
    var password = args[1];
    if (args.length < 2) {
      log.usage('password_reset setpass <token> <password> - Set a new password for the user with token');
      log.error('All parameters are required');
    }
    var nodeapi = new node(config.username, config.password, config.apihost, config.apisecure);
    nodeapi.password_reset_setpass(token, password, function (err, data) {
      if (err) {
        log.error(err.message);
      } else {
        log.info(data.message);
      }
    });
  }
};
