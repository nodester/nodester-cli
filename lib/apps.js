/*
* nodester-cli
* A CLI tool to allow interaction with the http://nodester.com/ platform.
* @division apps
*/
/*jshint node:true, noempty:true, laxcomma:true, laxbreak:false */

"use strict";

var Node = require('nodester-api').nodester
  , config = require('./config')
  , log = require('./log')
  ;

function usage () {
  log.usage('apps list - list all your registered apps (shortcut for `' + config.brand + ' app list`)');
  log.info('ok!'.green.bold);
}

function list (args) {
  config.check();
  log.info('Listing ' + config.username + '\'s apps.');
  log.info('Waiting for the response...');
  config.check();
  var nodeapi = new Node(config.username, config.password, config.apihost, config.apisecure);
  nodeapi.apps_list(function (err, data, original) {
    if (err) {
      log.error(err.message);
    }
    if (data.length > 0) {
      for (var i in data) {
        var l = 'info',
            r = data[i].running;
        var state = false;
        if (data[i].running.hasOwnProperty('indexOf') &&  (data[i].running.indexOf('error') >-1|| data[i].running.indexOf('failed-to') > -1)) 
          state = true;
        if (data[i].running === false || data[i].running == 'false' || state) {
          l = 'warn';
          if (r === false || r == 'false') {
            r = 'false';
          }
          r = r.red;
        }
        log[l](data[i].name, 'on port', data[i].port, 'running:', r.bold);
      }
      log.info('ok!'.green.bold);
    } else {
      log.warn('no apps to report');
    }
  });
}

var Apps = {
  usage: usage,
  run: list,
  list: list
};

module.exports = Apps;