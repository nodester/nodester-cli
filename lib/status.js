/*
* nodester-cli
* A CLI tool to allow interaction with the http://nodester.com/ platform.
* @division status
*/

var node   = require('nodester-api').nodester
  , config = require('./config')
  , log    = require('./log')
  ;

var Status = module.exports;

Status.usage = function () {
  log.usage('status - Show', config.brand, 'API status');
};

Status.run = function () {
  log.info('checking api status for:', config.apihost);
  var nodeapi = new node('', '', config.apihost, config.apisecure);
  nodeapi.status(function (err, data, original) {
    if (err) {
      log.error(err.message);
    }
    for (var i in data) {
      log.info(i, data[i].toString().bold);
    }
  });
};
