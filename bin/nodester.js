#!/usr/bin/env node

var node = require('nodester-api').nodester,
    path = require('path'),
    fs = require('fs'),
    sys = require('sys'),
    colors = require('colors'),
    log = require('../lib/log'),
    brand = "bejesus",
    apihost = "api.bejes.us",
    env = process.env;


if (env.NODESTER_APIHOST) {
    apihost = env.NODESTER_APIHOST;
}
if (env.NODESTER_BRAND) {
    brand = env.NODESTER_BRAND;
}

process.nodester = {
    apihost: apihost,
    brand: brand,
    appname: '',
    config: {
        username: '',
        password: ''
    }
};

//log.info('apihost: ' + apihost);

require('../lib/config').parse();

process.argv = process.argv.slice(2);

var showHelp = function(args) {
    if (args && cmds[args[0]] && cmds[args[0]].usage) {
        cmds[args[0]].usage();
    } else {
        log.info('showing all available sub commands');
        for (var i in cmds) {
            if (cmds[i].usage) {
                log.usage(i);
            }
        }
        log.info('For more help, type', brand, 'help <command>');
    }
}

var showUsage = function () {
    log.info('show usage');
    for (var i in cmds) {
        if (cmds[i].usage) {
            cmds[i].usage();
        }
    }
};


var command = process.argv[0],
    cmds = {
        status: require('../lib/status'),
        coupon: require('../lib/coupon'),
        apps: require('../lib/apps'),
        app: require('../lib/app'),
        user: require('../lib/user'),
        appdomain: require('../lib/appdomain'),
        domain: require('../lib/appdomain'),
        npm: require('../lib/npm'),
        appnpm: require('../lib/npm'),
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

if (!command) {
  showHelp();
  process.exit(1);
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
