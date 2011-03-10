var node = require('nodester-api').nodester,
    config = require('./config'),
    log = require('./log');


module.exports = {
    usage: function() {
        log.usage('In a configured app dir, <appname> is optional');
        log.usage('appdomain add <appname> <domainname> - Add a domain router for this app');
        log.usage('appdomain remove <appname> <domainname> - Remove a domain router from this app');
        log.usage('appdomains - List domains');
    },
    add: function(args) {
        config.check();
        var appname = config.appname,
            domain;
        if (args.length) {
            if (args.length === 2) {
                domain = args[1];
                appname = args[0];
            } else {
                domain = args[0];
            }
        }
        if (!domain) {
            log.error('<domainname> required');
        } else if (!appname) {
            log.error('<appname> name required');
        }
        log.info('adding domain', domain, 'to', appname);
        var nodeapi = new node(config.username, config.password, config.apihost, config.apisecure);
        nodeapi.appdomain_add(appname, domain, function (err, data) {
            if (err) {
                log.error(err.message);
            }
            if (data.status == 'success') {
                log.info(data.message);
            } else {
                log.warn(data);
            }
        });
    },
    delete: function(args) {
        config.check();
        var appname = config.appname,
            domain;
        if (args.length) {
            if (args.length === 2) {
                domain = args[1];
                appname = args[0];
            } else {
                domain = args[0];
            }
        }
        if (!domain) {
            log.error('<domainname> required');
        } else if (!appname) {
            log.error('<appname> name required');
        }
        log.info('removing domain', domain, 'from', appname);
        var nodeapi = new node(config.username, config.password, config.apihost, config.apisecure);
        nodeapi.appdomain_delete(appname, domain, function (err, data) {
            if (err) {
                log.error(err.message);
            }
            if (data.status == 'success') {
                log.info(data.message);
            } else {
                log.warn(data);
            }
        });
    },
    run: function() {
        config.check();
        var nodeapi = new node(config.username, config.password, config.apihost, config.apisecure);
        nodeapi.appdomains(function (err, data) {
            if (err) {
                log.error(err);
            }
            if (data.length > 0) {
                data.forEach(function(i) {
					log.info(i.domain.white, 'aliased to app', i.appname.white, 'running on port', i.port);
                });
            } else {
                log.warn('no app domains to report');
            }
        });
    }

}
