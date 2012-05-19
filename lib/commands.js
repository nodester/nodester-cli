/*
* nodester-cli
* A CLI tool to allow interaction with the http://nodester.com/ platform.
* @division commands
*/

var fs = require('fs')
  , path = require('path')
  , log  = require('./log')
  , env  = process.env
  , cfg  = process.nodester || (process.nodester = {})
  ;

process.argv = process.argv.slice(2);

if (env.NODESTER_APIHOST) {
  cfg.apihost = env.NODESTER_APIHOST;
}

if (env.NODESTER_APISECURE) {
  cfg.apisecure = true;
}

if (env.NODESTER_BRAND) {
  cfg.brand = env.NODESTER_BRAND;
}


var defaults = {
  apisecure: false,
  apihost: 'api.nodester.com',
  brand: 'nodester',
  appname: '',
  config: {
      username: '',
      password: ''
  }
};

for (var i in defaults) {
  if (!cfg[i]) {
    cfg[i] = defaults[i];
  }
}


try {
  var pack = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'),'utf8'));
} catch (e) {
  var pack = {
    version: 'unknown'
  };
}

require('./config').parse();

exports.log = log;

exports.commands = {
  status: require('./status'),
  coupon: require('./coupon'),
  apps: require('./apps'),
  app: require('./app'),
  user: require('./user'),
  appdomain: require('./appdomain'),
  domain: require('./appdomain'),
  npm: require('./npm'),
  appnpm: require('./npm'),
  env: require('./env'),
  version: {
    run: function() {
        log.plain(pack.version);
    }
  },
  help: {
    run: function(args) {
      if (args[0] && args[0].toLowerCase() === 'all') {
          showUsage();
      } else {
          showHelp(args);
      }
    }
  }
};

var versions = ['v','--v','-version','--version'];

for (var key in versions){
  exports.commands[key] = exports.commands.version;
}

exports.run = function(cmds, command) {
  if (!command) {
    showHelp(exports.commands);
    process.exit(1);
  }

  if (!cmds[command] && cfg.appname) {
    command = 'app';
    process.argv.unshift('app');
  }

  if (cmds[command]) {
    if (cmds[command][process.argv.slice(1)[0]]) {
      cmds[command][process.argv.slice(1)[0]](process.argv.slice(2));
    } else if (cmds[command].run) {
      cmds[command].run(process.argv.slice(1));
    } else {
      if (cmds[command].usage) {
        cmds[command].usage();
      }
    }
  } else {
    log.error('command not found: ' + command);
  }
}


var showHelp = exports.showHelp = function(args) {
  var cmds = exports.commands;
  if (args && cmds[args[0]] && cmds[args[0]].usage) {
    cmds[args[0]].usage();
  } else {
    log.info('showing all available sub commands');
    for (var i in cmds) {
        if (cmds[i].usage) {
            log.usage(i);
        }
    }
    log.info('For more help, type', cfg.brand, 'help <command>');
  }
}

var showUsage = function () {
  log.info('show usage');
  var cmds = exports.commands;
  for (var i in cmds) {
    if (cmds[i].usage) {
      cmds[i].usage();
    }
  }
};

