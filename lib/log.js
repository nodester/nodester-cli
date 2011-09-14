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

exports.plain = function () {
  console.log(strArgs(arguments));
}

exports.usage = function () {
  console.log(process.nodester.brand.magenta, strArgs(arguments));
}

exports.info = function () {
  console.log(process.nodester.brand.magenta, 'info'.white, strArgs(arguments));
}

exports.warn = function (str) {
  console.log(process.nodester.brand.magenta, 'warn'.yellow, strArgs(arguments));
}

exports.error = function (str) {
  console.log(process.nodester.brand.magenta, 'ERROR'.red.inverse, strArgs(arguments));
  process.exit(1);
}
