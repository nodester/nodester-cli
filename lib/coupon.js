var node = require('nodester-api').nodester,
    config = require('./config'),
    log = require('./log');


module.exports = {
    usage: function() {
        log.usage('coupon <email address> - Request a coupon code for access');
    },
    run: function(args) {
        if (!args.length) {
            //log.error('Email address is required..');
            this.usage();
            return;
        }
        var email = args[0];
        log.info('Requesting coupon code for: ' + email);
        var nodeapi = new node("", "", process.nodester.apihost, config.apisecure);

        nodeapi.coupon_request(email, function (err, data) {
            if (err) {
                log.error(err);
            }
            var s = data.status;
            if (s.indexOf('success') === 0) {
                s = s.replace('success', '');
                log.info('SUCCESS'.green.bold + s);
            } else {
                log.info(data.status);
            }
        });
        
    }
}
