/*
* nodester-cli
* A CLI tool to allow interaction with the http://nodester.com/ platform.
* @division env
*/

var fs     = require('fs')
  , path   = require('path')
  , Node   = require('nodester-api').nodester
  , exists = path.existsSync
  , config = require('./config')
  , log    = require('./log')
  ;


var Env = module.exports
  , cfg = config
  ;

cfg.check()
var nodeapi = new Node(cfg.username, cfg.password, cfg.apihost, cfg.apisecure)


Env.usage = function () {
  log.usage('In a configured app dir, <appname> is optional.');
  log.usage('env get <appname> - Gets the list of enviroment values configured for this app.');
  log.usage('env set <appname> <key> <value> - Creates/updates an environment key/pair for this app.');
  log.usage('env delete <appname> <key> - Deletes an environment key/value pair for this app..');
}

Env.get = function (args) {
  config.check();
  var appname = config.appname;

  if (args.length) {
    appname = args[0].toLowerCase();
  }

  log.info('Gathering enviroment variables for:', appname);
  nodeapi.env_get(appname, function (err, data, original) {
    if (err) {
      log.error(err.message);
    }
    for (var x in data.message) {
      log.info(x, '=', data.message[x]);
    }
  });
}

Env.set = function (args) {
  config.check();
  var appname = config.appname,
    p = args;

  if (args.length && !appname) {
    appname = args[0];
    p = args.splice(1);
  }

  if (p.length < 2) {
    log.error('no key/value pair to set.'); 
  }

  log.info('for app ' + appname + ', setting: ' + p[0] + '=' + p[1]);

  nodeapi.env_set(appname, p[0], p[1], function (err, data, original) {
    if (err) {
      log.error(err.message);
    }
    if (data.status == "success") {
      log.info('environment variable set.');
    } else {
      log.warn(data.status);
    }
  });
}

Env.delete = function (args) {
  config.check();
  var appname = config.appname,
    p = args;

  if (args.length && !appname) {
    appname = args[0];
    p = args.splice(1);
  }
  if (p.length < 1) {
    log.error('no key to delete.'); 
  }
  log.info('for app ' + appname + ', deleting environment variable: ' + p[0]);

  nodeapi.env_delete(appname, p[0], function (err, data, original) {
    if (err) {
      log.error(err.message);
    }
    if (data.status == "success") {
      log.info('environment variable deleted.');
    } else {
      log.warn(data.status);
    }
  });

}
