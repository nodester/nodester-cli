/*
* nodester-cli
* A CLI tool to allow interaction with the http://nodester.com/ platform.
* @division coupon
*/
/*jshint node:true, noempty:true, laxcomma:true, laxbreak:false */

"use strict";

var Node   = require('nodester-api').nodester
  , config = require('./config')
  , log    = require('./log')
  ;


function usage () {
  log.info('');
  log.info('`nodester coupon`'.bold + ' Request your coupon!');
  log.usage('');
  log.usage('\tcoupon <email address> \t- Request a coupon code for access');
  log.usage('');
  log.info('ok!'.green);
}

function run (args) {
  if (!args.length) {
    usage();
    return;
  }
  var email = args[0];
  log.info('Requesting coupon code for: ' + email);
  var nodeapi = new Node("", "", process.nodester.apihost, config.apisecure);

  nodeapi.coupon_request(email, function (err, data, original) {
    if (err) {
      log.error(err.message);
    }
    var s = data.status;
    if (s.indexOf('success') === 0) {
      s = s.replace('success', '');
      log.info('SUCCESS'.green.bold + s);
    } else {
      log.info(err.message);
    }
  });
}

var Coupon = {
  usage: usage,
  run: run
};

module.exports = Coupon;