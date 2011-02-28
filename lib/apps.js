var node = require('nodester-api').nodester,
    config = require('./config'),
    log = require('./log');


module.exports = {
    usage: function() {
        log.usage('apps list - list all your registered apps');
    },
    run: function() {
        //Placeholder for later adding more `cmd apps` commands
        this.list();
    },
    list: function(args) {
        config.check();
        var nodeapi = new node(config.username, config.password, config.apihost, config.apisecure);
        nodeapi.apps_list(function (err, data) {
            if (err) {
                log.error(err);
            }
            if (data.length > 0) {
                for(var i in data) {
                    var l = 'info', r = data[i].running;
                    if (data[i].running == false || data[i].running == 'false' || data[i].running.indexOf('error') > -1 || data[i].running.indexOf('failed-to') > -1) {
                        l = 'warn';
                        if (r === false || r == 'false') {
                            r = 'false'
                        }
                        r = r.red;
                    }
                    log[l](data[i].name, 'on port', data[i].port, 'running:', r.bold);
                }
            } else {
                log.warn('no apps to report');
            }
        });
    }
}

