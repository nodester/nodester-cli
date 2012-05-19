/*
* nodester-cli
* A CLI tool to allow interaction with the http://nodester.com/ platform.
* @division apps
*/

var Node = require('nodester-api').nodester
  , config = require('./config')
  , log = require('./log')
  ;


var Apps = module.exports;

Apps.usage = function () {
  log.usage('apps list - list all your registered apps');
}

Apps.run = function () {
  //Placeholder for later adding more `cmd apps` commands
  this.list();
}

Apps.list = function (args) {
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
          var state = true;
        if (data[i].running == false || data[i].running == 'false' || state) {
          l = 'warn';
          if (r === false || r == 'false') {
            r = 'false'
          }
          r = r.red;
        }
        log[l](data[i].name, 'on port', data[i].port, 'running:', r.bold);
      }
    } else {
      log.warn('no apps to report');
    }
  });
}
