/*
* nodester-cli
* A CLI tool to allow interaction with the http://nodester.com/ platform.
* @division env
*/

/*jshint node:true, noempty:true, laxcomma:true, laxbreak:false */

"use strict";

var fs     = require('fs')
  , path   = require('path')
  , Node   = require('nodester-api').nodester
  , exists = fs.existsSync || path.existsSync
  , config = require('./config')
  , log    = require('./log')
  ;


var cfg = config;


function usage () {
  log.info('');
  log.info('`nodester env <command>`'.bold + ' manage Environmental keys for your apps');
  log.info(' Useful to manage sensible data like db passwords or API credentials');
  log.usage('In a configured app dir, <appname> is optional.');
  log.usage('');
  log.usage('\tenv get <appname> \t\t- Gets the list of enviroment values configured for this app.');
  log.usage('\tenv set <appname> <key> <value> - Creates/updates an environment key/pair for this app.');
  log.usage('\tenv delete <appname> <key> \t- Deletes an environment key/value pair for this app..');
  log.usage('');
  log.info('ok!'.green);
}

function get (args) {
  cfg.check();
  var nodeapi = new Node(cfg.username, cfg.password, cfg.apihost, cfg.apisecure)
    , appname = config.appname;

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

function set (args) {
  cfg.check();
  var nodeapi = new Node(cfg.username, cfg.password, cfg.apihost, cfg.apisecure)
    , appname = config.appname,
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

function destroy (args) {
  cfg.check();
  var nodeapi = new Node(cfg.username, cfg.password, cfg.apihost, cfg.apisecure)
    , appname = config.appname
    , p = args;

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

var Env = {
  usage: usage,
  get: get,
  set: set,
  "delete": destroy
};

// Shorthands
Env.g = Env.get;
Env.s = Env.set;
Env.d = Env['delete'];

module.exports = Env;