var node = require('nodester-api').nodester,
  config = require('./config'),
  log = require('./log');


module.exports = {
  usage: function () {
    log.usage('status - Show', config.brand, 'API status');
  },
  run: function () {
    log.info('checking api status for:', config.apihost);
    var nodeapi = new node('', '', config.apihost, config.apisecure);
    nodeapi.status(function (err, data, original) {
      if (err) {
        log.info(original);
      }
      for (var i in data) {
        log.info(i, data[i].toString().bold);
      }
    });
  }
}
