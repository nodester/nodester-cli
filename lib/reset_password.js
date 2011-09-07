var node = require('nodester-api').nodester,
    config = require('./config'),
    sys = require('sys'),
    path = require('path'),
    log = require('./log'),
    fs = require('fs'),
    iniparser = require('iniparser');


module.exports = {
  usage: function() {
    log.usage('reset_password token - Request a password reset token');
    log.usage('reset_password setpass <token> <new_password> - Set a new password for the user with token');
  },
  token: function(args) {
    config.check();
    
    var nodeapi = new node(config.username, config.password, config.apihost, config.apisecure);
    nodeapi.password_reset_token(config.username, function (err, data) {
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
      log.usage('reset_password setpass <token> <new_password> - Set a new password for the user with token');
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

