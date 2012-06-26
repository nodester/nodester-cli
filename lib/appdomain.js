/*
* nodester-cli
* A CLI tool to allow interaction with the http://nodester.com/ platform.
* @division appdomain
*/

"use strict";

/*jshint node:true, noempty:true, laxcomma:true, laxbreak:false */

var Node   = require('nodester-api').nodester
  , config = require('./config')
  , log    = require('./log')
  ;



function restartApp (appname) {
  config.check();
  var nodeapi = new Node(config.username, config.password, config.apihost, config.apisecure);
  log.info('Attemping to restart app:', appname);

  nodeapi.app_restart(appname, function (err, data, original) {
    if (err) {
      log.error(err.message);
      log.error('Failed to restart...');
      return;
    }
    if (data.status == "success") {
      log.info('app restarted.'.bold.green);
      log.info('ok!'.green.bold);
    } else {
      log.warn(data.status);
    }
  });
}

function usage () {
  log.info('');
  log.info(' `nodester appdomain <command>`'.bold + ' it\'t a shortcut to `nodester domain`');
  log.info(' Useful to manage your custom domains.');
  log.info(' In a configured app dir, <appname> is optional. (domain aliases appdomain)');
  log.info(' The availble commands are:  (Prefixed with nodester <command>) ');
  log.usage('');
  
  log.usage('\tdomain add|create <appname> <domainname> \t- Add a domain router for this app');
  log.usage('\tdomain remove|delete <appname> <domainname> \t- Remove a domain router from this app');
  log.usage('\tdomain \t\t\t\t\t\t- List domains');

  log.usage('');
  log.info('OK!'.green.bold);
}

function add (args) {
  config.check();
  var nodeapi = new Node(config.username, config.password, config.apihost, config.apisecure);
  
  var appname = config.appname,
      domain;

  if (args.length) {
    if (args.length === 2) {
      domain = args[1];
      appname = args[0];
    } else {
      domain = args[0];
    }
  }
  if (!domain) {
    log.error('<domainname> required');
    return;
  }
  if (!appname) {
    log.error('<appname> name required');
    return;
  }

  log.info('adding domain', domain, 'to', appname);

  nodeapi.appdomain_add(appname, domain, function (err, data, original) {
    if (err) {
      log.error(err.message);
    }
    if (data.status == 'success') {
      log.info(data.message);
      restartApp(appname);
      log.info('OK!'.green.bold);
    } else {
      log.warn(original);
    }
  });
}

/*function create (args) {
  Nodester.add.call(this, args);
}*/

/*Nodester.remove = function (args) {
  Nodester.delete.call(this, args);
}; */

function remove (args) {
  config.check();
  var nodeapi = new Node(config.username, config.password, config.apihost, config.apisecure);
  var appname = config.appname,
      domain;

  if (args.length) {
    if (args.length === 2) {
      domain = args[1];
      appname = args[0];
    } else {
      domain = args[0];
    }
  }

  if (!domain) {
    log.error('<domainname> required');
    return;
  }

  if (!appname) {
    log.error('<appname> name required');
    return;
  }

  log.info('removing domain', domain, 'from', appname);

  nodeapi.appdomain_delete(appname, domain, function (err, data, original) {
    if (err) {
      log.error(err.message);
    }
    if (data.status == 'success') {
      log.info(data.message);
      restartApp(appname);
    } else {
      log.warn(original);
    }
  });
  setTimeout(function () {
    log.error('No response');
  }, 1000*10);
}

function list () {
  config.check();
  var nodeapi = new Node(config.username, config.password, config.apihost, config.apisecure);
  log.info('fetching your list of domain aliases');

  nodeapi.appdomains(function (err, data, original) {
    if (err) {
      log.error(err);
    }

    if (data.length > 0) {

      data.forEach(function (i) {
        log.info(i.domain.white, 'aliased to app', i.appname.white, 'running on port', i.port);
      });
      log.info('OK!'.green.bold);

    } else {
      log.warn('no app domains to report');
    }
  });
}

var Domains = {
  usage : usage,
  add : add,
  create: add,
  remove: remove,
  run : usage,
  list : list
};

// Shorthands
Domains.a = Domains.add;
Domains.c = Domains.create;
Domains.r = Domains.remove;
Domains.l = Domains.l;

module.exports = Domains;
