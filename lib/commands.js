var log = require('./log');
    brand = "nodester",
    apihost = "api.nodester.com",
    apisecure = false,
    env = process.env,
    fs = require('fs');
    


process.argv = process.argv.slice(2);

if (env.NODESTER_APIHOST) {
    apihost = env.NODESTER_APIHOST;
}
if (env.NODESTER_APISECURE) {
    apisecure = true;
}
if (env.NODESTER_BRAND) {
    brand = env.NODESTER_BRAND;
}


var nodester_config = {
    apisecure: apisecure,
    apihost: apihost,
    brand: brand,
    appname: '',
    config: {
        username: '',
        password: ''
    }
};
if (!process.nodester) {
    process.nodester = {};
}
for (var i in nodester_config) {
    if (!process.nodester[i]) {
        process.nodester[i] = nodester_config[i];
    }
}

var path = require('path');
try {
var pack = JSON.parse(fs.readFileSync(path.join(__dirname, '../', 'package.json'), encoding='utf8'));
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

exports.commands.v = exports.commands.version;
exports.commands['-v'] = exports.commands.version;
exports.commands['-version'] = exports.commands.version;
exports.commands['--version'] = exports.commands.version;

exports.run = function(cmds, command) {
    if (!command) {
      showHelp(exports.commands);
      process.exit(1);
    }
    
    if (!cmds[command] && process.nodester.appname) {
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
        log.info('For more help, type', brand, 'help <command>');
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

