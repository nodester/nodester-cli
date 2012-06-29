/*
* nodester-cli
* A CLI tool to allow interaction with the http://nodester.com/ platform.
* @division commands
*/
/*jshint node:true, noempty:true, laxcomma:true, laxbreak:false */

"use strict";

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
  var pack = require(path.join(__dirname, '..', 'package.json'));
} catch (e) {
  var pack = {
    version: 'unknown'
  };
}

require('./config').parse();



var commands = {
  status    : require('./status'),
  coupon    : require('./coupon'),
  apps      : require('./apps'),
  app       : require('./app'),
  user      : require('./user'),
  appdomain : require('./appdomain'),
  domain    : require('./appdomain'),
  npm       : require('./npm'),
  appnpm    : require('./npm'),
  env       : require('./env'),
  client    : require('./client'),
  version : {
    run: function() {
        log.plain(pack.version);
    }
  },
  help: {
    usage: function(args) {
      if (args && args[0] && args[0].toLowerCase() === 'all') {
        showUsage();
      } else {
        showHelp(args);
      }
    }
  },
  authors: {
    usage: function(){
      log.plain(["",
                '                          _          _                 ',
                '          _ __   ___   __| | ___ ___| |_ ___ _ __      ',
                "         | '_ \\ / _ \\ / _  |/ _ \\ __| __/ _ \\ '__| ",
                '         | | | | (_) | (_| |  __\\__ \\ |_  __/ |      ',
                '         |_| |_|\\___/ \\__,_|\\___|___/\\__\\___|_|   '].join('\n').bold.yellow+
                '\n\n'+                                               
                '         Open Source Node.js Hosting Platform.   \n'.bold.white+
                '              http://github.com/nodester"\n');

      if (typeof pack.author === 'object'){
        pack.author = pack.author.name + ' ' + pack.author.email;
      }
      log.plain('       * ' + pack.author);
      pack.contributors.sort().forEach(function(author){
        if (typeof author === 'object') {
          author = author.name + ' ' + author.email;
        }
        log.plain('       * ' + author);
      });
      log.plain('\n');
      log.info(' Bug report on: http://github.com/nodester/nodester-cli/issues');
      log.info('ok!'.green.bold);
    }
  }
};

var versions = ['v','--v','-v','-version','--version','VERSION'];

for (var key in versions){
  commands[versions[key]] = commands.version;
}

function run (cmds, command) {
  function tail (args){
    if(log.inTest){
      // mocha args

      args.pop();
      args.pop();
    }
    return args;
  }

  if (!command) {
    showHelp(commands);
    process.exit(1);
  }

  if (!cmds[command] && cfg.appname) {
    command = 'app';
    process.argv.unshift('app');
  }

  if (cmds[command]) {

    if (cmds[command][process.argv.slice(1)[0]]) {
      cmds[command][process.argv.slice(1)[0]](tail(process.argv.slice(2)));
    } else if (cmds[command].run) {
      cmds[command].run(tail(process.argv.slice(1)) || 'usage');
    } else {
      var args = tail(process.argv.slice(1));
      
      if (args.length && !cmds[args]){
        log.warn('Run > nodester '+ command + ' usage ');
        log.error('command not found: ' + args);
      } else if (!log.inTest) {
        if (command == 'help' && args){
          return cmds.help.usage(args);
        } else {
          log.info(command, 'usage:');
          return cmds[command] && cmds[command].usage && cmds[command].usage();  
        }
      } else {
        log.info('Dieing cleanly');
      }
    }
  } else {
    log.warn('Run > nodester '+ command + ' usage ');
    log.error('command not found: ' + command);    
  }
}

function showHelp (args) {

  var cmds = commands;
  var target = cmds[args[0]];
  if (args && target && (target.usage || target.run)) {    
    return (target.usage && target.usage()) || (target.run && target.run());
  } else {
    log.info('');
    log.info(' \t\t\tNodester'.bold.yellow);
    log.info(' Open Source Node.js Hosting Platform.');
    log.info(' showing all available commands:');
    log.info('');

    for (var i in cmds) {
        if (cmds[i].usage) {
            log.info('\t' + process.nodester.brand.grey + ' ' + i);
        }
    }
    log.info('');
    log.info('For more help, type', cfg.brand, 'help <command>');
    log.info('ok!'.green);
  }
}

function showUsage () {
  log.info('show usage');
  var cmds = commands;
  for (var i in cmds) {
    if (cmds[i].usage) {
      cmds[i].usage();
    }
  }
}

module.exports = {
  commands : commands,
  run      : run,
  showHelp : showHelp,
  log      : log
};
