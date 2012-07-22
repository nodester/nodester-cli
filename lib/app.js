/*
* nodester-cli
* A CLI tool to allow interaction with the http://nodester.com/ platform.
* @division app
* 
*/

"use strict";

/*jshint node:true, noempty:true, laxcomma:true, laxbreak:false */

var exec   = require('child_process').exec
  , util   = require('util')
  , fs     = require('fs')
  , path   = require('path')
  , read   = require('read')
  , colors = require('colors')
  , Node   = require('nodester-api').nodester
  , config = require('./config')
  , exists = fs.existsSync || path.existsSync
  , log    = require('./log')
  ;

/* Shorthands */

var cfg = config
  , nodeapi = new Node(cfg.username, cfg.password, cfg.apihost, cfg.apisecure)
  ;


// Show the `app` help and usage
function usage() {
  log.info('');
  log.info(' `nodester app <commands>`'.bold + ' help you to interact with your applications on nodester.');
  log.info('  The availble commands are:  (Prefixed with nodester <command>) ');
  log.usage('');
  log.usage('\tapp or <appname> \t\t\t- is not required if inside an app directory after you call setup');
  log.usage('\tapp create <appname> <startfile> \t- Creates a new app named <appname>, <startfile> is optional. (default to `server.js`)');
  log.usage('\tapp init <appname> \t\t\t- Fetches the remote repo and sets it up.');
  log.usage('\tapp setup <appname> \t\t\t- Configure this dir for future app commands');
  log.usage('\tapp edit <appname> <newStartFile> \t\t\t- Change the start file for an app (appname is optional)');
  log.usage('\tapp info <appname> \t\t\t- Returns app specific information');
  log.usage('\tapp logs <appname> \t\t\t- Returns app logs');
  log.usage('\tapp stop|start|restart <appname> \t- Controls app status.');
  log.usage('\tapp destroy <appname> \t\t\t- Deletes the app.');
  log.usage('\tapp gitreset <appname> \t\t\t- Resets the app to git HEAD (in case you want a clean restart).');
  log.usage('\tapp clone <appname> \t\t\t- Fetches the remote repo.');
  log.usage('\tapp list \t\t\t\t- Returns the list of your apps');
  log.usage('');
  log.info('ok!'.green.bold);
}

// Create a new app
function create (args) {
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
}

// Delete the app
function destroy (args) {
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
}

// Init a folder or a fresh "hello world" app
function init (args) {

  /**
   * Configure new app 
   * @public: true
   * @api: true
  */

  config.check();
  var appname
    , folder
    , isWin = !!process.platform.match(/^win/)
    , cwd = isWin ? process.cwd() : process.env.PWD
    ;

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

  
  var question = 'nodester'.magenta + ' info ' +
                 'What do you want to do:\n(1) Setup a new app from scratch?' +
                 '\n(2) You just want to setup your existent app?\n'+'note:'.italic +
                 ' if you choose 2 be sure that you are into your app\'s dir\n'.bold;

  read({ prompt: question, 'default': 1}, function(err,res) {

    var isNewRep = false;
    
    if (res && res != 1 && res != 2) log.error('invalid option');

    if (res == 1 ) {

      log.info('initializing git repo for', appname, 'into folder', folder);
      isNewRep = true;
    } 
    
    

    nodeapi.app_info(appname, function (err, data, original) {
      
      if (err) {
        log.error(err.message);
        return;
      }

      if (/app\snot\sfound/g.test(data.status)){
        log.error('You can\'t init `'+ appname +'` it doesn\'t exists ');
        return;
      }

      var joinChar = ' ; ';

      // Config future commands

      
      
      log.warn('this will take a second or two');

      if (!isNewRep) {
        
        if (isWin)  joinChar = ' && ';
        var command = 'git remote add nodester ' + data.gitrepo + joinChar + ' echo "appname='+appname +'" > .appconfig ' ;
        exec(command, function(error){
          if (error){
            log.error(error);
            return;
          }

          config.writeApp(appname);

          log.info('Your app is now configured to work with nodester.');
          log.info('This app will be running on port ' + (data.port || '-') +
                   ' if you don\'t want to hardcode this port use `process.env["app_port"]` instead');
          log.info('Configured the remote `nodester` now you should push to that remote.');
          log.info('Some helpful app commands:\n');
          log.plain('     > cd ' + folder);
          log.plain('     > git add . ');
          log.plain('     > git commit -am "Ready to deploy"');
          log.plain('     > git push nodester master ');
          log.plain('     ', (config.brand + ' app info').yellow);
          log.plain('     ', (config.brand + ' app logs').yellow);
          log.plain('     ', (config.brand + ' app stop|start|restart').yellow);
          log.info('ok!'.green.bold);
        });

        return;
      } else {

        log.info('cloning your new app in '+ folder);

        exec('git clone https://github.com/nodester/defaultApp.git'+ ' ' + folder, function (error, stdout, stderr) {
          
          if (error) {
            return log.error(error);
          }

          log.info('clone complete');

          var packageJSON;
          try {
            // Back-support for olders versions
            packageJSON = require(cwd + '/' + folder + '/package.json');

          } catch (exp){

            var fullPath = path.resolve(cwd,folder,'package.json');
            packageJSON = JSON.parse(JSON.stringify(fs.readFileSync(fullPath,'utf8')));

          }
          
          /** Default package.json config  */
          config.brand
          packageJSON.name = appname;
          packageJSON.homepage = 'http://'+ appname + '.nodester.com';
          packageJSON.node = '0.8.1';
          packageJSON.author = config.username;

          log.info('writing the default configuration');

          var packPath = path.resolve(cwd,folder,'package.json');
          
          // Write the package.json
          fs.writeFileSync(packPath, JSON.stringify(packageJSON, null, 2), 'utf8');
          
          // Default server.js values
          var serverPath = path.resolve(cwd,folder,'server.js');
          var server = fs.readFileSync(serverPath,'utf8');

          server = server.replace(/\"\{\{APPPORT\}\}\"/g, data.port)
                         .replace(/\{\{APPNAME\}\}/g, appname);

          // write the new server.js file
          fs.writeFileSync(cwd + '/' + folder + '/server.js', server ,'utf8');

          var cmd = 'cd ' + path.resolve(process.env.PWD,folder)+
                  '&& git add .'+
                  '&& git remote set-url origin ' + data.gitrepo+
                  '&& git commit -am "Initial commit via ' + config.brand + '-cli"'+
                  '&& git push origin master'+
                  '&& nodester npm install ' + appname + ' express';

          log.info('processing the initial commit');

          exec(cmd, function (error, stdout, stderr) {
            if (error) {
              log.error(error);
              return;
            }
            if (stderr){
              log.info(stderr);
            }

            log.info(appname, "started.");
            log.info('Some helpful app commands:\n');
            log.plain('     cd ./' + folder);
            log.plain('     curl http://' + folder + '.'+ config.brand +'.com/');
            log.plain('     ', (config.brand + ' app info').yellow);
            log.plain('     ', (config.brand + ' app logs').yellow);
            log.plain('     ', (config.brand + ' app stop|start|restart').yellow);
            log.info('ok!'.green.bold);
          });
        });
      }
    });
  });
}

// Clone the app from nodester
function clone (args) {

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
    fs.mkdirSync(folder, "0750");
  } catch (e) {
    log.error(e.toString());
  }

  nodeapi.app_info(appname, function (err, data, original) {

    if (err) {
      log.error(err.message);
    }

    log.info('cloning the repo', 'git clone ' + data.gitrepo + ' ' + folder);

    exec('git clone ' + data.gitrepo + ' ' + folder, function (error, stdout, stderr) {

      if (error) {
        log.error(error);
        return;
      }

      var rcfile = config.writeApp(appname, folder);
      fs.writeFileSync(folder + '/.gitignore', rcfile + "\n");
      log.info('ok!'.green.bold);
    });

  });
}


// Create the .appconfig file for {APPNAME}
function setup (args) {
  if (!args.length) {
    log.error('appname required');
    return;
  }
  config.writeApp(args[0]);
}

// Show info about the {APPNAME}
function info (args) {
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
    if (!r) r = 'null';
    log[l](appname, 'on port', data.port, 'running:', r.bold, pid);
    log.info('gitrepo:', data.gitrepo);
    log.info('appfile:', data.start);
    log.info('ok!'.green.bold);
  });
}

// Start the app
function  start (args) {
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
}

// Stop the app in params
function stop (args) {
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
}

// Restart the app
function restart (args) {
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
}

// Get the logs from the running {APPNAME}
function logs (args) {
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
}

// Gitreset #nuffsaid
function gitreset (args) {
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
}

// Returns the list of apps

function list (args) {
  require(__dirname + '/apps').list(args);
}

// 
function changeAppStartFile (args) {
  config.check();
  var appname = config.appname,
      p = args;

  if (args.length && !appname || args.length === 2) {
    appname = args[0];
    p = args.splice(1);
  }

  if (!appname){
    log.error('appname required');
    return;
  }
  if (!p[0] || !p.length) return log.error('new start file is required');
  log.warn('Editing app start file for:', appname);
  nodeapi.app_edit(appname, p[0] , function (err, data, raw){
    if (err) return log.error(err.message);
    if (data.status === 'success') {
      log.info('Your new start file is:', data.start);
      log.info('Attemping to restart app:', appname);
      nodeapi.app_restart(appname, function (error, data2, original) {
        if (err) {
          return log.error(err.message);
        }
        if (data2.status == "success") {
          log.info('app restarted.'.bold.green);
          log.info('ok!'.green.bold);
        } else {
          log.warn(data2.status.red);
        }
      });
    } else {
      log.warn(data.status);
    }
  });
}

// Only exports one time 

var App = {
  usage    : usage,
  setup    : setup,
  info     : info,
  logs     : logs,
  stop     : stop,
  start    : start,
  restart  : restart,
  gitreset : gitreset,
  destroy  : destroy,
  create   : create,
  init     : init,
  clone    : clone,
  list     : list,
  edit     : changeAppStartFile
};

// Shorthands
App.u = App.usage;
App.s = App.setup;
App.i = App.info;
App.l = App.logs;
App.r = App.restart;
App.git = App.gitreset;
App.d = App.destroy;
App.c = App.create;

module.exports = App;
