/*
* nodester-cli
* A CLI tool to allow interaction with the http://nodester.com/ platform.
* @division status
*/

/*jshint node:true, noempty:true, laxcomma:true, laxbreak:false */

"use strict";

var Node   = require('nodester-api').nodester
  , config = require('./config')
  , log    = require('./log')
  ;

var Status = module.exports;

function usage () {
  log.usage('status - Show', config.brand, 'API status');
}

function run () {
  log.info('checking api status for:', config.apihost);
  var nodeapi = new Node('', '', config.apihost, config.apisecure);
  nodeapi.status(function (err, data, original) {
    if (err) {
      log.error(err.message);
    }
    for (var i in data) {
      log.info(i, data[i].toString().bold);
    }
  });
}

var Status = {
  usage: usage,
  run: run
};

module.exports = Status;