require('colors');

var level = process.env.NODESTER_LOGLEVEL || 0;

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
  }


var INTEST = process.nodester.env != 'production';
var log ={};
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
  }
} else {
  log.__proto__ = console;
}

exports.__defineGetter__('inTest', function() {
  return INTEST;
});
exports.plain = function () {
  log.log(strArgs(arguments));
}

exports.usage = function () {
  log.log(process.nodester.brand.magenta, strArgs(arguments));
}

exports.info = function () {
  log.log(process.nodester.brand.magenta, 'info'.white, strArgs(arguments));
}

exports.warn = function (str) {
  log.warn(process.nodester.brand.magenta, 'warn'.yellow, strArgs(arguments));
}

exports.error = function (str) {
  log.error(process.nodester.brand.magenta, 'ERROR'.red.inverse, strArgs(arguments));
  log.error(process.nodester.brand.magenta,'not ok!'.red.bold)
  INTEST ? true : process.kill(process.pid, 'SIGINT');
}
