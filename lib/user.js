/*
* nodester-cli
* A CLI tool to allow interaction with the http://nodester.com/ platform.
* @division status
*/

/*jshint node:true, noempty:true, laxcomma:true, laxbreak:false */

"use strict";

var fs        = require('fs')
  , path      = require('path')
  , iniparser = require('iniparser')
  , Node      = require('nodester-api').nodester
  , config    = require('./config')
  , log       = require('./log')
  , exists    = fs.existsSync || path.existsSync
  , tty       = tty = require('tty')
  ;
  

tty.setRawMode = process.stdin.setRawMode || tty.setRawMode ;

var info = {
  email: '',
  coupon: '',
  username: '',
  sshkey: ''
};



function usage () {
  log.info('');
  log.info('`nodester user <command>`'.bold + ' manage your credentials with the nodester api or create a new user');
  log.usage('');
  log.usage('\tuser register <coupon-code> \t\t- Register a user');
  log.usage('\tuser setup <username> <password> \t- Setup this user');
  log.usage('\tuser setpass sendtoken \t\t\t- Sends password reset token to user email');
  log.usage('\tuser setpass <token> <new_password> \t- Set a new password for this user');
  log.usage('\tuser setkey </path/to/sshkey> \t\t- Set an sshkey (if no argument, ~/.ssh/id_rsa.pub is used)');
  log.usage('\tuser create <username> <password> <email address> <file containing ssh public key> <coupon code> - Create a user');
  log.usage('');
  log.info('ok!'.green);
}

function create (args) {
  if (args.length < 5) {
    log.usage('user create <username> <password> <email address> <file containing ssh public key> <coupon code> - Create a user');
    log.error('All arguments are required');
  }

  var user   = args[0]
    , pass   = args[1]
    , email  = args[2]
    // , rsakey = args[3]
    // , coupon = args[4]
    ;

  log.info('creating user:', user, ' <' + email + '>');
  var nodeapi = new Node("", "", config.apihost, config.apisecure);
  args.push(function (err, data, original) {
    if (err) {
      
      log.error(err.message);
    }
    log.info('user successfully created');
    config.writeUser(user, pass);
  });
  nodeapi.user_create.apply(nodeapi, args);
}

function setKey (args) {
  config.check();
  var key = args[0];
  if (!key) {
    key = path.join(process.env.HOME, '.ssh', 'id_rsa.pub');
  }
  if (!exists(key)) {
    log.error('sshkey was not found:', key);
  }
  var rsadata = fs.readFileSync(key).toString();
  if (rsadata.length < 40) {
    log.error("Invalid SSH key file.");
  }

  log.info('sending sshkey:', key);
  var nodeapi = new Node(config.username, config.password, config.apihost, config.apisecure);
  nodeapi.user_setkey(rsadata, function (err, data, original) {
    if (err) {
      log.error(err.message);
    }
    log.info('ssh key successfully sent');
  });
}

function setPass (args) {
  var username, pass;
  if (args.length == 1 && args[0] == 'sendtoken'){
    return log.error('You need to provide a valid username');
  } else if (args.length == 2 && args[0] == 'sendtoken') {
    username = args[1];
  } else {
    config.check();
    username = config.username;
  }
  var nodeapi = new Node(username, config.apihost, config.apisecure);
  if (args.length == 1 && args[0] == 'sendtoken') {
    nodeapi.user_sendtoken(username, function (err, data, original) {
      if (err && !data) {
        log.error(err.message);
      } else {
        log.info(data.status);
        log.info('token for setpass has been sent to your email!');
      }
    });
  } else if (args.length == 2 && (args[1] != '' || args[1] != ' ')) {
    nodeapi.user_setpass(args[0], args[1], function (err, data, original) {
      if (err) {
        log.error(err.message);
      }
      log.info('password successfully changed.');
      config.writeUser(username, args[0]);
    });
  } else {
    log.error('Argument missing: ', 'setpass sendtoken or setpass <token> <new_password>');
  }
}

function setup (args) {
  // fix args
  args = args.map(function(v){ 
    return typeof v === 'string' ? v.trim(): v; 
  }).filter(Boolean);

  if (args.length < 2) {
    log.error('Argument missing: ', '<username> <password>');
  }

  var nodeapi = new Node(args[0], args[1], config.apihost, config.apisecure);
  log.info('verifying credentials');
  nodeapi.apps_list(function (err, data, original) {
    if (err) {
      
      log.error(err.message);
    }
    log.info('user verified..');
    config.writeUser(args[0], args[1]);
  });
}

function register (args) {
  if (!args.length) {
    log.error('Coupon Code Required');
  }
  if (args[1] && args[1].indexOf('@') > -1) {
    info.email = args[1];
  }
  if (!info.email && exists(path.join(process.env.HOME, '.gitconfig'))) {
    var git = iniparser.parseSync(path.join(process.env.HOME, '.gitconfig'));
    info.email = git.user.email;
  } else if (!info.email) {
    log.error('Could not find an email address as an argument or from your ~/.gitconfig, please pass one as an additional argument');
  }
  info.coupon = args[0];
  info.username = process.env.USER;
  var sshkey = path.join(process.env.HOME, '.ssh', 'id_rsa.pub');
  if (exists(sshkey)) {
    info.sshkey = sshkey;
  } else {
    log.error('Could not auto find your ssh key: ', sshkey, 'use <' + config.brand + ' user create> instead');
  }
  log.info('Registering with the following information:');
  for (var i in info) {
    log.info(i + ':', info[i]);
  }
  log.warn('Does this information look correct? [y/N]');
  log.info('(If it does not, hit Ctrl+C and use <' + config.brand + ' user create> instead)');
  var stdin = process.openStdin();
  stdin.setEncoding('utf8');
  stdin.addListener('data', function (data) {
    stdin.removeAllListeners('data');
    data = data.replace('\n', '').toLowerCase().substring(0, 1);
    if (data === 'y') {
      askPass(function (password) {
        if (!password) return log.error('Invalid password');
        info.password = password;
        log.info('creating user:', info.username, ' <' + info.email + '>');
        var nodeapi = new Node("", "", config.apihost, config.apisecure);
        nodeapi.user_create(info.username, info.password, info.email, info.sshkey, info.coupon, function (err, data, original) {
          if (err) {
            
            log.error(err.message);
          }
          log.info('user created..');
          config.writeUser(info.username, info.password);
        });
      });
    } else {
      log.error('aborting registration');
      stdin.pause();
    }
  });
}

function askPass (fn) {
  var stdin = process.openStdin();
  stdin.setEncoding('utf8');
  var p = [],
    c = '';
  console.log('Please enter your password:');
  if (!tty) {
    log.warn('Node version (' + process.version + ') has no tty module, passwords will be echoed to stdout');
    stdin.addListener('data', function (data) {
      data += '';
      data = data.replace('\n', '');
      p.push(data);
      if (p.length === 2) {
        if (p[0] !== p[1]) {
          p = [];
          log.warn('Passwords did not match, please try again.');
          console.log('Please re-enter your password:');
        } else {
          stdin.removeAllListeners('data');
          stdin.pause();
          fn(p[0]);
        }
      } else {
        console.log('Confirm password:');
      }
    });
  } else {
    if (!tty.setRawMode) tty.setRawMode = stdin.setRawMode;
    stdin.setRawMode(true);
    stdin.addListener('data', function (data) {
      data += '';
      switch (data) {
      case '\u0003':
        log.error('exiting from Ctrl+C');
        process.exit();
        break;
      case '\n':
      case '\r':
        p.push(c);
        c = '';
        if (p.length === 1) {
          console.log('\nConfirm password:');
        } else {
          if (p[0] === p[1]) {
            stdin.removeAllListeners('data');
            console.log('\n');
            tty.setRawMode(false);
            stdin.pause();
            fn(p[0]);
          } else {
            p = [];
            console.log('\n');
            log.warn('Passwords did not match, please try again.');
            console.log('Please re-enter your password:');
          }
        }
        break;
      default:
        process.stdout.write("*");
        c += data;
      }
    });
  }
}

var User = {
  usage: usage,
  create: create,
  setkey: setKey,
  setpass: setPass,
  setup: setup,
  register: register,
  askpass: askPass
};

module.exports = User;
