var node = require('nodester-api').nodester,
    config = require('./config'),
    log = require('./log'),
    exec = require('child_process').exec,
    fs = require('fs');


module.exports = {
    usage: function() {
        log.usage('<appname> is not required if inside an app directory after you call setup');
        log.usage('app setup <appname> - Configure this app for future app commands');
        log.usage('app info <appname> - Returns app specific information');
        log.usage('app logs <appname> - Returns app logs');
        log.usage('app stop|start|restart <appname> - Controls app status.');
        log.usage('app create <appname> <startfile> - Creates a new app named <appname>, <startfile> is optional.');
        log.usage('app init <appname> - Fetches the remote repo and sets it up.');
        log.usage('app clone <appname> - Fetches the remote repo.');
    },
    setup: function(args) {
        if (!args.length) {
            log.error('appname required');
        }
        config.writeApp(args[0]);
    },
    info: function(args) {
        config.check();
        var appname = config.appname;
        if (args.length) {
            appname = args[0];
        }
        log.info('Gathering information about:', appname);
        var nodeapi = new node(config.username, config.password, config.apihost, config.apisecure);
        nodeapi.app_info(appname, function (err, data) {
            if (err) {
                log.error(err.message);
            }
            var l = 'info', r = data.running;
            if (data.running == false || data.running.indexOf('error') > -1 || data.running.indexOf('failed-to-stop') > -1) {
                l = 'warn';
                if (r === false) {
                    r = 'false'
                }
                r = r.red;
            }
            var pid = '';
            if (data.pid) {
                pid = '(pid: ' + data.pid + ')';
            }
            log[l](appname, 'on port', data.port, 'running:', r.bold, pid);
            log.info('gitrepo:', data.gitrepo);
            log.info('appfile:', data.start);
        });
    },
    logs: function(args) {
        config.check();
        var appname = config.appname;
        if (args.length) {
            appname = args[0];
        }
        
        var nodeapi = new node(config.username, config.password, config.apihost, config.apisecure);
        nodeapi.app_logs(appname, function (err, data) {
            if (err) {
                log.error(err.message);
            }
            if (data.lines && data.lines.length && data.lines[0] !== '') {
                log.info('Showing logs for:', appname);
                data.lines.forEach(function(l) {
                    log.plain(l);
                });
            } else {
                log.warn('no log data returned.');
            }
        });
    
    },
    stop: function(args) {
        config.check();
        var appname = config.appname;
        if (args.length) {
            appname = args[0];
        }
        log.info('Attemping to stop app:', appname);
        var nodeapi = new node(config.username, config.password, config.apihost, config.apisecure);
        nodeapi.app_stop(appname, function (err, data) {
            if (err) {
                log.error(err.message);
            }
            if (data.status == "success") {
                log.info('app stopped.');
            } else {
                log.warn(data.status);
            }
        });
    },
    start: function(args) {
        config.check();
        var appname = config.appname;
        if (args.length) {
            appname = args[0];
        }
        log.info('Attemping to start app:', appname);
        var nodeapi = new node(config.username, config.password, config.apihost, config.apisecure);
        nodeapi.app_start(appname, function (err, data) {
            if (err) {
                log.error(err.message);
            }
            if (data.status == "success") {
                log.info('app started.'.bold.green);
            } else {
                log.warn(data.status);
            }
        });
    },
    restart: function(args) {
        config.check();
        var appname = config.appname;
        if (args.length) {
            appname = args[0];
        }
        log.info('Attemping to restart app:', appname);
        var nodeapi = new node(config.username, config.password, config.apihost, config.apisecure);
        nodeapi.app_restart(appname, function (err, data) {
            if (err) {
                log.error(err.message);
            }
            if (data.status == "success") {
                log.info('app restarted.'.bold.green);
            } else {
                log.warn(data.status);
            }
        });
    },
    create: function(args) {
        config.check();
        if (!args.length) {
            log.error('give this app a name');
        }
        var name = args[0];
        var start = args[1] || 'server.js';
        log.info('creating app:', name, start);
        
        var nodeapi = new node(config.username, config.password, config.apihost, config.apisecure);
        nodeapi.app_create(name, start, function (err, data) {
            if (err) {
                log.error(err.message);
            }
            if (data.status == "success") {
                log.info('successfully created app', name.bold, 'to will run on port', ((data.port) + '').bold, 'from', start.bold);
                log.info('run', config.brand, 'app init', name, ' to setup this app.');
            } else {
                log.error(data.status);
            }
        });
    },
    init: function(args) {
        config.check();
        if (args.length) {
            var appname = folder = args[0];
            if (args[1]) {
                folder = args[1];
            }
        }
        log.info('initializing git repo for', appname, 'into folder', folder);
        try {
            fs.mkdirSync(folder, 0750);
        } catch (e) {
            log.error(e.toString());
        }
        var nodeapi = new node(config.username, config.password, config.apihost, config.apisecure);
        nodeapi.app_info(appname, function (err, data) {
            if (err) {
                log.error(err.message);
            }
            log.info('cloning the repo', 'git clone ' + data.gitrepo + ' ' + folder);
            var child = exec('git clone ' + data.gitrepo + ' ' + folder, function (error, stdout, stderr) {
                var rcfile = config.writeApp(appname, folder);
                fs.writeFileSync(folder + '/.gitignore', rcfile + "\n");

                fs.writeFileSync(folder + '/' + data.start,
                    "var http = require('http');\n" +
                    "http.createServer(function (req, res) {\n" +
                    "  res.writeHead(200, {'Content-Type': 'text/plain'});\n" +
                    "  res.end('Hello World\\nApp (" + appname + ") is running..');\n" +
                    "}).listen(" + data.port + ");\n"
                );

                var child2 = exec('cd ' + folder + '; git add ' + data.start + ' .gitignore; git commit -m "Init via ' + config.brand + '"; git push origin master; ', function (error, stdout, stderr) {
                    nodeapi.app_stop(appname, function (err, data) {
                        if (err) {
                            log.error(err.message);
                        }
                        if (data.status == "success") {
                            log.info(appname, "stopped.");
                        } else {
                            log.warn(data.status);
                        }
                        log.info('attemping to start the new app.');
                        nodeapi.app_start(appname, function (err, data) {
                            if (err) {
                                log.error(err.message);
                            }
                            if (data.status == "success") {
                                log.info(appname, "started.");
                              } else {
                                log.warn(data.status);
                              }
                        });
                    });
                });
            });
        });
    },
    clone: function(args) {
        config.check();
        if (args.length) {
            var appname = folder = args[0];
            if (args[1]) {
                folder = args[1];
            }
        }
        log.info('initializing git repo for', appname, 'into folder', folder);
        try {
            fs.mkdirSync(folder, 0750);
        } catch (e) {
            log.error(e.toString());
        }
        var nodeapi = new node(config.username, config.password, config.apihost, config.apisecure);
        nodeapi.app_info(appname, function (err, data) {
            if (err) {
                log.error(err.message);
            }
            log.info('cloning the repo', 'git clone ' + data.gitrepo + ' ' + folder);
            var child = exec('git clone ' + data.gitrepo + ' ' + folder, function (error, stdout, stderr) {
                var rcfile = config.writeApp(appname, folder);
                fs.writeFileSync(folder + '/.gitignore', rcfile + "\n");
            });
        });

    }
}

