var node = require('nodester-api').nodester,
  path = require('path'),
  fs = require('fs'),
  exists = path.existsSync,
  config = require('./config'),
  log = require('./log');


module.exports = {
  usage: function () {
    log.usage('In a configured app dir, <appname> is optional.');
    log.usage('All arguments after install|update|uninstall  or appname will be sent to npm as packages.');
    log.usage('npm list - Lists the installed npm packages for this app.');
    log.usage('npm install <appname> <packages> - Installs the list of specified packages to this app.');
    log.usage('npm update <appname> <packages> - Update the list of specified packages to this app.');
    log.usage('npm uninstall <appname> <packages> - Removes the list of specified packages to this app.');
  },
  install: function (args) {
    config.check();
    var appname = config.appname,
      p = args;

    if (args.length && !appname) {
      appname = args[0];
      p = args.splice(1);
    }
    if (!p.length) {
      if (exists('package.json')) {
        log.info('grabbing dependencies from package.json...');
        var depen = JSON.parse(fs.readFileSync('package.json')).dependencies;
        if (!depen) {
          log.error('no depedencies found!');
        } else {
          p = [];
          for (dependency in depen) {
            p.push(dependency);
          }
        }
      } else {
        log.error('no packages to install!');
      }
    }
    log.info('installing to app:', appname);
    log.info('installing these npm packages:', p);
    var nodeapi = new node(config.username, config.password, config.apihost, config.apisecure);
    nodeapi.appnpm_install(appname, p.join(' '), function (err, data) {
      if (err) {
        log.error(err.message);
      }
      if (data.output) {
        var out = data.output.split('\n');
        out.forEach(function (l) {
          if (l.indexOf('stdout: ') === -1) {
            if (l.length > 1) {
              l = l.replace('stderr: ', '');
              l = l.split(' ');
              l[0] = l[0].magenta;
              if (l[1]) {
                if (l[1].toLowerCase() === 'warn') {
                  l[1] = l[1].red;
                } else if (l[1].toLowerCase() === 'erro') {
                  l[1] = l[1].red.inverse.bold;
                } else {
                  l[1] = l[1].white;
                }
              }
              log.usage(l.join(' '));
            }
          }
        });
      }
      log.plain('');
      log.warn('you should restart your app after you are finished installing packages.'.yellow.bold);
    });
  },
  list: function (args) {
    config.check();
    var appname = config.appname;
    if (args.length && !appname) {
      appname = args[0];
    }
    log.info('list npm packages for app:', appname);
    var nodeapi = new node(config.username, config.password, config.apihost, config.apisecure);
    nodeapi.appnpm_list(appname, function (err, data) {
      if (err) {
        log.error(err.message);
      }
      if (data.output) {
        var out = data.output.split('\n');
        out.forEach(function (l) {
          if (l.indexOf('stdout: ') === -1) {
            if (l.length > 1) {
              l = l.replace('stderr: ', '');
              l = l.split(' ');
              l[0] = l[0].magenta;
              if (l[1]) {
                l[1] = l[1].white;
              }
              log.usage(l.join(' '));
            }
          }
        });
      }
      log.plain('');
    });
  },
  update: function (args) {
    config.check();
    var appname = config.appname,
      p = args;

    if (args.length && !appname) {
      appname = args[0];
      p = args.splice(1);
    }
    if (!p.length) {
      log.error('no packages to install');
    }
    log.info('updating to app:', appname);
    log.info('updating these npm packages:', p);
    var nodeapi = new node(config.username, config.password, config.apihost, config.apisecure);
    nodeapi.appnpm_update(appname, p.join(' '), function (err, data) {
      if (err) {
        log.error(err.message);
      }
      if (data.output) {
        var out = data.output.split('\n');
        out.forEach(function (l) {
          if (l.indexOf('stdout: ') === -1) {
            if (l.length > 1) {
              l = l.replace('stderr: ', '');
              l = l.split(' ');
              l[0] = l[0].magenta;
              if (l[1]) {
                l[1] = l[1].white;
              }
              log.usage(l.join(' '));
            }
          }
        });
      }
      log.plain('');
      log.warn('you should restart your app after you are finished installing packages.'.yellow.bold);
    });
  },
  uninstall: function (args) {
    config.check();
    var appname = config.appname,
      p = args;

    if (args.length && !appname) {
      appname = args[0];
      p = args.splice(1);
    }
    if (!p.length) {
      log.error('no packages to install');
    }
    log.info('removing to app:', appname);
    log.info('removing these npm packages:', p);
    var nodeapi = new node(config.username, config.password, config.apihost, config.apisecure);
    nodeapi.appnpm_uninstall(appname, p.join(' '), function (err, data) {
      if (err) {
        log.error(err.message);
      }
      if (data.output) {
        var out = data.output.split('\n');
        out.forEach(function (l) {
          if (l.indexOf('stdout: ') === -1) {
            if (l.length > 1) {
              l = l.replace('stderr: ', '');
              l = l.split(' ');
              l[0] = l[0].magenta;
              if (l[1]) {
                l[1] = l[1].white;
              }
              log.usage(l.join(' '));
            }
          }
        });
      }
    });
  }
}
