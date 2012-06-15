/*
* nodester-cli
* A CLI tool to allow interaction with the http://nodester.com/ platform.
* @division app
*/

//"use strict";

var App = module.exports;

var exec   = require('child_process').exec
  , util   = require('util')
  , fs     = require('fs')
  , path   = require('path')
  , Node   = require('nodester-api').nodester
  , config = require('./config')
  , exists = path.existsSync
  , log    = require('./log')
  ;

/* Shorthands */

var cfg = config
  , nodeapi = new Node(cfg.username, cfg.password, cfg.apihost, cfg.apisecure)
  ;



App.usage = function () {
  log.usage('app or <appname> is not required if inside an app directory after you call setup');
  log.usage('app setup <appname> - Configure this dir for future app commands');
  log.usage('app info <appname> - Returns app specific information');
  log.usage('app logs <appname> - Returns app logs');
  log.usage('app stop|start|restart <appname> - Controls app status.');
  log.usage('app create <appname> <startfile> - Creates a new app named <appname>, <startfile> is optional.');
  log.usage('app delete <appname> - Deletes the app.');
  log.usage('app gitreset <appname> - Resets the app to git HEAD (in case you want a clean restart).');
  log.usage('app init <appname> - Fetches the remote repo and sets it up.');
  log.usage('app clone <appname> - Fetches the remote repo.');
  log.info('ok!'.green.bold);
};

App.setup =  function (args) {
  if (!args.length) {
    log.error('appname required');
    return;
  }
  config.writeApp(args[0]);
};

App.info = function (args) {
  config.check();
  var appname = config.appname;
  if (args.length) {
    appname = args[0].toLowerCase();
  }
  if (!appname){
    log.error('appname required');
    return;
  }
  log.info('Gathering information about:', appname);
  nodeapi.app_info(appname, function (err, data, original) {
    if (err) {
      log.error(err.message);
      return;
    } else if (data.status === 'failure - app not found (' + appname+')'){
      log.error(data.status);
      return;
    }

    var l = 'info'
      , r = data.running
      ;

    var state = false;
    if (data.running && data.running.hasOwnProperty('indexOf') &&  (data.running.indexOf('error') >-1|| data.running.indexOf('failed-to') > -1))
      state = true;
    if (data.running === false || state) {
      l = 'warn';
      if (r === false) {
        r = 'false';
      }
      r = r.red;
    }
    var pid = '';
    if (data.pid) {
      pid = '(pid: ' + data.pid + ')';
    }
    if (!r) r = 'null'
    log[l](appname, 'on port', data.port, 'running:', r.bold, pid);
    log.info('gitrepo:', data.gitrepo);
    log.info('appfile:', data.start);
    log.info('ok!'.green.bold);
  });
};

App.logs = function (args) {
  config.check();
  var appname = config.appname;
  if (args.length) {
    appname = args[0].toLowerCase();
  }

  if (!appname){
    log.error('appname required');
    return;
  }

  nodeapi.app_logs(appname, function (err, data, original) {
    if (err) {
      log.error(err.message);
    }
    if (data.lines && data.lines.length && data.lines[0] !== '') {
      log.info('Showing logs for:', appname);
      data.lines.forEach(function (l) {
        log.plain(l);
      });
      log.info('ok!'.green.bold);
    } else {
      log.warn('no log data returned.');
    }
  });

};

App.stop = function (args) {
  config.check();
  var appname = config.appname;
  if (args.length) {
    appname = args[0].toLowerCase();
  }

  if (!appname){
    log.error('appname required');
    return;
  }

  log.info('Attemping to stop app:', appname);

  nodeapi.app_stop(appname, function (err, data, original) {
    if (err) {
      log.error(err.message);
      return;
    }
    if (data.status == "success") {
      log.info('app stopped.');
      log.info('ok!'.green.bold);
    } else {
      log.warn(data.status);
    }
  });
};

App.start = function (args) {
  config.check();
  var appname = config.appname;
  if (args.length) {
    appname = args[0].toLowerCase();
  }

  if (!appname){
    log.error('appname required');
    return;
  }

  log.info('Attemping to start app:', appname);
  nodeapi.app_start(appname, function (err, data, original) {
    if (err) {
      log.error(err.message);
    }
    if (data.status == "success") {
      log.info('app started.'.bold.green);
      log.info('ok!'.green.bold);
    } else {
      log.warn(data.status);
    }
  });
};

App.restart =function (args) {
  config.check();
  var appname = config.appname;
  if (args.length) {
    appname = args[0].toLowerCase();
  }

  if (!appname){
    log.error('appname required');
    return;
  }

  log.info('Attemping to restart app:', appname);

  nodeapi.app_restart(appname, function (err, data, original) {
    if (err) {
      log.error(err.message);
    }
    if (data.status == "success") {
      log.info('app restarted.'.bold.green);
      log.info('ok!'.green.bold);
    } else {
      log.warn(data.status);
    }
  });
};

App.gitreset = function (args) {
  config.check();
  var appname = config.appname;
  if (args.length) {
    appname = args[0].toLowerCase();
  }

  if (!appname){
    log.error('appname required');
    return;
  }

  log.warn('resetting app:', appname);

  nodeapi.app_gitreset(appname, function (err, data, original) {
    if (err) {
      log.error(err.message);
    }
    if (data.status == "success") {
      log.warn('successfully reset app', appname.bold);
      log.info('ok!'.green.bold);
    } else {
      log.error(data.status);
    }
  });
};

App.delete = function (args) {
  config.check();
  var appname = config.appname;
  
  if (args.length) {
    appname = args[0].toLowerCase();
  }

  if (!appname){
    log.error('appname required');
    return false;
  }

  log.warn('deleting app:', appname);
  log.warn('Are you sure you want to do this?');
  log.plain('     Waiting 10 seconds before continuing, Ctrl+C to abort)');
  util.print('.');
  var timer = setInterval(function () {
    util.print('.');
  }, 1000);
  setTimeout(function () {
    clearInterval(timer);
    util.print('\n');
    log.warn('Really deleting app now, you were warned..');
    nodeapi.app_delete(appname, function (err, data, original) {
      if (err) {
        log.error(err.message);
        return;
      }
      if (data && data.status == "success") {
        log.warn('successfully deleted app', appname.bold);
        log.info('ok!'.green.bold);
      } else {
        log.warn(data.status);
      }
    });
  }, 10000);
};

App.create = function (args) {
  config.check();
  if (!args.length) {
    log.error('appname required');
    return;
  }

  var name = args[0].toLowerCase();
  var start = args[1] || 'server.js';

  log.info('creating app:', name, start);

  nodeapi.app_create(name, start, function (err, data, original) {
    if (err) {
      log.error(err.message);
    }

    if (data.status == "success") {
      log.info('successfully created app', name.bold, 'to will run on port', ((data.port) + '').bold, 'from', start.bold);
      log.info('run', (config.brand + ' app init ' + name).yellow.bold, 'to setup this app.');
      log.info('ok!'.green.bold);
    } else {
      log.error(data.status, ':', data.message);
    }
  });
};

App.init = function (args) {
  config.check();
  var appname
    , folder;

  if (!args.length) {
    log.error('appname required');
    return;
  } else {
    appname = args[0].toLowerCase();
    folder = appname;
    if (args[1]) {
      folder = args[1].toLowerCase();
    }
  }

  log.info('initializing git repo for', appname, 'into folder', folder);
  if (!exists(folder)) {
    try {
      fs.mkdirSync(folder, 0750);
    } catch (e) {
      log.error(e.toString());
    }
  }

  nodeapi.app_info(appname, function (err, data, original) {
    if (err) {
      log.error(err.message);
    }
    log.warn('this will take a second or two');
    log.info('cloning your new app in '+ folder);

    var child = exec('git clone https://github.com/nodester/defaultApp.git'+ ' ' + folder, function (error, stdout, stderr) {

      log.info('clone complete');

      var isWin = !!process.platform.match(/^win/);
      var cwd = isWin ? process.cwd() : process.env.PWD;
      
      try {
        var packageJSON = require(cwd + '/' + folder +'/package.json');
      } catch (exp){
        var packageJSON = JSON.parse(JSON.stringify(fs.readFileSync(cwd + '/' + folder+ '/package.json','utf8')));
      }
      /** Default package.json config  */
      packageJSON.name = appname;
      packageJSON.homepage = 'http://'+ appname + '.nodester.com';
      packageJSON.node = '0.6.17';
      packageJSON.author = config.username;

      log.info('writing the default configuration');
      fs.writeFileSync(cwd + '/' + folder + '/package.json', JSON.stringify(packageJSON,null,2),'utf8');
      /* Default server.js values */
      var server = fs.readFileSync(cwd + '/' + folder+ '/server.js','utf8');
      server = server.replace(/\"\{\{APPPORT\}\}\"/g, data.port)
                     .replace(/\{\{APPNAME\}\}/g, appname);
      fs.writeFileSync(cwd + '/' + folder + '/server.js', server ,'utf8');

      var cmd;
      if (isWin){
        cmd = 'cd ' + path.resolve(process.env.PWD,folder)+
              '&& git add .'+
              '&& git remote set-url origin ' + data.gitrepo+
              '&& git commit -am "Initial commit via ' + config.brand + '-cli"'+
              '&& git push origin master'+
              '&& nodester npm install ' + appname + ' express';
      } else {
        cmd = 'cd ' + path.resolve(process.env.PWD,folder) +
              '; git add .'+
              '; git remote set-url origin ' + data.gitrepo+
              '; git commit -am "Initial commit via ' + config.brand + '-cli"'+
              '; git push origin master'+
              '; nodester npm install ' + appname + ' express';
      }

      log.info('processing the initial commit');

      var child2 = exec(cmd, function (error, stdout, stderr) {
        if (error) {
          log.error(error);
          return;
        }
        if (stderr){
          log.info(stderr)
        }

        log.info(appname, "started.");
        log.info('Some helpful app commands:\n');
        log.plain('     cd ./' + folder);
        log.plain('     curl http://' + folder + '.nodester.com/');
        log.plain('     ', (config.brand + ' app info').yellow);
        log.plain('     ', (config.brand + ' app logs').yellow);
        log.plain('     ', (config.brand + ' app stop|start|restart').yellow);
        log.info('ok!'.green.bold);
      });
    });
  });
};

App.clone = function (args) {
  config.check();
  var folder
    , appname;

  if (args.length) {
    appname = folder = args[0].toLowerCase();
    if (args[1]) {
      folder = args[1].toLowerCase();
    }
  }

  if (!appname || !folder){
    log.error(appname ? 'folder doesn\'t exists' : 'appname required');
    return;
  }

  log.info('initializing git repo for', appname, 'into folder', folder);
  try {
    fs.mkdirSync(folder, 0750);
  } catch (e) {
    log.error(e.toString());
  }

  nodeapi.app_info(appname, function (err, data, original) {
    if (err) {
      log.error(err.message);
    }
    log.info('cloning the repo', 'git clone ' + data.gitrepo + ' ' + folder);
    var child = exec('git clone ' + data.gitrepo + ' ' + folder, function (error, stdout, stderr) {
      if (error) {
        log.error(error);
        return;
      }
      var rcfile = config.writeApp(appname, folder);
      fs.writeFileSync(folder + '/.gitignore', rcfile + "\n");
      log.info('ok!'.green.bold);
    });
  });
};
