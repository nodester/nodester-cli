var node = require('nodester-api').nodester,
    config = require('./config'),
    log = require('./log');


module.exports = {
    usage: function() {
        log.usage('In a configured app dir, <appname> is optional');
        log.usage('appdomain add <appname> <domainname> - Add a domain router for this app');
        log.usage('appdomain remove <appname> <domainname> - Remove a domain router from this app');
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
        var nodeapi = new node(config.username, config.password, config.apihost);
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
        var nodeapi = new node(config.username, config.password, config.apihost);
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
    }
}

