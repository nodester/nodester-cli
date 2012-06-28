
/*jshint node:true, noempty:true, laxcomma:true, laxbreak:false */

"use strict";

require('colors');

var util = require('util')
  , level = process.env.NODESTER_LOGLEVEL || 0
  ;

// https://github.com/joyent/node/blob/master/lib/util.js#L533
// #lazyweb

function extend (origin, add) {
  if (!add || typeof add !== 'object') return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
}

util._extend = util._extend || extend;

var strArgs = function (args) {
    if (args.length > 1) {
      var str = [];
      for (var i in args) {
        str.push(args[i]);
      }
      return str.join(' ');
    } else {
      return args[0];
    }
};


var INTEST = process.nodester.env != 'production'
  , log = {}
  ;


if (INTEST) {
  log = {
    log : function(arg){
      return true;
    },
    warn : function(arg){
      return false;
    },
    error: function(a,b,c){
      throw new Error(c);
    }
  };
} else {
  util._extend(log, console);
}

exports.__defineGetter__('inTest', function() {
  return INTEST;
});

exports.plain = function () {
  log.log(strArgs(arguments));
};

exports.usage = function () {
  log.log(process.nodester.brand.grey, strArgs(arguments));
};

exports.info = function () {
  log.log(process.nodester.brand.cyan, 'info'.white, strArgs(arguments));
};

exports.warn = function (str) {
  log.warn(process.nodester.brand.magenta, 'warn'.yellow, strArgs(arguments));
};

exports.error = function (str) {
  log.error(process.nodester.brand.magenta, 'ERROR'.red.inverse, strArgs(arguments));
  log.error(process.nodester.brand.magenta,'not ok!'.red.bold);
  if (!INTEST) return process.kill(process.pid, 'SIGINT');
};
